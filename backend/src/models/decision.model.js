// Decision Model - Stores AI Decision Output ONLY
// Does NOT create decisions - just stores what Python returns

const decisionSchema = {
  id: { type: 'UUID', primaryKey: true },
  student_id: { type: 'UUID', foreignKey: 'students.id', notNull: true },
  ai_decision_json: { type: 'JSONB', notNull: true }, // Direct output from Python
  decision_timestamp: { type: 'TIMESTAMP', notNull: true },
  pipeline_version: { type: 'VARCHAR(10)' }, // v1, v2, etc
  created_at: { type: 'TIMESTAMP', default: 'NOW()' }
};

module.exports = { decisionSchema };
