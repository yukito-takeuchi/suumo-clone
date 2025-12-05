-- Create property_stations table (物件と駅の中間テーブル、最大3駅)
CREATE TABLE property_stations (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  walking_minutes INTEGER NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- 1物件につき最大3駅、同じ駅は重複登録不可
  UNIQUE(property_id, station_id),
  CHECK (walking_minutes >= 0),
  CHECK (display_order >= 1 AND display_order <= 3)
);

-- Add indexes
CREATE INDEX idx_property_stations_property_id ON property_stations(property_id);
CREATE INDEX idx_property_stations_station_id ON property_stations(station_id);
CREATE INDEX idx_property_stations_walking_minutes ON property_stations(walking_minutes);
