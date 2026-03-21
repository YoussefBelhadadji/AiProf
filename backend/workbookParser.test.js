const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseWorkbook } = require('./workbookParser');

const workbookPath = path.join(__dirname, '..', 'lahmarabbou_asmaa_FULL_ENGLISH (1).xlsx');

test('parseWorkbook extracts deterministic case metadata from the workbook file', () => {
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
});

test('parseWorkbook accepts a raw workbook buffer', () => {
  const result = parseWorkbook(fs.readFileSync(workbookPath), 'buffer-upload.xlsx');

  assert.equal(result.meta.workbookName, 'buffer-upload.xlsx');
  assert.ok(Array.isArray(result.data));
  assert.equal(result.data.length, 1);
  assert.equal(result.metrics.rf_metrics.r2, 0.68);
  assert.equal(result.communication.instructorComments[0].assessment, 'Argumentative essay Introduction');
  assert.equal(result.thresholds.privateMessages.thresholds.length, 4);
});
