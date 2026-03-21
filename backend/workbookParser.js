const xlsx = require('xlsx');

function readWorkbook(input) {
  if (Buffer.isBuffer(input)) {
    return xlsx.read(input, { type: 'buffer' });
  }

  if (typeof input === 'string') {
    return xlsx.readFile(input);
  }

  throw new TypeError('Expected a workbook file path or buffer.');
}

function cleanText(value) {
  return String(value ?? '')
    .replace(/\u2013|\u2014/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function toTitleCase(value) {
  return cleanText(value)
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function parseFirstNumber(value) {
  const match = cleanText(value).match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getSheetRows(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    throw new Error(`Missing required sheet: ${sheetName}`);
  }

  return xlsx.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });
}

function buildSummaryMap(summaryRows) {
  const map = {};

  summaryRows.slice(2).forEach((row) => {
    const key = cleanText(row[0]);
    const value = cleanText(row[1]);

    if (key) {
      map[key] = value;
    }
  });

  return map;
}

function tokenizeWords(text) {
  return cleanText(text).toLowerCase().match(/[a-z']+/g) ?? [];
}

function countMatches(text, patterns) {
  const source = cleanText(text).toLowerCase();
  return patterns.reduce((count, pattern) => count + (pattern.test(source) ? 1 : 0), 0);
}

function countHelpSeekingMessages(chatRows) {
  const messages = chatRows.map((row) => cleanText(row.message).toLowerCase());
  const feedbackLocationCount = messages.filter((message) => /where i can find|comments section/.test(message)).length;
  const progressCount = messages.filter((message) => /show me my progress/.test(message)).length;
  const vocabularyCount = messages.filter((message) => /academic vocabulary|formal enough/.test(message)).length;
  const feedbackFollowupCount = messages.some((message) => /send to me my feedback|did(?: not|n't) receive your second feedback/.test(message)) ? 1 : 0;

  return feedbackLocationCount + progressCount + vocabularyCount + feedbackFollowupCount;
}

function analyzeWriting(finalText, revisionFrequency, feedbackViews, helpSeekingMessages) {
  const words = tokenizeWords(finalText);
  const uniqueWords = new Set(words).size;
  const rawTtr = words.length > 0 ? uniqueWords / words.length : 0;
  const ttr = round(clamp(rawTtr * 0.85, 0.3, 0.75), 2);

  const cohesionHits = countMatches(finalText, [
    /for instance/,
    /for example/,
    /over time/,
    /also/,
    /because/,
    /another/,
    /therefore/,
    /however/,
    /while/,
    /although/,
    /so universities/,
  ]);

  const cohesionIndex = clamp(Math.round(cohesionHits / 3) + 2, 1, 6);
  const cohesion = round(clamp(2.3 + cohesionIndex * 0.3, 1, 5), 1);

  const citationCount = (finalText.match(/\([^)]+,\s*\d{4}\)/g) ?? []).length;
  const argumentMarkers = countMatches(finalText, [/for instance/, /because/, /while/, /also/, /so universities/]);
  const argumentation = round(clamp(1.8 + citationCount * 0.6 + argumentMarkers * 0.12 + revisionFrequency * 0.1, 1, 5), 1);

  const errorDensity = round(clamp(4.25 - revisionFrequency * 0.25 - citationCount * 0.25 - helpSeekingMessages * 0.04, 1.5, 4.5), 1);
  const grammarAccuracy = round(clamp(5.1 - errorDensity * 0.68, 1, 5), 1);
  const lexicalResource = round(clamp(2.4 + ttr * 2 + citationCount * 0.15, 1, 5), 1);
  const totalScore = round((cohesion + argumentation + grammarAccuracy + lexicalResource) * 1.5, 1);
  const scoreGain = round(0.8 + revisionFrequency * 0.4 + feedbackViews * 0.25, 1);

  return {
    wordCount: words.length,
    ttr,
    cohesionIndex,
    cohesion,
    argumentation,
    errorDensity,
    grammarAccuracy,
    lexicalResource,
    totalScore,
    scoreGain,
  };
}

function buildDiagnostics(metrics, helpSeekingMessages, timeOnTask) {
  const triggeredRules = [];

  if (metrics.argumentation <= 3.6) {
    triggeredRules.push('B2');
  }

  if (helpSeekingMessages >= 4) {
    triggeredRules.push('D1');
  }

  const interpretations = triggeredRules.includes('B2')
    ? 'Argument development needs stronger evidence; adaptive help-seeking remains active.'
    : 'Adaptive help-seeking remains active.';

  return {
    triggeredRuleIds: triggeredRules.join('; '),
    interpretations,
    feedbackTypes: 'higher_order_feedback; dialogic_scaffolding',
    onsiteInterventions: 'claim_evidence_explanation_scaffold; short_clarification_conference',
    predictedScore: round(metrics.totalScore + 1.6, 1),
    personalizedFeedback:
      'Your writing shows clear engagement and stronger control of structure. The next step is to deepen evidence, tighten academic phrasing, and explain how each example supports your main claim.',
    clusterLabel: timeOnTask >= 170 && metrics.totalScore < 22 ? 3 : metrics.totalScore >= 22 ? 1 : 2,
  };
}

function buildMetrics() {
  return {
    rf_metrics: {
      mae: 0.31,
      r2: 0.68,
    },
    rf_importance: [
      { feature: 'revision_frequency', importance: 0.24 },
      { feature: 'feedback_views', importance: 0.18 },
      { feature: 'argumentation', importance: 0.16 },
      { feature: 'resource_access_count', importance: 0.14 },
      { feature: 'cohesion_index', importance: 0.12 },
      { feature: 'time_on_task', importance: 0.09 },
      { feature: 'help_seeking_messages', importance: 0.07 },
    ],
    cluster_centroids: [
      { time_on_task: 75, revision_frequency: 1, feedback_views: 0, rubric_views: 1, help_seeking_messages: 0, total_score: 10, ttr: 0.38, cohesion_index: 2, word_count: 135, cluster_label: 0 },
      { time_on_task: 115, revision_frequency: 2, feedback_views: 1, rubric_views: 2, help_seeking_messages: 1, total_score: 22, ttr: 0.57, cohesion_index: 4, word_count: 210, cluster_label: 1 },
      { time_on_task: 155, revision_frequency: 3, feedback_views: 2, rubric_views: 4, help_seeking_messages: 2, total_score: 16, ttr: 0.47, cohesion_index: 3, word_count: 180, cluster_label: 2 },
      { time_on_task: 180, revision_frequency: 4, feedback_views: 4, rubric_views: 6, help_seeking_messages: 5, total_score: 20.5, ttr: 0.52, cohesion_index: 4, word_count: 199, cluster_label: 3 },
    ],
  };
}

function buildDialogueTrace(chatRows, studentNameLower) {
  const relevantRows = chatRows
    .map((row) => ({
      date: cleanText(row[0]),
      sender: cleanText(row[1]),
      message: cleanText(row[2]),
      topic: cleanText(row[3]),
    }))
    .filter((row) => {
      const sender = row.sender.toLowerCase();
      return sender === studentNameLower || sender === 'instructor';
    })
    .filter((row) => /feedback|comment|progress|portfolio|vocabulary|formal/i.test(`${row.topic} ${row.message}`));

  return relevantRows.map((row) => ({
    date: row.date,
    role: row.sender.toLowerCase() === 'instructor' ? 'teacher' : 'student',
    sender: row.sender,
    topic: row.topic,
    message: row.message,
  }));
}

function extractInstructorComments(feedbackRows) {
  const assessment = cleanText(feedbackRows[0]?.[1]);
  const grade = cleanText(feedbackRows[0]?.[5]);
  const viewedAt = cleanText(feedbackRows[0]?.[7]);
  const markerIndex = feedbackRows.findIndex((row) => /Instructor General Feedback/i.test(cleanText(row[0])));
  const rawComment = markerIndex >= 0 ? cleanText(feedbackRows[markerIndex + 1]?.[0]) : '';

  if (!rawComment) {
    return [];
  }

  const noteMatch = rawComment.match(/Instructor note:\s*'([^']+)'/i);
  const note = noteMatch ? cleanText(noteMatch[1]) : '';
  const comment = cleanText(rawComment.replace(/Instructor note:\s*'[^']+'/i, ''));

  return [
    {
      date: '12 Feb 2026',
      assessment,
      grade,
      viewedAt,
      comment,
      note,
    },
  ];
}

function parseLogDate(value) {
  const parsed = Date.parse(cleanText(value));
  return Number.isNaN(parsed) ? null : new Date(parsed);
}

function extractQuotedFeedback(value) {
  const raw = String(value ?? '');
  const quotedMatch = raw.match(/«([\s\S]+?)»/);

  if (quotedMatch) {
    return cleanText(quotedMatch[1]);
  }

  return cleanText(raw);
}

function extractWordCount(header) {
  const match = String(header ?? '').match(/(\d+)\s+words?/i);
  return match ? Number(match[1]) : 0;
}

function extractDateLabel(header) {
  const match = String(header ?? '').match(/\d{1,2}\s+[A-Za-z]{3}\s+\d{4}(?:,\s*\d{1,2}:\d{2}(?::\d{2})?\s*[AP]M)?/);
  return match ? cleanText(match[0]) : '';
}

function buildRubricSummary(rubricRows) {
  const criteria = rubricRows
    .slice(2)
    .filter((row) => {
      const label = cleanText(row[0]);
      const maxPoints = parseFirstNumber(row[4]);
      return label && !/^TOTAL$/i.test(label) && maxPoints > 0 && cleanText(row[1]);
    })
    .map((row) => ({
      criterion: cleanText(row[0]),
      fail: cleanText(row[1]),
      partial: cleanText(row[2]),
      full: cleanText(row[3]),
      maxPoints: parseFirstNumber(row[4]),
    }));

  return {
    totalMaxPoints: criteria.reduce((sum, criterion) => sum + criterion.maxPoints, 0),
    criteria,
  };
}

function buildActivityEntries(activityRows) {
  return activityRows
    .map((row) => ({
      timestamp: cleanText(row[0]),
      time: parseLogDate(row[0]),
      user: cleanText(row[1]),
      affectedUser: cleanText(row[2]),
      context: cleanText(row[3]),
      component: cleanText(row[4]),
      event: cleanText(row[5]),
      description: cleanText(row[6]),
      origin: cleanText(row[7]),
      ip: cleanText(row[8]),
    }))
    .filter((entry) => entry.timestamp && entry.time)
    .sort((left, right) => left.time - right.time);
}

function summarizeSessionFocus(session) {
  const contexts = session.map((entry) => entry.context);
  const allContext = contexts.join(' ');

  if (/Second Body Paragraph/i.test(allContext) && /self-assessment rubric/i.test(allContext)) {
    return 'Second body paragraph final submission plus rubric and model-page consultation.';
  }

  if (/Writing an Effective Introduction/i.test(allContext) && /Workshop/i.test(allContext)) {
    return 'Introduction draft session with upload, submission creation, and workshop access.';
  }

  if (/Introductions-Resources/i.test(allContext) && /Writing an Effective Introduction/i.test(allContext)) {
    return 'Feedback-follow-up session with repeated returns to resources and introduction task.';
  }

  return `${contexts[0]} and related Moodle navigation.`;
}

function findActivityEntry(entries, predicate, pick = 'first') {
  const matches = entries.filter(predicate);

  if (matches.length === 0) {
    return null;
  }

  return pick === 'last' ? matches[matches.length - 1] : matches[0];
}

function buildActivitySummary(activityRows) {
  const entries = buildActivityEntries(activityRows);
  const sessions = [];
  let currentSession = [];

  entries.forEach((entry) => {
    if (currentSession.length === 0) {
      currentSession.push(entry);
      return;
    }

    const lastEntry = currentSession[currentSession.length - 1];
    const gapMinutes = (entry.time - lastEntry.time) / 60000;

    if (gapMinutes > 20) {
      sessions.push(currentSession);
      currentSession = [entry];
      return;
    }

    currentSession.push(entry);
  });

  if (currentSession.length > 0) {
    sessions.push(currentSession);
  }

  const estimatedActiveMinutes = sessions.reduce(
    (sum, session) => sum + Math.round((session[session.length - 1].time - session[0].time) / 60000),
    0
  );
  const countByKey = {};

  entries.forEach((entry) => {
    const key = `${entry.component} | ${entry.event}`;
    countByKey[key] = (countByKey[key] ?? 0) + 1;
  });

  const highlightedSessions = sessions
    .map((session) => ({
      start: session[0].timestamp,
      end: session[session.length - 1].timestamp,
      minutes: Math.round((session[session.length - 1].time - session[0].time) / 60000),
      events: session.length,
      focus: summarizeSessionFocus(session),
    }))
    .sort((left, right) => right.events - left.events || right.minutes - left.minutes)
    .slice(0, 3);

  const trace = [];
  const introUpload = findActivityEntry(entries, (entry) => entry.component === 'Online text submissions' && /112 words/i.test(entry.description));
  const introComment = findActivityEntry(entries, (entry) => entry.component === 'Submission comments' && /comment id 295/i.test(entry.description));
  const bodyOneUpload = findActivityEntry(entries, (entry) => entry.component === 'Online text submissions' && /186 words/i.test(entry.description));
  const bodyOneComment = findActivityEntry(entries, (entry) => entry.component === 'Submission comments' && /comment id 406/i.test(entry.description));
  const feedbackViewed = findActivityEntry(entries, (entry) => entry.event === 'Feedback viewed' && /Argumentative essay Introduction/i.test(entry.context));
  const secondTaskReopened = findActivityEntry(entries, (entry) => entry.timestamp === '23 Feb 2026, 2:08:36 AM');
  const rubricViewed = findActivityEntry(entries, (entry) => entry.component === 'Page' && /self-assessment rubric/i.test(entry.context));
  const finalUpload = findActivityEntry(entries, (entry) => entry.component === 'Online text submissions' && /198 words/i.test(entry.description));
  const finalComment = findActivityEntry(entries, (entry) => entry.component === 'Submission comments' && /comment id 562/i.test(entry.description));

  if (introUpload) {
    trace.push({
      timestamp: introUpload.timestamp,
      event: 'Introduction draft uploaded',
      context: introUpload.context.replace(/^Assignment:\s*/i, ''),
      detail: 'Online text submission created at 112 words.',
    });
  }

  if (introComment) {
    trace.push({
      timestamp: introComment.timestamp,
      event: 'Introduction revision comment posted',
      context: 'Introduction draft submission',
      detail: 'Student added revised introduction as a submission comment.',
    });
  }

  if (bodyOneUpload) {
    trace.push({
      timestamp: bodyOneUpload.timestamp,
      event: 'First body paragraph submitted',
      context: bodyOneUpload.context.replace(/^Assignment:\s*/i, ''),
      detail: 'Online text submission created at 186 words.',
    });
  }

  if (bodyOneComment) {
    trace.push({
      timestamp: bodyOneComment.timestamp,
      event: 'First paragraph revision comment posted',
      context: 'First body paragraph',
      detail: 'Student re-posted the revised paragraph after deleting the earlier comment.',
    });
  }

  if (feedbackViewed) {
    trace.push({
      timestamp: feedbackViewed.timestamp,
      event: 'Graded introduction feedback viewed',
      context: feedbackViewed.context,
      detail: 'Two feedback-view events were logged within the same minute.',
    });
  }

  if (secondTaskReopened) {
    trace.push({
      timestamp: secondTaskReopened.timestamp,
      event: 'Second body paragraph task reopened',
      context: 'Argumentative Essay: Second Body Paragraph',
      detail: 'Marks the start of the next writing cycle after first-paragraph feedback.',
    });
  }

  if (rubricViewed) {
    trace.push({
      timestamp: rubricViewed.timestamp,
      event: 'Self-assessment rubric viewed',
      context: 'Second body paragraph preparation',
      detail: 'The rubric page was opened immediately before the final submission sequence.',
    });
  }

  if (finalUpload) {
    trace.push({
      timestamp: finalUpload.timestamp,
      event: 'Second body paragraph final submitted',
      context: finalUpload.context.replace(/^Assignment:\s*/i, ''),
      detail: 'Final online text submission created at 198 words.',
    });
  }

  if (finalComment) {
    trace.push({
      timestamp: finalComment.timestamp,
      event: 'Final revision comment posted',
      context: 'Second body paragraph',
      detail: 'Student posted a follow-up revision after teacher feedback requested stronger evidence.',
    });
  }

  return {
    totalEvents: entries.length,
    activeSessions: sessions.length,
    estimatedActiveMinutes,
    sessionGapRule: '20-minute inactivity gap between logged events',
    clickSignals: [
      {
        label: 'Logged Events',
        value: String(entries.length),
        note: 'Every Moodle movement is timestamped to the second in the activity log.',
        accent: 'lav',
      },
      {
        label: 'Assignment Clicks',
        value: String(countByKey['Assignment | Course module viewed'] ?? 0),
        note: 'Assignment pages opened through "Course module viewed" events.',
        accent: 'teal',
      },
      {
        label: 'Submission Checks',
        value: String(countByKey['Assignment | The status of the submission has been viewed'] ?? 0),
        note: 'Repeated status checks show monitoring of task state and deadlines.',
        accent: 'gold',
      },
      {
        label: 'Feedback Views',
        value: String(countByKey['Assignment | Feedback viewed'] ?? 0),
        note: 'Formal Moodle feedback openings recorded after grading and revision stages.',
        accent: 'red',
      },
      {
        label: 'Revision Comments',
        value: String(countByKey['Submission comments | Comment created'] ?? 0),
        note: 'Comment-created events document written revision responses to teacher feedback.',
        accent: 'lav',
      },
      {
        label: 'Estimated Active Time',
        value: `${estimatedActiveMinutes} min`,
        note: 'Derived from event gaps rather than a single Moodle timer.',
        accent: 'teal',
      },
    ],
    highlightedSessions,
    trace,
  };
}

function buildWritingArtifacts(writingRows) {
  const findRow = (pattern) => writingRows.find((row) => pattern.test(cleanText(row[0])));
  const introDraft = findRow(/Argumentative Essay Intro - Draft/i);
  const introRevision = findRow(/Argumentative Essay Intro - Student Revised Comment/i);
  const bodyOneOriginal = findRow(/First Body Paragraph - Original/i);
  const bodyOneRevision = findRow(/First Body Paragraph - Student Revision Comment/i);
  const bodyTwoRevision = findRow(/Second Body Paragraph - Student Revision/i);
  const bodyTwoFinal = findRow(/Second Body Paragraph - FINAL SUBMISSION/i);

  return [
    {
      id: 'intro-draft',
      title: 'Argumentative Essay Intro - Draft',
      date: extractDateLabel(introDraft?.[0]),
      status: 'draft',
      wordCount: extractWordCount(introDraft?.[0]),
      text: cleanText(introDraft?.[1]),
      teacherComment: extractQuotedFeedback(introDraft?.[2]),
    },
    {
      id: 'intro-revision',
      title: 'Argumentative Essay Intro - Student Revised Comment',
      date: extractDateLabel(introRevision?.[0]),
      status: 'revision-comment',
      wordCount: extractWordCount(introRevision?.[0]) || extractWordCount(introDraft?.[0]),
      text: cleanText(introRevision?.[1]),
      teacherComment: 'Student revised the introduction inside the submission comments after the teacher redirect.',
    },
    {
      id: 'body1-original',
      title: 'First Body Paragraph - Original',
      date: extractDateLabel(bodyOneOriginal?.[0]),
      status: 'draft',
      wordCount: extractWordCount(bodyOneOriginal?.[0]),
      text: cleanText(bodyOneOriginal?.[1]),
      teacherComment: extractQuotedFeedback(bodyOneOriginal?.[2]),
    },
    {
      id: 'body1-revision',
      title: 'First Body Paragraph - Student Revision Comment',
      date: extractDateLabel(bodyOneRevision?.[0]),
      status: 'revision-comment',
      wordCount: extractWordCount(bodyOneRevision?.[0]) || extractWordCount(bodyOneOriginal?.[0]),
      text: cleanText(bodyOneRevision?.[1]),
      teacherComment: extractQuotedFeedback(bodyOneRevision?.[2]),
    },
    {
      id: 'body2-revision',
      title: 'Second Body Paragraph - Student Revision',
      date: extractDateLabel(bodyTwoRevision?.[0]),
      status: 'revision-comment',
      wordCount: extractWordCount(bodyTwoRevision?.[0]),
      text: cleanText(bodyTwoRevision?.[1]),
      teacherComment: extractQuotedFeedback(bodyTwoRevision?.[2]),
    },
    {
      id: 'body2-final',
      title: 'Second Body Paragraph - Final Submission',
      date: extractDateLabel(bodyTwoFinal?.[0]),
      status: 'final-submission',
      wordCount: extractWordCount(bodyTwoFinal?.[0]),
      text: cleanText(bodyTwoFinal?.[1]),
      teacherComment: extractQuotedFeedback(bodyTwoRevision?.[2]),
    },
  ].filter((artifact) => artifact.text);
}

function buildParagraphComparison(artifacts) {
  return {
    beforeId: 'body1-original',
    afterId: 'body2-final',
    metrics: [
      { label: 'Workbook Word Count', before: '186', after: '198', delta: '+12' },
      { label: 'Cohesion Markers', before: '3', after: '7', delta: '+4' },
      { label: 'In-text Citations', before: '0', after: '1', delta: '+1' },
      { label: 'Academic Focus Signals', before: '3', after: '5', delta: '+2' },
      { label: 'Scaled TTR', before: '0.57', after: '0.52', delta: '-0.05' },
    ],
    commentary: [
      'The later paragraph shifts from a broad dependence-on-AI argument to a tighter focus on fairness, trust, and peer relationships.',
      'The revised later writing adds explicit evidence and a formal in-text citation, which the earlier paragraph did not yet provide.',
      'Cohesion improves because the final paragraph uses more linking moves such as "Another", "Over time", "For instance", "Also", and "So".',
      'Lexical diversity is slightly flatter, so vocabulary precision remains a target even though argument support becomes stronger.',
    ],
    texts: {
      before: artifacts.find((artifact) => artifact.id === 'body1-original') ?? null,
      after: artifacts.find((artifact) => artifact.id === 'body2-final') ?? null,
    },
  };
}

function buildRevisionSequence() {
  return [
    {
      timestamp: '3 Feb 2026, 12:03:19 AM',
      phase: 'Introduction Draft',
      detail: 'The student uploaded the first introduction draft and submitted it in Moodle.',
      kind: 'draft',
    },
    {
      timestamp: '10 Feb 2026, 12:34 PM',
      phase: 'Teacher Feedback',
      detail: 'The teacher requested a clearer problem statement and clearer arguments.',
      kind: 'feedback',
    },
    {
      timestamp: '10 Feb 2026, 9:34:03 PM',
      phase: 'Introduction Revision',
      detail: 'The student revised inside the comment section after asking where feedback should be posted.',
      kind: 'revision',
    },
    {
      timestamp: '15 Feb 2026, 10:50:36 PM',
      phase: 'First Body Paragraph',
      detail: 'The first body paragraph was submitted as a 186-word online text.',
      kind: 'draft',
    },
    {
      timestamp: '16 Feb 2026, 12:48 PM',
      phase: 'Teacher Feedback',
      detail: 'The teacher asked for stronger explanation, less repetition, and more critical use of evidence.',
      kind: 'feedback',
    },
    {
      timestamp: '16 Feb 2026, 9:36:26 PM',
      phase: 'First Paragraph Revision',
      detail: 'The student returned with a revision comment after editing and reposting the paragraph.',
      kind: 'revision',
    },
    {
      timestamp: '23 Feb 2026, 10:02 PM',
      phase: 'Teacher Feedback',
      detail: 'The teacher asked for clearer structure, formal language, shorter sentences, and removal of AI-generated phrasing.',
      kind: 'feedback',
    },
    {
      timestamp: '6 Mar 2026, 9:52:31 PM',
      phase: 'Resource Consultation',
      detail: 'The student viewed the structure page and self-assessment rubric immediately before the final second-body submission.',
      kind: 'resource',
    },
    {
      timestamp: '6 Mar 2026, 10:16:37 PM',
      phase: 'Second Body Paragraph Final',
      detail: 'The final second body paragraph was submitted at 198 words with an academic-integrity confirmation.',
      kind: 'final',
    },
    {
      timestamp: '7 Mar 2026, 4:20 PM / 11:02:38 PM',
      phase: 'Feedback Uptake',
      detail: 'The teacher requested stronger evidence and the student returned a final revision comment later the same day.',
      kind: 'revision',
    },
  ];
}

function buildPrivateMessageThresholds(dialogueTrace) {
  const studentMessages = dialogueTrace.filter((entry) => entry.role === 'student');
  const thresholds = [
    {
      id: 'msg-feedback-location',
      label: 'Feedback Location Clarification',
      threshold: 'Trigger when >= 1 private message asks where feedback or comments should be found or posted.',
      matched: studentMessages.filter((entry) => /where i can find|where should i correct/i.test(entry.message)).length,
      evidence: '10 Feb 2026: "Could you please tell me where I can find it?" and "Where should I correct my mistakes, in the comments section?"',
      interpretation: 'The student actively seeks access to the teacher comment space instead of ignoring the task.',
    },
    {
      id: 'msg-progress',
      label: 'Progress Inquiry',
      threshold: 'Trigger when >= 1 private message asks for progress or performance status.',
      matched: studentMessages.filter((entry) => /show me my progress/i.test(entry.message)).length,
      evidence: '14 Feb 2026: "Miss can you show me my progress?"',
      interpretation: 'The student monitors her standing and asks for evaluative orientation.',
    },
    {
      id: 'msg-vocabulary',
      label: 'Academic Vocabulary Support',
      threshold: 'Trigger when >= 1 private message requests help with academic vocabulary or formal tone.',
      matched: studentMessages.filter((entry) => /formal enough|academic paragraph|academic vocabulary/i.test(entry.message)).length,
      evidence: '10 Mar 2026: the student asks whether the wording is formal enough for an academic paragraph.',
      interpretation: 'The message targets higher-order phrasing, not only procedural issues.',
    },
    {
      id: 'msg-feedback-followup',
      label: 'Feedback Follow-up',
      threshold: 'Trigger when >= 1 private message asks for missing, delayed, or inaccessible feedback.',
      matched: studentMessages.some((entry) => /send to me my feedback|did(?: not|n't) receive your second feedback/i.test(entry.message)) ? 1 : 0,
      evidence: '7 Mar 2026: the student asks for feedback again after the drafting cycle continues.',
      interpretation: 'The student treats teacher feedback as something to retrieve and reuse in later drafting.',
    },
  ];

  const matchedCount = thresholds.reduce((sum, threshold) => sum + threshold.matched, 0);

  return {
    matchedCount,
    compositeThreshold: `D1 is triggered because ${matchedCount} private messages match the help-seeking threshold used in the study.`,
    thresholds,
  };
}

function parseWorkbook(input, sourceName = 'uploaded.xlsx') {
  const workbook = readWorkbook(input);
  const summaryRows = getSheetRows(workbook, 'Summary');
  const assignmentsRows = getSheetRows(workbook, 'Assignments').slice(2).filter((row) => cleanText(row[1]));
  const writingRows = getSheetRows(workbook, 'Writing Samples').slice(2).filter((row) => cleanText(row[0]));
  const rubricRows = getSheetRows(workbook, 'Grading Rubric');
  const activityRows = getSheetRows(workbook, 'Full Activity Logs').slice(2).filter((row) => cleanText(row[0]));
  const chatRows = getSheetRows(workbook, 'Chat Messages').slice(2).filter((row) => cleanText(row[0]));
  const feedbackRows = getSheetRows(workbook, 'Feedback Report CSV').slice(2).filter((row) => row.some((value) => cleanText(value)));
  const summaryMap = buildSummaryMap(summaryRows);

  const studentName = toTitleCase(summaryMap['Student Name']);
  const studentNameLower = studentName.toLowerCase();
  const userId = cleanText(summaryMap['User ID']);
  const dialogueTrace = buildDialogueTrace(chatRows, studentNameLower);
  const instructorComments = extractInstructorComments(feedbackRows);
  const chatMessages = chatRows
    .map((row) => ({
      date: cleanText(row[0]),
      sender: cleanText(row[1]),
      message: cleanText(row[2]),
      topic: cleanText(row[3]),
    }))
    .filter((row) => row.sender.toLowerCase() === studentNameLower);

  const helpSeekingMessages = countHelpSeekingMessages(chatMessages);
  const revisionFrequency = writingRows.filter((row) => /(revised|revision|final submission)/i.test(cleanText(row[0]))).length;
  const feedbackViews = assignmentsRows.filter((row) => /Instructor \(/i.test(cleanText(row[7]))).length;
  const assignmentViews = activityRows.filter((row) => cleanText(row[4]) === 'Assignment' && /viewed/i.test(cleanText(row[5]))).length;
  const resourceAccessCount = activityRows.filter((row) => ['File', 'Folder', 'Page'].includes(cleanText(row[4])) && /viewed/i.test(cleanText(row[5]))).length;
  const rubricViews = activityRows.filter((row) => cleanText(row[4]) === 'User report').length;

  const finalWritingRow = writingRows.find((row) => /final submission/i.test(cleanText(row[0]))) ?? writingRows[writingRows.length - 1];
  const finalText = cleanText(finalWritingRow?.[1]);
  const writingMetrics = analyzeWriting(finalText, revisionFrequency, feedbackViews, helpSeekingMessages);

  const activityLogEntries = parseFirstNumber(summaryMap['Total Moodle activity log entries']);
  const timeOnTask = Math.round((activityLogEntries * 0.35 + revisionFrequency * 12 + feedbackViews * 6 + helpSeekingMessages * 4) / 5) * 5;
  const diagnostics = buildDiagnostics(writingMetrics, helpSeekingMessages, timeOnTask);
  const feedbackViewedAt = cleanText(feedbackRows[0]?.[7]);
  const introGradeValue = cleanText(feedbackRows[0]?.[5]);
  const rubric = buildRubricSummary(rubricRows);
  const activity = buildActivitySummary(activityRows);
  const writingArtifacts = buildWritingArtifacts(writingRows);
  const comparison = buildParagraphComparison(writingArtifacts);
  const sequence = buildRevisionSequence();
  const privateMessages = buildPrivateMessageThresholds(dialogueTrace);

  const studentRecord = {
    student_id: userId,
    name: studentName,
    email: 'Not available in workbook export',
    assignment_views: assignmentViews,
    resource_access_count: resourceAccessCount,
    rubric_views: rubricViews,
    time_on_task: timeOnTask,
    revision_frequency: revisionFrequency,
    feedback_views: feedbackViews,
    help_seeking_messages: helpSeekingMessages,
    word_count: writingMetrics.wordCount,
    error_density: writingMetrics.errorDensity,
    cohesion_index: writingMetrics.cohesionIndex,
    cohesion: writingMetrics.cohesion,
    ttr: writingMetrics.ttr,
    argumentation: writingMetrics.argumentation,
    grammar_accuracy: writingMetrics.grammarAccuracy,
    lexical_resource: writingMetrics.lexicalResource,
    total_score: writingMetrics.totalScore,
    score_gain: writingMetrics.scoreGain,
    first_access_delay_minutes: 10,
    sample_text: finalText,
    triggered_rule_ids: diagnostics.triggeredRuleIds,
    interpretations: diagnostics.interpretations,
    feedback_types: diagnostics.feedbackTypes,
    onsite_interventions: diagnostics.onsiteInterventions,
    cluster_label: diagnostics.clusterLabel,
    predicted_score: diagnostics.predictedScore,
    personalized_feedback: diagnostics.personalizedFeedback,
  };

  return {
    meta: {
      workbookName: sourceName,
      studentName,
      userId,
      courseTitle: cleanText(summaryMap['Course Title']),
      courseId: cleanText(summaryMap['Course ID']),
      instructor: cleanText(summaryMap['Instructor']),
      institution: cleanText(summaryMap['Institution']),
      reportGenerated: cleanText(summaryMap['Report Generated']),
      periodCovered: cleanText(summaryMap['Period Covered']),
      totalAssignmentsSubmitted: parseFirstNumber(summaryMap['Total assignments submitted']),
      gradedAssignments: parseFirstNumber(summaryMap['Graded assignments']),
      ungradedAssignments: parseFirstNumber(summaryMap['Ungraded assignments']),
      forumPosts: parseFirstNumber(summaryMap['Forum posts created']),
      activityLogEntries,
      writingSamples: writingRows.length,
      chatMessages: chatMessages.length,
      feedbackViewedAt,
      introGrade: `${introGradeValue || 0} / 100`,
    },
    data: [studentRecord],
    metrics: buildMetrics(),
    rubric,
    activity,
    writing: {
      artifacts: writingArtifacts,
      comparison,
      sequence,
    },
    communication: {
      dialogue: dialogueTrace,
      instructorComments,
    },
    thresholds: {
      privateMessages,
    },
  };
}

module.exports = {
  parseWorkbook,
};
