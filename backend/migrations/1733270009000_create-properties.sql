-- Create properties table
CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  corporate_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Location
  prefecture_id INTEGER NOT NULL REFERENCES prefectures(id),
  address TEXT NOT NULL,

  -- Building info
  building_type_id INTEGER NOT NULL REFERENCES building_types(id),
  building_name VARCHAR(255),
  building_age INTEGER, -- 築年数
  floor_number INTEGER, -- 階数
  total_floors INTEGER, -- 総階数

  -- Room info
  floor_plan_type_id INTEGER NOT NULL REFERENCES floor_plan_types(id),
  area DECIMAL(6,2) NOT NULL, -- m²

  -- Price info
  rent INTEGER NOT NULL, -- 賃料（円）
  management_fee INTEGER DEFAULT 0, -- 管理費（円）
  deposit INTEGER DEFAULT 0, -- 敷金（円）
  key_money INTEGER DEFAULT 0, -- 礼金（円）

  -- Status
  is_published BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CHECK (rent >= 0),
  CHECK (management_fee >= 0),
  CHECK (deposit >= 0),
  CHECK (key_money >= 0),
  CHECK (area > 0),
  CHECK (building_age >= 0)
);

-- Add indexes for search performance
CREATE INDEX idx_properties_corporate_user_id ON properties(corporate_user_id);
CREATE INDEX idx_properties_prefecture_id ON properties(prefecture_id);
CREATE INDEX idx_properties_building_type_id ON properties(building_type_id);
CREATE INDEX idx_properties_floor_plan_type_id ON properties(floor_plan_type_id);
CREATE INDEX idx_properties_rent ON properties(rent);
CREATE INDEX idx_properties_area ON properties(area);
CREATE INDEX idx_properties_building_age ON properties(building_age);
CREATE INDEX idx_properties_is_published ON properties(is_published);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);

-- Full-text search index for title and description
CREATE INDEX idx_properties_title_description_fulltext ON properties
  USING gin(to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '')));
