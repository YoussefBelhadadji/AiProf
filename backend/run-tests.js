const { spawnSync } = require('node:child_process');
const path = require('node:path');

const filesToCheck = [
  'server.js',
  'auth.js',
  'db.js',
  'liveAnalytics.js',
  'adaptiveDecision.js',
  'workbookParser.js',
  'rulebook.js',
];

let hasFailure = false;

for (const file of filesToCheck) {
  const fullPath = path.join(__dirname, file);
  const result = spawnSync(process.execPath, ['--check', fullPath], {
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    hasFailure = true;
    process.stderr.write(`\n[FAIL] Syntax check failed: ${file}\n`);
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }
  } else {
    process.stdout.write(`[PASS] ${file}\n`);
  }
}

if (hasFailure) {
  process.stderr.write('\nBackend smoke tests failed.\n');
  process.exit(1);
}

process.stdout.write('\nBackend smoke tests passed.\n');
