import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
    existsSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    readdirSync,
    rmSync,
    writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
    fullSha,
    packageName,
    preflightBoth,
    repository,
    stableVersion,
    validateSourceRun,
    validateTag,
    workflowPath,
} from './release-policy.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const workspace = resolve(root, 'packages/ui-extensions-core')
const [command, directory = 'release-artifact', destination] = process.argv.slice(2)
const output = resolve(directory)
const run = (bin, args, options = {}) =>
    execFileSync(bin, args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, ...options }).trim()
const json = (path) => JSON.parse(readFileSync(path, 'utf8'))
const digest = (bytes, algorithm = 'sha256', encoding = 'hex') =>
    createHash(algorithm).update(bytes).digest(encoding)
const api = (path) => JSON.parse(run('gh', ['api', `repos/${repository}/${path}`]))
const sourceFile = (path, sha) =>
    Buffer.from(api(`contents/${path}?ref=${sha}`).content, 'base64').toString('utf8')
const filename = (version) => `todoist-ui-extensions-core-${version}.tgz`

function inspect(tarball) {
    const files = run('tar', ['-tzf', tarball]).split('\n')
    assert.equal(new Set(files).size, files.length, 'Duplicate tar entries')
    for (const file of files) {
        assert.ok(
            /^package\/(package\.json|README\.md|LICENSE|dist\/(cjs|esm|types)\/[a-zA-Z0-9_./-]+)$/.test(
                file,
            ),
            `Unexpected packed file: ${file}`,
        )
        assert.ok(!file.split('/').includes('..'))
        assert.ok(!/\.(test|spec)\.|\.tsbuildinfo$/.test(file))
    }
    for (const entry of ['dist/cjs/index.js', 'dist/esm/index.js', 'dist/types/index.d.ts'])
        assert.ok(files.includes(`package/${entry}`), `Missing ${entry}; build before packing`)
    const manifest = JSON.parse(run('tar', ['-xOzf', tarball, 'package/package.json']))
    assert.equal(manifest.name, packageName)
    assert.match(manifest.version, stableVersion)
    assert.equal(manifest.private, undefined)
    assert.equal(
        manifest.publishConfig,
        undefined,
        'Routing must not be embedded in the shared tarball',
    )
    assert.equal(manifest.repository, `https://github.com/${repository}`)
    // Dependency metadata is checked against the ORIGINAL source manifest below,
    // never against evolving current-main dependency versions (recovery schema v1).
    const bytes = readFileSync(tarball)
    return {
        manifest,
        sha256: digest(bytes),
        integrity: `sha512-${digest(bytes, 'sha512', 'base64')}`,
    }
}

function verify(directory) {
    const metadata = json(resolve(directory, 'release.json'))
    assert.equal(
        metadata.schema,
        1,
        'Unsupported artifact schema: preserve ORIGINAL bytes and request reviewed recovery; never repack an existing version',
    )
    assert.equal(metadata.name, packageName)
    assert.match(metadata.version, stableVersion)
    assert.match(metadata.sourceSha, fullSha)
    assert.equal(metadata.repository, repository)
    assert.equal(metadata.workflow, workflowPath)
    assert.equal(metadata.filename, filename(metadata.version))
    assert.equal(metadata.sourceSha, process.env.RELEASE_SHA)
    assert.equal(metadata.version, process.env.RELEASE_VERSION)
    assert.equal(String(metadata.runId), process.env.ARTIFACT_RUN_ID)
    const tarball = resolve(directory, metadata.filename)
    const actual = inspect(tarball)
    assert.equal(actual.manifest.version, metadata.version)
    assert.equal(actual.sha256, metadata.sha256)
    assert.equal(actual.integrity, metadata.integrity)
    return { metadata, tarball, manifest: actual.manifest }
}

