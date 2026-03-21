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
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
