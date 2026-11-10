import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import test from 'node:test'

import { preflightBoth, validateSourceRun, validateTag } from './release-policy.mjs'
import { publish, readTarball } from './release.mjs'

const sourceSha = 'a'.repeat(40)
const run = {
    repository: { full_name: 'todoist/ui-extensions' },
    head_repository: { full_name: 'todoist/ui-extensions' },
    workflow_id: 42,
    path: '.github/workflows/core-pack.yml',
    event: 'workflow_dispatch',
    head_branch: 'main',
    head_sha: sourceSha,
    status: 'completed',
    conclusion: 'success',
    run_attempt: 1,
    display_title: `ui-extensions-core pack v1 ${sourceSha}`,
}
const compare = async () => ({ status: 'ahead', merge_base_commit: { sha: sourceSha } })

test('historical successful main artifact survives later reviewed main/workflow maintenance', async () => {
    await validateSourceRun(run, 42, sourceSha, compare)
})

test('reject PR/fork/wrong-workflow/failed/rerun/unreviewed/mismatched-checkout sources', async () => {
    for (const patch of [
        { event: 'pull_request' },
        { head_branch: 'migration' },
        { head_sha: 'b'.repeat(40) },
        { head_repository: { full_name: 'attacker/ui-extensions' } },
        { path: '.github/workflows/other.yml' },
        { workflow_id: 99 },
        { conclusion: 'failure' },
        { status: 'in_progress' },
        { run_attempt: 2 },
        { display_title: `ui-extensions-core pack v1 ${'b'.repeat(40)}` },
    ])
        await assert.rejects(validateSourceRun({ ...run, ...patch }, 42, sourceSha, compare))
    await assert.rejects(
        validateSourceRun(run, 42, sourceSha, async () => ({ status: 'diverged' })),
    )
})

test('latest is monotonic; recovery uses an explicit separate tag', () => {
    validateTag('6.0.1', 'latest', '6.0.0')
    validateTag('6.0.1', 'latest', '6.0.1')
    assert.throws(() => validateTag('6.0.1', 'latest', '6.1.0'))
    validateTag('6.0.1', 'migration-recovery', '6.1.0')
    assert.throws(() => validateTag('6.0.1', 'internal', '6.0.0'))
})

test('both copies must match, including the unselected registry', async () => {
    const reads = []
    await assert.rejects(
        preflightBoth(async (name) => {
            reads.push(name)
            return { integrity: name === 'github' ? 'different' : undefined }
        }, 'original'),
    )
    assert.deepEqual(reads, ['npmjs', 'github'])
})

test('GitHub tarballs follow the authenticated registry redirect without sending its token to the CDN', async () => {
    const previous = globalThis.fetch
    const seen = []
    try {
        globalThis.fetch = async (url, options) => {
            seen.push([String(url), options.headers.Authorization])
            return seen.length === 1
                ? new Response(null, {
                      status: 302,
                      headers: { location: 'https://pkg-npm.githubusercontent.com/download/test' },
                  })
                : new Response('original bytes')
        }
        assert.equal(
            (
                await readTarball('https://npm.pkg.github.com/download/test', 'fixture-token')
            ).toString(),
            'original bytes',
        )
        assert.deepEqual(seen, [
            ['https://npm.pkg.github.com/download/test', 'Bearer fixture-token'],
            ['https://pkg-npm.githubusercontent.com/download/test', undefined],
        ])
        globalThis.fetch = async () =>
            new Response(null, {
                status: 302,
                headers: { location: 'https://untrusted.invalid/test' },
            })
        await assert.rejects(
            readTarball('https://npm.pkg.github.com/download/test', 'fixture-token'),
            /redirect host/,
        )
        globalThis.fetch = async () =>
            new Response(null, {
                status: 302,
                headers: { location: 'https://npm.pkg.github.com/loop' },
            })
        await assert.rejects(
            readTarball('https://npm.pkg.github.com/download/test', 'fixture-token'),
            /Too many/,
        )
    } finally {
        globalThis.fetch = previous
    }
})

