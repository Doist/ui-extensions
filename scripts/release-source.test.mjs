import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const script = resolve(dirname(fileURLToPath(import.meta.url)), 'release.mjs')
const hash = (bytes, algorithm = 'sha256', encoding = 'hex') =>
    createHash(algorithm).update(bytes).digest(encoding)

// Run the actual download/verify CLI with a recording gh executable and real
// local tar/ZIP fixtures. There is no network, product build or publication.
test('CLI recovers the original successful artifact after a failed later attempt', () => {
    const directory = mkdtempSync(resolve(tmpdir(), 'ui-extensions-source-test-'))
    try {
        const repository = 'todoist/ui-extensions'
        const sha = 'a'.repeat(40)
        const workflow = '.github/workflows/core-pack.yml'
        const manifest = {
            name: '@todoist/ui-extensions-core',
            version: '6.0.1',
            repository: `https://github.com/${repository}`,
            dependencies: { 'typescript-json-serializer': '6.0.1' },
        }
        const files = {
            'package/package.json': JSON.stringify(manifest),
            'package/dist/cjs/index.js': 'module.exports = {}\n',
            'package/dist/esm/index.js': 'export {}\n',
            'package/dist/types/index.d.ts': 'export {}\n',
        }
        for (const [name, contents] of Object.entries(files)) {
            const path = resolve(directory, name)
            mkdirSync(dirname(path), { recursive: true })
            writeFileSync(path, contents)
        }
        const filename = 'todoist-ui-extensions-core-6.0.1.tgz'
        const tarball = resolve(directory, filename)
        execFileSync('tar', ['-czf', tarball, '-C', directory, ...Object.keys(files)])
        const bytes = readFileSync(tarball)
        const metadata = {
            schema: 1,
            repository,
            workflow,
            sourceSha: sha,
            runId: '123',
            name: manifest.name,
            version: manifest.version,
            filename,
            sha256: hash(bytes),
            integrity: `sha512-${hash(bytes, 'sha512', 'base64')}`,
        }
        writeFileSync(resolve(directory, 'release.json'), JSON.stringify(metadata))
        const zip = resolve(directory, 'original.zip')
        execFileSync('zip', ['-q', zip, 'release.json', filename], { cwd: directory })
        const originalRun = {
            id: 123,
            repository: { full_name: repository },
            head_repository: { full_name: repository },
            workflow_id: 42,
            path: workflow,
            event: 'workflow_dispatch',
            head_branch: 'main',
            head_sha: sha,
            status: 'completed',
            conclusion: 'success',
            run_attempt: 1,
            display_title: `ui-extensions-core pack v1 ${sha}`,
        }
        const latestRun = { ...originalRun, conclusion: 'failure', run_attempt: 2 }
        const routes = {
            'actions/runs/123': latestRun,
            'actions/runs/123/attempts/1': originalRun,
            'actions/workflows/core-pack.yml': { id: 42 },
            [`compare/${sha}...main`]: { status: 'ahead', merge_base_commit: { sha } },
            [`contents/${workflow}?ref=${sha}`]: {
                content: Buffer.from(
                    'run-name: ui-extensions-core pack v1 ${{ github.sha }}\n',
                ).toString('base64'),
            },
            'actions/runs/123/artifacts?per_page=100': {
                artifacts: [
                    {
                        id: 456,
                        name: 'ui-extensions-core-release',
                        expired: false,
                        workflow_run: { id: 123, head_sha: sha },
                        digest: `sha256:${hash(readFileSync(zip))}`,
                    },
                ],
            },
            [`contents/packages/ui-extensions-core/package.json?ref=${sha}`]: {
                content: Buffer.from(JSON.stringify(manifest)).toString('base64'),
            },
        }
        const fixture = resolve(directory, 'routes.json')
        const requests = resolve(directory, 'requests.log')
        writeFileSync(fixture, JSON.stringify(routes))
        writeFileSync(
            resolve(directory, 'gh'),
            `#!${process.execPath}
const fs = require('node:fs')
const path = process.argv[3]?.replace('repos/${repository}/', '')
if (process.argv[2] !== 'api') throw new Error('Unexpected gh command')
fs.appendFileSync(${JSON.stringify(requests)}, path + '\\n')
if (path === 'actions/artifacts/456/zip') process.stdout.write(fs.readFileSync(${JSON.stringify(zip)}))
else {
    const routes = JSON.parse(fs.readFileSync(${JSON.stringify(fixture)}, 'utf8'))
    if (!Object.hasOwn(routes, path)) throw new Error('Unexpected API request: ' + path)
    process.stdout.write(JSON.stringify(routes[path]))
}
`,
            { mode: 0o700 },
        )
        const env = {
            ...process.env,
            PATH: `${directory}:${process.env.PATH}`,
            ARTIFACT_RUN_ID: '123',
            RELEASE_SHA: sha,
            RELEASE_VERSION: '6.0.1',
        }
        const local = resolve(directory, 'downloaded')
        const cli = (command) =>
            spawnSync(process.execPath, [script, command, local], {
                encoding: 'utf8',
                env,
            })
        for (const command of ['download', 'verify']) {
            const result = cli(command)
            assert.equal(result.status, 0, result.stderr)
        }
        assert.deepEqual(readFileSync(resolve(local, filename)), bytes)
        assert.deepEqual(JSON.parse(readFileSync(resolve(local, 'release.json'))), metadata)
        const paths = readFileSync(requests, 'utf8').trim().split('\n')
        assert.ok(paths.includes('actions/runs/123/attempts/1'))
        assert.ok(!paths.includes('actions/runs/123'))

        // Even if the selected endpoint unexpectedly returns another attempt,
        // reject it before reading or downloading a run's artifact.
        routes['actions/runs/123/attempts/1'] = { ...originalRun, run_attempt: 2 }
        writeFileSync(fixture, JSON.stringify(routes))
        writeFileSync(requests, '')
        const wrongAttempt = cli('verify')
        assert.notEqual(wrongAttempt.status, 0)
        assert.match(wrongAttempt.stderr, /original successful pack run/)
        assert.ok(!readFileSync(requests, 'utf8').includes('actions/artifacts/456/zip'))

        routes['actions/runs/123/attempts/1'] = originalRun
        routes['actions/runs/123/artifacts?per_page=100'].artifacts[0].digest =
            `sha256:${'0'.repeat(64)}`
        writeFileSync(fixture, JSON.stringify(routes))
        assert.notEqual(cli('verify').status, 0, 'Archive digest guard must remain enforced')
    } finally {
        rmSync(directory, { recursive: true, force: true })
    }
})
