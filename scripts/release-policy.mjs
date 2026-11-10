import assert from 'node:assert/strict'

export const repository = 'todoist/ui-extensions'
export const workflowPath = '.github/workflows/core-pack.yml'
export const packageName = '@todoist/ui-extensions-core'
export const stableVersion = /^[0-9]+\.[0-9]+\.[0-9]+$/
export const fullSha = /^[a-f0-9]{40}$/

export async function validateSourceRun(run, workflowId, sourceSha, compare) {
    assert.match(sourceSha, fullSha)
    assert.equal(run.repository.full_name.toLowerCase(), repository)
    assert.equal(run.head_repository.full_name.toLowerCase(), repository)
    assert.equal(run.workflow_id, workflowId)
    assert.equal(run.path, workflowPath)
    assert.equal(run.event, 'workflow_dispatch')
    assert.equal(run.head_branch, 'main')
    assert.equal(run.head_sha, sourceSha, 'Pack must check out its exact main event SHA')
    assert.equal(run.status, 'completed')
    assert.equal(run.conclusion, 'success')
    assert.equal(run.run_attempt, 1, 'Use the original successful pack run; never rerun a pack')
    assert.equal(run.display_title, `ui-extensions-core pack v1 ${sourceSha}`)
    const result = await compare(sourceSha, 'main')
    assert.ok(['ahead', 'identical'].includes(result.status), 'Source is not on reviewed main')
    assert.equal(result.merge_base_commit.sha, sourceSha)
}

export function validateTag(version, tag, latest) {
    assert.match(version, stableVersion)
    assert.ok(['latest', 'migration-recovery'].includes(tag), 'Choose latest or migration-recovery')
    if (tag !== 'latest' || latest === undefined) return
    assert.match(latest, stableVersion, 'Unexpected latest; operator inspection required')
    const current = latest.split('.').map(BigInt)
    const target = version.split('.').map(BigInt)
    for (let i = 0; i < 3; i++) {
        if (target[i] > current[i]) return
        assert.ok(target[i] >= current[i], 'Refusing latest downgrade; use migration-recovery')
    }
}

export async function preflightBoth(inspectRegistry, integrity) {
    // Finish BOTH reads before permitting even a single-mirror/first-bootstrap write.
    const copies = {}
    for (const registry of ['npmjs', 'github']) {
        copies[registry] = await inspectRegistry(registry)
        if (copies[registry].integrity !== undefined) {
            assert.equal(
                copies[registry].integrity,
                integrity,
                `${registry} has different bytes; recover the original artifact`,
            )
        }
    }
    return copies
}
