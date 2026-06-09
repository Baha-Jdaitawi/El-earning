-- Admin user (password: Admin@123)
INSERT INTO users (name, email, password, role, email_verified)
VALUES (
  'Admin',
  'admin@lms.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TsCJTSS.X/TxR8Kf1GBpVMuQTzAy',
  'admin',
  TRUE
) ON CONFLICT DO NOTHING;

-- Sample categories
INSERT INTO categories (name, description) VALUES
  ('Web Development', 'Frontend and backend web development courses'),
  ('Mobile Development', 'iOS and Android app development'),
  ('Data Science', 'Data analysis, ML and AI courses'),
  ('DevOps', 'CI/CD, cloud and infrastructure courses'),
  ('Design', 'UI/UX and graphic design courses')
ON CONFLICT DO NOTHING;

-- Sample instructor (password: Instructor@123)
INSERT INTO users (name, email, password, role, email_verified)
VALUES (
  'John Instructor',
  'instructor@lms.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TsCJTSS.X/TxR8Kf1GBpVMuQTzAy',
  'instructor',
  TRUE
) ON CONFLICT DO NOTHING;