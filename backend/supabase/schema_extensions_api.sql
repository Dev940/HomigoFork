-- Run after schema.sql if your Supabase project matches the minimal core schema.
-- Owner KYC + property listing fields used by Express OwnerPropertyController.

-- Owner business + KYC state (string mirrors product; kyc_verified can stay in sync in app)
ALTER TABLE owner_profiles ADD COLUMN IF NOT EXISTS business_name VARCHAR;
ALTER TABLE owner_profiles ADD COLUMN IF NOT EXISTS owner_type VARCHAR;
ALTER TABLE owner_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE owner_profiles ADD COLUMN IF NOT EXISTS kyc_status VARCHAR DEFAULT 'pending';
ALTER TABLE owner_profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- KYC document submissions (one row per submission; admin updates owner_profiles on approval)
CREATE TABLE IF NOT EXISTS kyc_documents (
  kyc_id SERIAL PRIMARY KEY,
  owner_id INT NOT NULL REFERENCES owner_profiles(owner_id) ON DELETE CASCADE,
  id_type VARCHAR NOT NULL,
  id_number VARCHAR,
  id_front_url TEXT,
  id_back_url TEXT,
  address_doc_type VARCHAR NOT NULL,
  address_doc_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_owner ON kyc_documents(owner_id);

-- Property listing extensions (core table already has title, city, rent, property_type, etc.)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_type VARCHAR DEFAULT 'rent';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS promotion_type VARCHAR DEFAULT 'standard';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS room_type VARCHAR;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS state VARCHAR;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS monthly_rent DECIMAL;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS security_deposit DECIMAL DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS maintenance_charges DECIMAL DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS available_from DATE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS minimum_stay_months INT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS available_rooms INT DEFAULT 1;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS total_rooms INT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bathrooms INT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS balcony BOOLEAN;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS furnishing VARCHAR;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'active';

-- Keep monthly_rent in sync with rent when monthly_rent is null (optional backfill)
UPDATE properties SET monthly_rent = rent WHERE monthly_rent IS NULL AND rent IS NOT NULL;

-- =========================
-- REAL-TIME 1:1 CHAT (CONVERSATIONS MODEL)
-- =========================

-- Conversations between two users (Owner ↔ User, or any two roles)
CREATE TABLE IF NOT EXISTS conversations (
  conversation_id SERIAL PRIMARY KEY,
  user1_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  user2_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT chk_conversations_distinct_users CHECK (user1_id <> user2_id)
);

-- Prevent duplicate conversations (order-independent uniqueness)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_conversations_user_pair
  ON conversations (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id));

-- Extend existing messages table (defined in schema.sql) to support conversation messages
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS conversation_id INT REFERENCES conversations(conversation_id) ON DELETE CASCADE;

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS receiver_id INT REFERENCES users(user_id) ON DELETE SET NULL;

-- Indexes for fast history + unread queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_timestamp
  ON messages (conversation_id, timestamp);

CREATE INDEX IF NOT EXISTS idx_messages_receiver_read
  ON messages (receiver_id, read);

-- Ensure each message belongs to exactly one context (property chat OR 1:1 conversation)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_messages_single_context'
  ) THEN
    ALTER TABLE messages
      ADD CONSTRAINT chk_messages_single_context
      CHECK ((chat_id IS NOT NULL) <> (conversation_id IS NOT NULL));
  END IF;
END $$;
