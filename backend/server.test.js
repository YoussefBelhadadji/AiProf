const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { app } = require('./server');

const workbookPath = path.join(__dirname, '..', 'lahmarabbou_asmaa_FULL_ENGLISH (1).xlsx');

test('health endpoint returns backend status', async () => {
  const server = app.listen(0);

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, 'ok');
    assert.match(body.message, /WriteLens Backend/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('upload endpoint accepts multiple workbook files', async () => {
  const server = app.listen(0);

  try {
    const { port } = server.address();
    const formData = new FormData();
    const workbookBuffer = fs.readFileSync(workbookPath);

    formData.append('files', new Blob([workbookBuffer]), 'asmaa-a.xlsx');
    formData.append('files', new Blob([workbookBuffer]), 'asmaa-b.xlsx');

    const response = await fetch(`http://127.0.0.1:${port}/api/upload-dataset`, {
      method: 'POST',
      body: formData,
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.workbookCount, 2);
    assert.equal(body.studentCount, 2);
    assert.ok(Array.isArray(body.cases));
    assert.equal(body.cases.length, 2);
    assert.equal(body.cases[0].meta.studentName, 'Lahmarabbou Asmaa');
    assert.equal(body.analytics.cohort_size, 2);
    assert.equal(body.analytics.clustering.available, false);
    assert.equal(body.analytics.prediction.available, false);
    assert.equal(body.cases[0].data[0].predicted_score, null);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('pipeline endpoint rejects requests missing the required csv set', async () => {
  const server = app.listen(0);

  try {
    const { port } = server.address();
    const formData = new FormData();
    formData.append('files', new Blob(['student_id,task_id,draft_no\nS1,T1,1\n']), 'moodle_logs.csv');

    const response = await fetch(`http://127.0.0.1:${port}/api/run-pipeline`, {
      method: 'POST',
      body: formData,
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error, 'Missing required pipeline files.');
    assert.deepEqual(body.required_files, ['moodle_logs.csv', 'rubric_scores.csv', 'essays.csv', 'messages.csv']);
    assert.deepEqual(body.missing_files, ['rubric_scores.csv', 'essays.csv', 'messages.csv']);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
