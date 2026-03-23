const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { parseWorkbook } = require('./workbookParser');
const { evaluateAdaptiveDecision } = require('./adaptiveDecision');
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
  assert.equal(student.learner_profile, 'Feedback-responsive developing writer');
  assert.equal(student.triggered_rule_ids, 'C4; C5; B2');
  assert.equal(student.feedback_templates_selected, 'feedback_decoding; feedforward_guidance; argument_expansion');
  assert.equal(student.cluster_label, 3);

  const disengagedCase = evaluateAdaptiveDecision({
    assignment_views: 1,
    resource_access_count: 0,
    rubric_views: 0,
    time_on_task: 12,
    revision_frequency: 0,
    feedback_views: 0,
    help_seeking_messages: 0,
    word_count: 70,
    error_density: 4.5,
    cohesion_index: 1,
    cohesion: 2.2,
    ttr: 0.39,
    argumentation: 2.4,
    grammar_accuracy: 2.5,
    lexical_resource: 2.7,
    total_score: 12.5,
    score_gain: 0.4,
    first_access_delay_minutes: 45,
  });
  assert.equal(disengagedCase.learner_profile, 'Disengaged / low-participation learner');
  assert.equal(
    disengagedCase.feedback_templates_selected,
    'planning_scaffold; elaboration_prompt; revision_prompt; motivational_reengagement; metacognitive_prompt'
  );

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
    assert.equal(uploadBody.analytics.cohort_size, 2);
    assert.equal(uploadBody.analytics.clustering.available, false);
    assert.equal(uploadBody.analytics.prediction.available, false);
    assert.equal(uploadBody.cases[0].analytics.bayesian.available, true);
    assert.equal(uploadBody.cases[0].data[0].cluster_label, 3);
    assert.equal(uploadBody.cases[0].data[0].predicted_score, 24.2);
    assert.equal(uploadBody.cases[0].metrics.rf_metrics.r2, 0.68);

    const pipelineFormData = new FormData();
    pipelineFormData.append('files', new Blob(['student_id,task_id,draft_no\nS1,T1,1\n']), 'moodle_logs.csv');

    const pipelineResponse = await fetch(`http://127.0.0.1:${port}/api/run-pipeline`, {
      method: 'POST',
      body: pipelineFormData,
    });
    const pipelineBody = await pipelineResponse.json();

    assert.equal(pipelineResponse.status, 400);
    assert.equal(pipelineBody.error, 'Missing required pipeline files.');
    assert.deepEqual(pipelineBody.required_files, ['moodle_logs.csv', 'rubric_scores.csv', 'essays.csv', 'messages.csv']);
    assert.deepEqual(pipelineBody.missing_files, ['rubric_scores.csv', 'essays.csv', 'messages.csv']);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log('Backend tests passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
