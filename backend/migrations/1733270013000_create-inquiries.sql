-- Create inquiries table
CREATE TABLE inquiries (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  individual_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  corporate_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  message TEXT NOT NULL,
  contact_name VARCHAR(100) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20),

  status VARCHAR(20) NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'responded')),

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX idx_inquiries_property_id ON inquiries(property_id);
CREATE INDEX idx_inquiries_individual_user_id ON inquiries(individual_user_id);
CREATE INDEX idx_inquiries_corporate_user_id ON inquiries(corporate_user_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);