async function downloadOriginal(directory) {
    const runId = process.env.ARTIFACT_RUN_ID || ''
    const sha = process.env.RELEASE_SHA || ''
    assert.match(runId, /^[1-9][0-9]*$/)
    assert.match(sha, fullSha)
    assert.match(process.env.RELEASE_VERSION || '', stableVersion)
    const sourceRun = api(`actions/runs/${runId}`)
    assert.equal(String(sourceRun.id), runId)
    const workflow = api('actions/workflows/core-pack.yml')
    await validateSourceRun(sourceRun, workflow.id, sha, async (base, head) =>
        api(`compare/${base}...${head}`),
    )
    // Historical reviewed workflow identity, NOT equality with evolving current-main bytes.
    const historicalWorkflow = sourceFile(workflowPath, sha)
    assert.ok(
        historicalWorkflow.includes('run-name: ui-extensions-core pack v1 ${{ github.sha }}'),
        'Unsupported historical protocol: retain original bytes for reviewed manual recovery',
    )
    const artifacts = api(`actions/runs/${runId}/artifacts?per_page=100`).artifacts.filter(
        (item) => item.name === 'ui-extensions-core-release',
    )
    assert.equal(artifacts.length, 1, 'Require one original retained release artifact')
    const artifact = artifacts[0]
    assert.equal(
        artifact.expired,
        false,
        'Artifact expired: restore the original archived artifact; never rebuild an existing release',
    )
    assert.equal(String(artifact.workflow_run.id), runId)
    assert.equal(artifact.workflow_run.head_sha, sha)
    assert.match(artifact.digest, /^sha256:[a-f0-9]{64}$/)
    mkdirSync(directory, { recursive: true })
    assert.deepEqual(readdirSync(directory), [], 'Download into an empty directory')
    const archive = resolve(directory, 'artifact.zip')
    const bytes = execFileSync(
        'gh',
        ['api', `repos/${repository}/actions/artifacts/${artifact.id}/zip`],
        { maxBuffer: 32 * 1024 * 1024 },
    )
    assert.equal(`sha256:${digest(bytes)}`, artifact.digest)
    writeFileSync(archive, bytes)
    const entries = run('unzip', ['-Z1', archive]).split('\n').sort()
    const expected = ['release.json', filename(process.env.RELEASE_VERSION)].sort()
    assert.deepEqual(entries, expected, 'Unexpected artifact archive contents')
    // Read only the two expected files; never extract archive paths or symlinks.
    for (const entry of entries)
        writeFileSync(
            resolve(directory, entry),
            execFileSync('unzip', ['-p', archive, entry], { maxBuffer: 32 * 1024 * 1024 }),
        )
    rmSync(archive)
    const release = verify(directory)
    assert.deepEqual(
        release.manifest,
        JSON.parse(sourceFile('packages/ui-extensions-core/package.json', sha)),
        'Packed manifest differs from reviewed source',
    )
    return release
}

const registries = { npmjs: 'https://registry.npmjs.org/', github: 'https://npm.pkg.github.com/' }
async function readUrl(url, token, allowMissing = false) {
    const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        redirect: 'error',
        signal: AbortSignal.timeout(30000),
    })
    if (response.status === 404 && allowMissing) return undefined
    assert.equal(
        response.status,
        200,
        `Registry/access ambiguity at ${url}: HTTP ${response.status}; no write permitted`,
    )
    return response
}

export async function readTarball(initialUrl, token) {
    let url = new URL(initialUrl)
    const registryOrigin = url.origin
    for (let redirects = 0; redirects <= 3; redirects++) {
        assert.equal(url.protocol, 'https:')
        assert.equal(url.username + url.password, '')
        assert.ok(
            url.origin === registryOrigin ||
                (registryOrigin === 'https://npm.pkg.github.com' &&
                    url.origin === 'https://pkg-npm.githubusercontent.com'),
            'Unexpected registry tarball redirect host',
        )
        const response = await fetch(url, {
            headers:
                token && url.origin === registryOrigin ? { Authorization: `Bearer ${token}` } : {},
            redirect: 'manual',
            signal: AbortSignal.timeout(30000),
        })
        if ([301, 302, 303, 307, 308].includes(response.status)) {
            assert.ok(response.headers.get('location'), 'Missing tarball redirect location')
            url = new URL(response.headers.get('location'), url)
            continue
        }
        assert.equal(response.status, 200, `Tarball HTTP ${response.status}; no write permitted`)
        return Buffer.from(await response.arrayBuffer())
    }
    throw new Error('Too many tarball redirects; no write permitted')
}

