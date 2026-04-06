// Student Model - Database Schema Only
// NO AI Logic - That's in Python ai_engine ONLY

const studentSchema = {
  id: { type: 'UUID', primaryKey: true },
  user_id: { type: 'UUID', foreignKey: 'users.id', notNull: true },
  cohort_id: { type: 'UUID', foreignKey: 'cohorts.id' },
  submission_count: { type: 'INTEGER', default: 0 },
  last_activity: { type: 'TIMESTAMP' },
  created_at: { type: 'TIMESTAMP', default: 'NOW()' },
  updated_at: { type: 'TIMESTAMP', default: 'NOW()' }
};

module.exports = { studentSchema };
