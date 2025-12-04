-- Create railway_lines table
CREATE TABLE railway_lines (
  id SERIAL PRIMARY KEY,
  prefecture_id INTEGER NOT NULL REFERENCES prefectures(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(prefecture_id, name)
);

-- Add indexes
CREATE INDEX idx_railway_lines_prefecture_id ON railway_lines(prefecture_id);
CREATE INDEX idx_railway_lines_name ON railway_lines(name);