async function inspectRegistry(name, metadata) {
    const token = name === 'github' ? process.env.GH_PACKAGES_TOKEN : undefined
    if (name === 'github') {
        assert.ok(
            token,
            'GH_PACKAGES_TOKEN read access is required even for npm-only/interactive publication',
        )
        const response = await readUrl(
            'https://api.github.com/orgs/todoist/packages/npm/ui-extensions-core',
            token,
        )
        const pkg = await response.json()
        assert.equal(
            pkg.visibility,
            'public',
            'Preserve existing public GitHub visibility; ask package administrator',
        )
        assert.equal(pkg.repository.full_name.toLowerCase(), repository)
    }
    const response = await readUrl(
        `${registries[name]}${encodeURIComponent(packageName)}`,
        token,
        name === 'npmjs',
    )
    if (!response) return { tags: {} }
    const packument = await response.json()
    assert.equal(packument.name, packageName)
    assert.ok(packument.versions && typeof packument.versions === 'object')
    assert.ok(packument['dist-tags'] && typeof packument['dist-tags'] === 'object')
    const copy = packument.versions[metadata.version]
    if (!copy) return { tags: packument['dist-tags'] }
    assert.equal(copy.name, packageName)
    assert.equal(copy.version, metadata.version)
    const url = new URL(copy.dist.tarball)
    assert.equal(
        url.origin,
        new URL(registries[name]).origin,
        'Do not send registry credentials to another host',
    )
    const tarball = await readTarball(url, token)
    const integrity = `sha512-${digest(tarball, 'sha512', 'base64')}`
    if (copy.dist.integrity) assert.equal(copy.dist.integrity, integrity)
    return { integrity, tags: packument['dist-tags'] }
}

export async function publish(release, selected, interactive) {
    assert.ok(Object.hasOwn(registries, selected), 'Choose npmjs or github')
    if (interactive) {
        assert.notEqual(process.env.GITHUB_ACTIONS, 'true')
        assert.ok(
            process.stdin.isTTY && process.stdout.isTTY,
            'Bootstrap login AND publish require a real terminal for 2FA',
        )
    }
    const { metadata, tarball } = release
    const preflight = () =>
        preflightBoth((name) => inspectRegistry(name, metadata), metadata.integrity)
    await preflight()
    const isolated = mkdtempSync(resolve(tmpdir(), 'ui-extensions-publish-'))
    try {
        const registry = registries[selected]
        const env = Object.fromEntries(
            Object.entries(process.env).filter(
                ([key]) =>
                    !/^(npm_config_|node_auth_token$|npm_token$|gh_packages_token$|gh_token$|github_token$)/i.test(
                        key,
                    ),
            ),
        )
        const userconfig = resolve(isolated, 'user.npmrc')
        const globalconfig = resolve(isolated, 'global.npmrc')
        let auth = ''
        if (selected === 'github') {
            env.GH_PACKAGES_TOKEN = process.env.GH_PACKAGES_TOKEN
            auth = '//npm.pkg.github.com/:_authToken=${GH_PACKAGES_TOKEN}\n'
        }
        writeFileSync(
            userconfig,
            `registry=${registry}\n@todoist:registry=${registry}\nprovenance=false\n${auth}`,
            { mode: 0o600 },
        )
        writeFileSync(globalconfig, '')
        Object.assign(env, {
            NPM_CONFIG_USERCONFIG: userconfig,
            NPM_CONFIG_GLOBALCONFIG: globalconfig,
        })
        const options = { cwd: isolated, env, stdio: 'inherit' }
        if (interactive)
            execFileSync('npm', ['login', '--auth-type=web', `--registry=${registry}`], options)
        // Recheck both exact copies immediately before the only registry write, after any 2FA login.
        const copies = await preflight()
        if (copies[selected].integrity !== undefined) {
            console.log(
                `${metadata.name}@${metadata.version} already matches on ${selected}; no write`,
            )
            return
        }
        const tag = process.env.RELEASE_TAG || 'latest'
        validateTag(metadata.version, tag, copies[selected].tags.latest)
        execFileSync(
            'npm',
            [
                'publish',
                tarball,
                '--ignore-scripts',
                `--registry=${registry}`,
                `--tag=${tag}`,
                '--access=public',
                '--provenance=false',
            ],
            options,
        )
        const after = await preflight()
        assert.equal(
            after[selected].integrity,
            metadata.integrity,
            'Publication may have succeeded; retain artifact and inspect before retry',
        )
        assert.equal(after[selected].tags[tag], metadata.version)
        if (tag !== 'latest')
            assert.equal(after[selected].tags.latest, copies[selected].tags.latest)
        console.log(`${metadata.name}@${metadata.version} verified on ${selected}`)
    } finally {
        rmSync(isolated, { recursive: true, force: true })
    }
}

