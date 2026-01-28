-- Create api_keys table for storing encrypted API keys per user
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('anthropic', 'openai', 'google')),
  encrypted_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Enable Row Level Security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Users can only access their own keys
CREATE POLICY "Users can view own keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own keys" ON api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_api_keys_user_provider ON api_keys(user_id, provider);
