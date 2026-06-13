/**
 * Mints HS256 JWTs for Newman test environment using JWT_SECRET_KEY from .env.
 * Overwrites jwt_token_* values in environments/local.json before Newman runs.
 * Run automatically via: npm run test:newman
 */

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const secret = process.env.JWT_SECRET_KEY;
if (!secret || secret.trim() === '') {
  console.error('[mint-tokens] JWT_SECRET_KEY not set in .env — Newman will run with placeholder tokens');
  process.exit(0); // non-fatal: Newman will fail individual tests, not the whole run
}

const mint = (email, role, extra = {}) =>
  jwt.sign(
    {
      sub: email,
      email,
      role,
      roles: [role],
      onboarding_completed: true,
      ...extra,
    },
    secret,
    { expiresIn: '4h' }
  );

const updates = {
  jwt_token_student: mint('self-student@example.com', 'student', { student_type: 'self_enrolled' }),
  jwt_token_teacher: mint('teacher@example.com', 'teacher'),
  jwt_token_institution: mint('institution@example.com', 'institution', { institution_name: 'Test Academy' }),
};

const envFile = path.join(__dirname, 'environments/local.json');
const env = JSON.parse(fs.readFileSync(envFile, 'utf-8'));
env.values = env.values.map((v) =>
  updates[v.key] ? { ...v, value: updates[v.key] } : v
);
fs.writeFileSync(envFile, JSON.stringify(env, null, 2));
console.log('[mint-tokens] JWT tokens minted and written to environments/local.json');
