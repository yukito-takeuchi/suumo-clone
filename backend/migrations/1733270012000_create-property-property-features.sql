-- Create property_property_features table (物件とこだわり条件の中間テーブル)
CREATE TABLE property_property_features (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  feature_id INTEGER NOT NULL REFERENCES property_features(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- 同じ条件は重複登録不可
  UNIQUE(property_id, feature_id)
);

-- Add indexes
CREATE INDEX idx_property_property_features_property_id ON property_property_features(property_id);
CREATE INDEX idx_property_property_features_feature_id ON property_property_features(feature_id);
