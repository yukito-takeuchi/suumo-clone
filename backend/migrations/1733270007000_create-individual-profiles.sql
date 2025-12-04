-- Create individual_profiles table
CREATE TABLE individual_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  phone VARCHAR(20),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add index
CREATE INDEX idx_individual_profiles_user_id ON individual_profiles(user_id);