// Exercise the real publication coordinator with in-memory registry responses and
// a recording npm executable. No real registry, login or publication is contacted.
test('single-mirror safety, network/auth failures, isolated npm credentials and recovery', async (t) => {
    const directory = mkdtempSync(resolve(tmpdir(), 'ui-extensions-release-test-'))
    const previousEnv = { ...process.env }
    const previousFetch = globalThis.fetch
    const log = resolve(directory, 'npm-log.json')
    const bytes = Buffer.from('retained test artifact; not a product build')
    const integrity = `sha512-${createHash('sha512').update(bytes).digest('base64')}`
    const metadata = { name: '@todoist/ui-extensions-core', version: '6.0.1', integrity }
    const tarball = resolve(directory, 'artifact.tgz')
    writeFileSync(tarball, bytes)
    writeFileSync(
        resolve(directory, 'npm'),
        `#!${process.execPath}\nconst fs = require('node:fs'); fs.writeFileSync(${JSON.stringify(
            log,
        )}, JSON.stringify({args:process.argv.slice(2), env:Object.fromEntries(['GH_PACKAGES_TOKEN','GH_TOKEN','NODE_AUTH_TOKEN','NPM_TOKEN','npm_config_registry'].map(k=>[k,process.env[k]])), config:fs.readFileSync(process.env.NPM_CONFIG_USERCONFIG,'utf8')}))\n`,
        { mode: 0o700 },
    )
    process.env.PATH = `${directory}:${process.env.PATH}`
    process.env.GH_PACKAGES_TOKEN = 'github-read-secret-fixture'
    process.env.GH_TOKEN = 'github-api-secret-fixture'
    process.env.NODE_AUTH_TOKEN = 'unrelated-fixture'
    process.env.NPM_TOKEN = 'unrelated-fixture'
    process.env.npm_config_registry = 'https://wrong-registry.invalid/'
    const configure = ({
        mismatch = false,
        denied = false,
        network = false,
        latest = '6.0.0',
        selected = 'npmjs',
        exists = false,
    } = {}) => {
        rmSync(log, { force: true })
        process.env.RELEASE_TAG = 'latest'
        globalThis.fetch = async (url, options) => {
            const address = String(url)
            const github = address.includes('github.com')
            assert.equal(
                options.headers.Authorization,
                github ? 'Bearer github-read-secret-fixture' : undefined,
            )
            if (network) throw new Error('network unavailable')
            if (denied && github) return new Response('{}', { status: 403 })
            if (address.startsWith('https://api.github.com/'))
                return Response.json({
                    visibility: 'public',
                    repository: { full_name: 'todoist/ui-extensions' },
                })
            const registry =
                github || address.includes('githubusercontent.com') ? 'github' : 'npmjs'
            if (github && address.endsWith('/artifact.tgz'))
                return new Response(null, {
                    status: 302,
                    headers: { location: 'https://pkg-npm.githubusercontent.com/artifact.tgz' },
                })
            if (address.endsWith('/artifact.tgz'))
                return new Response(
                    mismatch && registry !== selected ? Buffer.from('conflicting artifact') : bytes,
                )
            const origin = github ? 'https://npm.pkg.github.com' : 'https://registry.npmjs.org'
            const hasCopy = exists || registry !== selected || existsSync(log)
            return Response.json({
                name: metadata.name,
                versions: hasCopy
                    ? {
                          '6.0.1': {
                              name: metadata.name,
                              version: '6.0.1',
                              dist: { tarball: `${origin}/artifact.tgz` },
                          },
                      }
                    : {},
                'dist-tags':
                    existsSync(log) && registry === selected
                        ? {
                              latest: process.env.RELEASE_TAG === 'latest' ? '6.0.1' : latest,
                              [process.env.RELEASE_TAG]: '6.0.1',
                          }
                        : { latest },
            })
        }
    }
    try {
        for (const selected of ['npmjs', 'github']) {
            await t.test(
                `${selected}-only refuses divergent opposite mirror before any npm command`,
                async () => {
                    configure({ selected, mismatch: true })
                    await assert.rejects(
                        publish({ metadata, tarball }, selected, false),
                        /different bytes/,
                    )
                    assert.equal(existsSync(log), false)
                },
            )
        }
        for (const options of [{ denied: true }, { network: true }]) {
            configure(options)
            await assert.rejects(publish({ metadata, tarball }, 'npmjs', false))
            assert.equal(existsSync(log), false)
        }
        configure({ exists: true })
        await publish({ metadata, tarball }, 'npmjs', false)
        assert.equal(existsSync(log), false)
        configure({ latest: '6.2.0' })
        await assert.rejects(publish({ metadata, tarball }, 'npmjs', false), /downgrade/)
        assert.equal(existsSync(log), false)
        process.env.RELEASE_TAG = 'migration-recovery'
        await publish({ metadata, tarball }, 'npmjs', false)
        const invoked = JSON.parse(readFileSync(log, 'utf8'))
        assert.equal(invoked.args[0], 'publish')
        assert.ok(invoked.args.includes('--ignore-scripts'))
        assert.ok(invoked.args.includes('--provenance=false'))
        assert.ok(invoked.args.includes('--tag=migration-recovery'))
        for (const key of [
            'GH_PACKAGES_TOKEN',
            'GH_TOKEN',
            'NODE_AUTH_TOKEN',
            'NPM_TOKEN',
            'npm_config_registry',
        ])
            assert.equal(invoked.env[key], undefined)
        assert.ok(!invoked.config.includes('github'))
    } finally {
        globalThis.fetch = previousFetch
        for (const key of Object.keys(process.env))
            if (!(key in previousEnv)) delete process.env[key]
        Object.assign(process.env, previousEnv)
        rmSync(directory, { recursive: true, force: true })
    }
})
