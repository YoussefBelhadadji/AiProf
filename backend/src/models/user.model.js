// User Model - Database Schema Only
// NO Business Logic Here - Just DB Structure

const userSchema = {
  id: { type: 'UUID', primaryKey: true },
  email: { type: 'VARCHAR(255)', unique: true, notNull: true },
  password_hash: { type: 'VARCHAR(255)', notNull: true },
  role: { type: 'ENUM', values: ['teacher', 'admin', 'student'], notNull: true },
  created_at: { type: 'TIMESTAMP', default: 'NOW()' },
  updated_at: { type: 'TIMESTAMP', default: 'NOW()' }
};

module.exports = { userSchema };
