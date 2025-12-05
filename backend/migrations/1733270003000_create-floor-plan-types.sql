-- Create floor_plan_types table
CREATE TABLE floor_plan_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add index
CREATE INDEX idx_floor_plan_types_display_order ON floor_plan_types(display_order);
