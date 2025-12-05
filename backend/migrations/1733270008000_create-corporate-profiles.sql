-- Create corporate_profiles table
CREATE TABLE corporate_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  license_number VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add index
CREATE INDEX idx_corporate_profiles_user_id ON corporate_profiles(user_id);
CREATE INDEX idx_corporate_profiles_company_name ON corporate_profiles(company_name);
