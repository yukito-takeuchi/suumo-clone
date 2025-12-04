-- Create building_types table
CREATE TABLE building_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add index
CREATE INDEX idx_building_types_name ON building_types(name);
