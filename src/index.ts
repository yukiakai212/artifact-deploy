import * as core from '@actions/core';
import * as exec from '@actions/exec';
import fg from 'fast-glob';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

async function run() {
  try {
    const repo = core.getInput('repo', { required: true });
    const branch = core.getInput('branch') || 'main';
    const token = core.getInput('token', { required: true });
    let baseDir = core.getInput('base-dir') || '.';
    const filesInput = core.getInput('files', { required: true });
    const sha = process.env.GITHUB_SHA?.slice(0, 7);
    const defaultMessage = sha ? `deploy: ${sha}` : 'deploy: update artifacts';
    const commitMessage = core.getInput('commit-message') || defaultMessage;
    baseDir = path.resolve(baseDir);

    const patterns = filesInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    core.info(`Base dir: ${baseDir}`);
    core.info(`Patterns: ${patterns.join(', ')}`);

    // 1. Resolve files
    let files = await fg(patterns, {
      cwd: baseDir,
      dot: true,
      onlyFiles: true,
      ignore: ['**/.git/**'],
    });

    files = files.map((f) => f.replace(/^[./]+/, ''));
    files = Array.from(new Set(files));

    if (files.length === 0) {
      throw new Error('No files matched');
    }

    core.info(`Matched files: ${files.length}`);

    // 2. Create temp dir
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'deploy-'));

    const remote = `https://x-access-token:${token}@github.com/${repo}.git`;

    // 3. Clone repo (shallow)
    await exec.exec('git', ['clone', '--depth=1', '--branch', branch, remote, tmpDir]);

    // 4. Wipe tracked files (keep .git)
    try {
      await exec.exec('git', ['rm', '-rf', '.'], { cwd: tmpDir });
    } catch {
      core.info('Nothing to remove (repo may be empty)');
    }

    // 5. Copy files
    for (const file of files) {
      const src = path.join(baseDir, file);
      const dest = path.join(tmpDir, file);

      await fs.ensureDir(path.dirname(dest));
      await fs.copyFile(src, dest);
    }

    core.info('Files copied');

    // 6. Git config
    await exec.exec('git', ['config', 'user.name', 'github-actions'], { cwd: tmpDir });
    await exec.exec('git', ['config', 'user.email', 'github-actions@github.com'], { cwd: tmpDir });

    // 7. Add files
    await exec.exec('git', ['add', '.'], { cwd: tmpDir });

    // 8. Check changes
    let hasChanges = true;
    try {
      await exec.exec('git', ['diff', '--cached', '--quiet'], { cwd: tmpDir });
      hasChanges = false;
    } catch {
      hasChanges = true;
    }

    if (!hasChanges) {
      core.info('No changes detected, skipping commit & push');
      return;
    }

    // 9. Commit
    await exec.exec('git', ['commit', '-m', commitMessage], { cwd: tmpDir });

    // 10. Push (NO FORCE)
    await exec.exec('git', ['push', 'origin', branch], { cwd: tmpDir });

    core.info('Deploy success');
  } catch (err: any) {
    core.setFailed(err.message);
  }
}

run();