async function main() {
    if (command === 'pack') {
        assert.equal(process.env.GITHUB_REPOSITORY?.toLowerCase(), repository)
        assert.equal(process.env.GITHUB_EVENT_NAME, 'workflow_dispatch')
        assert.equal(process.env.GITHUB_REF, 'refs/heads/main')
        assert.equal(
            process.env.GITHUB_RUN_ATTEMPT,
            '1',
            'Never rerun a pack; reuse its original artifact',
        )
        const sourceSha = run('git', ['rev-parse', 'HEAD'], { cwd: root })
        assert.equal(sourceSha, process.env.GITHUB_SHA)
        assert.equal(
            run('git', ['status', '--porcelain', '--untracked-files=no'], { cwd: root }),
            '',
        )
        assert.ok(!existsSync(output), 'Use a fresh artifact directory')
        mkdirSync(output)
        const [packed] = JSON.parse(
            run('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', output], {
                cwd: workspace,
            }),
        )
        const { manifest, ...checksums } = inspect(resolve(output, packed.filename))
        assert.equal(packed.filename, filename(manifest.version))
        const metadata = {
            schema: 1,
            repository,
            workflow: workflowPath,
            sourceSha,
            runId: process.env.GITHUB_RUN_ID,
            name: manifest.name,
            version: manifest.version,
            filename: packed.filename,
            ...checksums,
        }
        writeFileSync(resolve(output, 'release.json'), `${JSON.stringify(metadata, null, 2)}\n`)
        console.log(JSON.stringify(metadata, null, 2))
    } else if (command === 'download') {
        console.log(JSON.stringify((await downloadOriginal(output)).metadata, null, 2))
    } else if (['verify', 'publish', 'bootstrap-npm'].includes(command)) {
        const local = verify(output)
        const original = mkdtempSync(resolve(tmpdir(), 'ui-extensions-original-'))
        try {
            const retained = await downloadOriginal(original)
            assert.deepEqual(
                local.metadata,
                retained.metadata,
                'Use the ORIGINAL successful run artifact',
            )
            assert.equal(local.metadata.integrity, retained.metadata.integrity)
            if (command === 'verify') console.log(JSON.stringify(retained.metadata, null, 2))
            else
                await publish(
                    retained,
                    command === 'bootstrap-npm' ? 'npmjs' : destination,
                    command === 'bootstrap-npm',
                )
        } finally {
            rmSync(original, { recursive: true, force: true })
        }
    } else
        throw new Error(
            'Usage: release.mjs pack|download|verify DIRECTORY; publish DIRECTORY npmjs|github; bootstrap-npm DIRECTORY',
        )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main()
