/**
 * WriteLens Database Layer (SQLite via better-sqlite3)
 * Provides persistent storage for users, drafts, feedback records,
 * intervention notes, and growth data.
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.resolve(__dirname, 'data', 'writelens.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Schema Migration ────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    username      TEXT UNIQUE NOT NULL,
    email         TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'student'
                  CHECK(role IN ('student','teacher','researcher','admin')),
    display_name  TEXT,
    created_at    TEXT DEFAULT (datetime('now')),
    updated_at    TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS courses (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    instructor  TEXT,
    institution TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id          TEXT PRIMARY KEY,
    course_id   TEXT REFERENCES courses(id),
    title       TEXT NOT NULL,
    description TEXT,
    rubric_json TEXT,
    deadline    TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id      TEXT NOT NULL REFERENCES users(id),
    task_id         TEXT REFERENCES tasks(id),
    draft_no        INTEGER NOT NULL DEFAULT 1,
    content         TEXT NOT NULL,
    word_count      INTEGER DEFAULT 0,
    timestamp_created TEXT DEFAULT (datetime('now')),
    timestamp_updated TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS essays (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id   INTEGER NOT NULL REFERENCES submissions(id),
    task_achievement REAL DEFAULT 0,
    organization    REAL DEFAULT 0,
    argumentation   REAL DEFAULT 0,
    cohesion        REAL DEFAULT 0,
    lexical_resource REAL DEFAULT 0,
    grammar_accuracy REAL DEFAULT 0,
    academic_style  REAL DEFAULT 0,
    mechanics       REAL DEFAULT 0,
    total_score     REAL DEFAULT 0,
    sentence_count  INTEGER DEFAULT 0,
    average_sentence_length REAL DEFAULT 0,
    lexical_diversity_ttr REAL DEFAULT 0,
    cohesion_index  REAL DEFAULT 0,
    error_density   REAL DEFAULT 0,
    academic_vocabulary_count INTEGER DEFAULT 0,
    connector_frequency REAL DEFAULT 0,
    paragraph_length REAL DEFAULT 0,
    claim_presence  INTEGER DEFAULT 0,
    example_presence INTEGER DEFAULT 0,
    explanation_presence INTEGER DEFAULT 0,
    created_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS rubric_scores (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id   INTEGER NOT NULL REFERENCES submissions(id),
    criteria_json   TEXT,
    overall_score   REAL,
    created_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS process_logs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id   INTEGER NOT NULL REFERENCES submissions(id),
    assignment_views INTEGER DEFAULT 0,
    rubric_views    INTEGER DEFAULT 0,
    resource_access_count INTEGER DEFAULT 0,
    first_access_delay_minutes INTEGER DEFAULT 0,
    time_on_task    INTEGER DEFAULT 0,
    revision_frequency INTEGER DEFAULT 0,
    feedback_views  INTEGER DEFAULT 0,
    feedback_delay_before_revision INTEGER DEFAULT 0,
    draft_submission_count INTEGER DEFAULT 0,
    resubmission_count INTEGER DEFAULT 0,
    help_seeking_messages INTEGER DEFAULT 0,
    help_seeking_message_type TEXT,
    reflection_entries INTEGER DEFAULT 0,
    feedback_rereads INTEGER DEFAULT 0,
    last_minute_submission_flag INTEGER DEFAULT 0,
    created_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id      TEXT NOT NULL REFERENCES users(id),
    task_id         TEXT REFERENCES tasks(id),
    message_type    TEXT,
    content         TEXT,
    timing_of_message TEXT,
    self_correction_attempt_flag INTEGER DEFAULT 0,
    created_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS thresholds (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    variable        TEXT NOT NULL,
    lower_bound     REAL,
    upper_bound     REAL,
    category        TEXT,
    band_label      TEXT,
    rationale       TEXT,
    updated_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS rules (
    rule_id         TEXT PRIMARY KEY,
    category        TEXT,
    priority        INTEGER DEFAULT 0,
    condition       TEXT,
    ai_state_required TEXT,
    interpretation  TEXT,
    feedback_template TEXT,
    onsite_intervention TEXT,
    theory_note     TEXT,
    enabled         INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS feedback_templates (
    template_id     TEXT PRIMARY KEY,
    category        TEXT,
    template_text   TEXT NOT NULL,
    pedagogical_need TEXT,
    actionable      INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS ai_outputs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id   INTEGER NOT NULL REFERENCES submissions(id),
    forethought_risk TEXT,
    engagement_risk TEXT,
    revision_depth  TEXT,
    feedback_uptake_state TEXT,
    help_seeking_state TEXT,
    argumentation_state TEXT,
    discourse_state TEXT,
    linguistic_accuracy_state TEXT,
    lexical_state   TEXT,
    learner_profile TEXT,
    predicted_improvement REAL,
    predicted_score_gain REAL,
    predictor_importance TEXT,
    argument_competence_prob REAL,
    cohesion_competence_prob REAL,
    linguistic_competence_prob REAL,
    srl_revision_competence_prob REAL,
    created_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS triggered_rules (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id   INTEGER NOT NULL REFERENCES submissions(id),
    rule_id         TEXT NOT NULL REFERENCES rules(rule_id),
    fired_at        TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS feedback_records (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id         INTEGER REFERENCES submissions(id),
    student_id            TEXT NOT NULL,
    task_id               TEXT,
    draft_no              INTEGER NOT NULL DEFAULT 1,
    status                TEXT NOT NULL DEFAULT 'pending'
                          CHECK(status IN ('pending','approved','overridden','draft')),
    ai_feedback_message   TEXT,
    teacher_edited_message TEXT,
    final_message         TEXT,
    teacher_id            TEXT,
    teacher_override_note TEXT,
    approved_at           TEXT,
    created_at            TEXT DEFAULT (datetime('now')),
    updated_at            TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS intervention_records (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id  TEXT NOT NULL,
    task_id     TEXT,
    draft_no    INTEGER DEFAULT 1,
    teacher_id  TEXT,
    note_type   TEXT DEFAULT 'onsite'
                CHECK(note_type IN ('onsite','online','follow_up')),
    content     TEXT NOT NULL,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS growth_records (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id      TEXT NOT NULL,
    task_id         TEXT,
    from_draft      INTEGER NOT NULL,
    to_draft        INTEGER NOT NULL,
    score_gain      REAL DEFAULT 0,
    argument_gain   REAL DEFAULT 0,
    cohesion_gain   REAL DEFAULT 0,
    lexical_gain    REAL DEFAULT 0,
    grammar_gain    REAL DEFAULT 0,
    error_reduction REAL DEFAULT 0,
    word_growth     INTEGER DEFAULT 0,
    feedback_uptake REAL DEFAULT 0,
    revision_depth  REAL DEFAULT 0,
    computed_at     TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id    TEXT,
    actor_role  TEXT,
    action      TEXT NOT NULL,
    entity_type TEXT,
    entity_id   TEXT,
    detail_json TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
  );
`);

// ─── Prepared Statements ─────────────────────────────────────────────

// Users
const insertUser = db.prepare(`
  INSERT INTO users (id, username, email, password_hash, role, display_name)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const findUserByUsername = db.prepare(`
  SELECT * FROM users WHERE username = ?
`);

const findUserByEmail = db.prepare(`
  SELECT * FROM users WHERE email = ?
`);

const findUserById = db.prepare(`
  SELECT * FROM users WHERE id = ?
`);

const updateUserPassword = db.prepare(`
  UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?
`);

// Submissions
const insertSubmission = db.prepare(`
  INSERT INTO submissions (student_id, task_id, draft_no, content, word_count)
  VALUES (?, ?, ?, ?, ?)
`);

const getSubmissionsByStudent = db.prepare(`
  SELECT * FROM submissions WHERE student_id = ? ORDER BY draft_no DESC
`);

const getSubmissionsByStudentTask = db.prepare(`
  SELECT * FROM submissions WHERE student_id = ? AND task_id = ? ORDER BY draft_no DESC
`);

const getLatestSubmission = db.prepare(`
  SELECT * FROM submissions WHERE student_id = ? AND task_id = ?
  ORDER BY draft_no DESC LIMIT 1
`);

// Feedback
const insertFeedback = db.prepare(`
  INSERT INTO feedback_records
    (submission_id, student_id, task_id, draft_no, status, ai_feedback_message)
  VALUES (?, ?, ?, ?, 'pending', ?)
`);

const updateFeedbackApproval = db.prepare(`
  UPDATE feedback_records
  SET status = 'approved',
      teacher_edited_message = ?,
      final_message = ?,
      teacher_id = ?,
      approved_at = datetime('now'),
      updated_at = datetime('now')
  WHERE id = ?
`);

const updateFeedbackOverride = db.prepare(`
  UPDATE feedback_records
  SET status = 'overridden',
      teacher_edited_message = ?,
      final_message = ?,
      teacher_id = ?,
      teacher_override_note = ?,
      approved_at = datetime('now'),
      updated_at = datetime('now')
  WHERE id = ?
`);

const saveFeedbackDraft = db.prepare(`
  UPDATE feedback_records
  SET status = 'draft',
      teacher_edited_message = ?,
      teacher_id = ?,
      updated_at = datetime('now')
  WHERE id = ?
`);

const getFeedbackForStudent = db.prepare(`
  SELECT * FROM feedback_records
  WHERE student_id = ? AND task_id = ? AND draft_no = ?
  ORDER BY created_at DESC LIMIT 1
`);

const getApprovedFeedbackForStudent = db.prepare(`
  SELECT * FROM feedback_records
  WHERE student_id = ? AND status = 'approved'
  ORDER BY approved_at DESC
`);

const getPendingFeedback = db.prepare(`
  SELECT * FROM feedback_records WHERE status = 'pending' ORDER BY created_at DESC
`);

const getAllFeedbackForStudent = db.prepare(`
  SELECT * FROM feedback_records WHERE student_id = ? ORDER BY created_at DESC
`);

// Interventions
const insertIntervention = db.prepare(`
  INSERT INTO intervention_records (student_id, task_id, draft_no, teacher_id, note_type, content)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const getInterventionsForStudent = db.prepare(`
  SELECT * FROM intervention_records WHERE student_id = ? ORDER BY created_at DESC
`);

// Growth
const insertGrowth = db.prepare(`
  INSERT INTO growth_records
    (student_id, task_id, from_draft, to_draft, score_gain, argument_gain,
     cohesion_gain, lexical_gain, grammar_gain, error_reduction, word_growth)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const getGrowthForStudent = db.prepare(`
  SELECT * FROM growth_records WHERE student_id = ? ORDER BY computed_at DESC
`);

// Audit log
const insertAuditLog = db.prepare(`
  INSERT INTO audit_log (actor_id, actor_role, action, entity_type, entity_id, detail_json)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const getAuditLogs = db.prepare(`
  SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ?
`);

// ─── Seed Default Users ──────────────────────────────────────────────
function seedDefaultUsers(bcryptHashSync, bootstrapPassword) {
  if (!bootstrapPassword) {
    return;
  }

  const defaults = [
    { id: 'admin-001', username: 'admin', email: 'admin@writelens.edu', role: 'admin', display_name: 'System Admin' },
    { id: 'teacher-001', username: 'teacher', email: 'teacher@writelens.edu', role: 'teacher', display_name: 'Dr. Instructor' },
    { id: 'researcher-001', username: 'researcher', email: 'researcher@writelens.edu', role: 'researcher', display_name: 'Research Analyst' },
    { id: 'student-001', username: 'student', email: 'student@writelens.edu', role: 'student', display_name: 'Demo Student' },
  ];

  const existing = db.prepare('SELECT COUNT(*) as cnt FROM users').get();
  if (existing.cnt > 0) return;

  const defaultPassword = bcryptHashSync(bootstrapPassword, 10);
  for (const user of defaults) {
    insertUser.run(user.id, user.username, user.email, defaultPassword, user.role, user.display_name);
  }
}

module.exports = {
  db,
  // Users
  insertUser,
  findUserByUsername,
  findUserByEmail,
  findUserById,
  updateUserPassword,
  seedDefaultUsers,
  // Submissions
  insertSubmission,
  getSubmissionsByStudent,
  getSubmissionsByStudentTask,
  getLatestSubmission,
  // Feedback
  insertFeedback,
  updateFeedbackApproval,
  updateFeedbackOverride,
  saveFeedbackDraft,
  getFeedbackForStudent,
  getApprovedFeedbackForStudent,
  getPendingFeedback,
  getAllFeedbackForStudent,
  // Interventions
  insertIntervention,
  getInterventionsForStudent,
  // Growth
  insertGrowth,
  getGrowthForStudent,
  // Audit
  insertAuditLog,
  getAuditLogs,
};
