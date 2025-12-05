-- Create stations table
CREATE TABLE stations (
  id SERIAL PRIMARY KEY,
  railway_line_id INTEGER NOT NULL REFERENCES railway_lines(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(railway_line_id, name)
);

-- Add indexes
CREATE INDEX idx_stations_railway_line_id ON stations(railway_line_id);
CREATE INDEX idx_stations_name ON stations(name);
