-- Create property_features table (こだわり条件マスター)
CREATE TABLE property_features (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add index
CREATE INDEX idx_property_features_name ON property_features(name);
