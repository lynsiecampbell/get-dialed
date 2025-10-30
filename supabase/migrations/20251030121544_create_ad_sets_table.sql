-- Create ad_sets table (middle level of ad execution hierarchy)
CREATE TABLE ad_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  
  -- Basic info
  name TEXT NOT NULL,
  
  -- Status and timing
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'Paused', 'Archived')),
  start_date DATE,
  end_date DATE,
  
  -- Budget (can be set here OR inherited from ad_campaign)
  budget_type TEXT CHECK (budget_type IN ('Daily', 'Lifetime')),
  daily_budget NUMERIC(10, 2),
  lifetime_budget NUMERIC(10, 2),
  spent NUMERIC(10, 2) DEFAULT 0,
  
  -- Targeting (stored as JSONB for flexibility across platforms)
  targeting JSONB, -- Demographics, interests, locations, devices, etc.
  
  -- Placements
  placements JSONB, -- Where ads appear (feed, stories, etc.)
  
  -- Bidding and optimization
  optimization_goal TEXT, -- Conversions, Link Clicks, Impressions, etc.
  bid_strategy TEXT,
  bid_amount NUMERIC(10, 2),
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ad_sets_ad_campaign_id ON ad_sets(ad_campaign_id);
CREATE INDEX idx_ad_sets_user_id ON ad_sets(user_id);
CREATE INDEX idx_ad_sets_status ON ad_sets(status);

-- RLS
ALTER TABLE ad_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ad sets"
  ON ad_sets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ad sets"
  ON ad_sets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ad sets"
  ON ad_sets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ad sets"
  ON ad_sets FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_ad_sets_updated_at
  BEFORE UPDATE ON ad_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE ad_sets IS 'Mid-level ad targeting and budget settings (maps to Meta Ad Set, LinkedIn Campaign, TikTok Ad Group)';
COMMENT ON COLUMN ad_sets.ad_campaign_id IS 'Links to parent ad_campaign';
COMMENT ON COLUMN ad_sets.targeting IS 'Platform-specific targeting settings (demographics, interests, locations, etc.)';
COMMENT ON COLUMN ad_sets.placements IS 'Where ads appear (feed, stories, search, etc.)';
