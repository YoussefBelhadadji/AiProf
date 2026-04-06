// Assignment Model - Database Schema Only
// NO Grading Logic - That's Python's job

const assignmentSchema = {
  id: { type: 'UUID', primaryKey: true },
  student_id: { type: 'UUID', foreignKey: 'students.id', notNull: true },
  submission_text: { type: 'TEXT' },
  word_count: { type: 'INTEGER' },
  submitted_at: { type: 'TIMESTAMP', notNull: true },
  created_at: { type: 'TIMESTAMP', default: 'NOW()' }
};

module.exports = { assignmentSchema };
