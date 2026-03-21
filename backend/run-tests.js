const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { parseWorkbook } = require('./workbookParser');
const { app } = require('./server');

const workbookPath = path.join(__dirname, '..', 'lahmarabbou_asmaa_FULL_ENGLISH (1).xlsx');

function requestJson(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(body) });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
  });
}

async function main() {
  const result = parseWorkbook(workbookPath, path.basename(workbookPath));
  const student = result.data[0];

  assert.equal(result.meta.studentName, 'Lahmarabbou Asmaa');
  assert.equal(result.meta.userId, '9263');
  assert.equal(result.meta.courseTitle, 'Academic Writing');
  assert.equal(result.meta.activityLogEntries, 258);
  assert.equal(result.meta.chatMessages, 17);
  assert.equal(result.meta.feedbackViewedAt, '12-02-2026 23:25');
  assert.ok(result.communication.dialogue.length >= 10);
  assert.equal(result.communication.instructorComments.length, 1);
  assert.equal(result.rubric.totalMaxPoints, 8);
  assert.equal(result.rubric.criteria.length, 4);
  assert.equal(result.activity.activeSessions, 44);
  assert.equal(result.activity.estimatedActiveMinutes, 179);
  assert.equal(result.activity.clickSignals.length, 6);
  assert.ok(result.activity.trace.some((entry) => /final submitted/i.test(entry.event)));
  assert.ok(result.writing.artifacts.some((artifact) => artifact.id === 'body1-original'));
  assert.equal(result.writing.comparison.beforeId, 'body1-original');
  assert.equal(result.writing.sequence.length, 10);
  assert.equal(result.thresholds.privateMessages.matchedCount, 5);
  assert.ok(result.communication.dialogue.some((entry) => /check the feedback/i.test(entry.message)));
  assert.ok(result.communication.dialogue.some((entry) => /comments section/i.test(entry.message)));
  assert.match(result.communication.instructorComments[0].note, /more formal and academic/i);

  assert.equal(student.student_id, '9263');
  assert.equal(student.assignment_views, 108);
  assert.equal(student.resource_access_count, 19);
  assert.equal(student.rubric_views, 6);
  assert.equal(student.revision_frequency, 4);
  assert.equal(student.feedback_views, 4);
  assert.equal(student.help_seeking_messages, 5);
  assert.equal(student.word_count, 199);
  assert.equal(student.triggered_rule_ids, 'B2; D1');
  assert.equal(student.cluster_label, 3);

  const bufferResult = parseWorkbook(fs.readFileSync(workbookPath), 'buffer-upload.xlsx');
  assert.equal(bufferResult.meta.workbookName, 'buffer-upload.xlsx');
  assert.ok(Array.isArray(bufferResult.data));
  assert.equal(bufferResult.data.length, 1);
  assert.equal(bufferResult.metrics.rf_metrics.r2, 0.68);
  assert.equal(bufferResult.communication.instructorComments[0].assessment, 'Argumentative essay Introduction');
  assert.equal(bufferResult.thresholds.privateMessages.thresholds.length, 4);

  const server = app.listen(0);

  try {
    const { port } = server.address();
    const response = await requestJson(`http://127.0.0.1:${port}/api/health`);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, 'ok');
    assert.match(response.body.message, /WriteLens Backend/);

    const formData = new FormData();
    const workbookBuffer = fs.readFileSync(workbookPath);

    formData.append('files', new Blob([workbookBuffer]), 'asmaa-a.xlsx');
    formData.append('files', new Blob([workbookBuffer]), 'asmaa-b.xlsx');

    const uploadResponse = await fetch(`http://127.0.0.1:${port}/api/upload-dataset`, {
      method: 'POST',
      body: formData,
    });
    const uploadBody = await uploadResponse.json();

    assert.equal(uploadResponse.status, 200);
    assert.equal(uploadBody.workbookCount, 2);
    assert.equal(uploadBody.studentCount, 2);
    assert.ok(Array.isArray(uploadBody.cases));
    assert.equal(uploadBody.cases.length, 2);
    assert.equal(uploadBody.cases[0].meta.studentName, 'Lahmarabbou Asmaa');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log('Backend tests passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
