-- Create ad_campaigns table (top level of ad execution hierarchy)
CREATE TABLE ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Basic info
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('Meta', 'LinkedIn', 'TikTok', 'Google', 'Twitter', 'Pinterest', 'Other')),
  objective TEXT, -- Traffic, Conversions, Awareness, etc.
  
  -- Status and timing
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'Paused', 'Completed', 'Archived')),
  start_date DATE,
  end_date DATE,
  
  -- Budget (can be set at campaign OR ad_set level)
  budget_type TEXT CHECK (budget_type IN ('Daily', 'Lifetime')),
  daily_budget NUMERIC(10, 2),
  lifetime_budget NUMERIC(10, 2),
  spent NUMERIC(10, 2) DEFAULT 0,
  
  -- Platform-specific settings
  bid_strategy TEXT,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, name)
);

-- Indexes
CREATE INDEX idx_ad_campaigns_campaign_id ON ad_campaigns(campaign_id);
CREATE INDEX idx_ad_campaigns_user_id ON ad_campaigns(user_id);
CREATE INDEX idx_ad_campaigns_platform ON ad_campaigns(platform);
CREATE INDEX idx_ad_campaigns_status ON ad_campaigns(status);

-- RLS
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ad campaigns"
  ON ad_campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ad campaigns"
  ON ad_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ad campaigns"
  ON ad_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ad campaigns"
  ON ad_campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_ad_campaigns_updated_at
  BEFORE UPDATE ON ad_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE ad_campaigns IS 'Top-level ad execution settings (maps to Meta Campaign, LinkedIn Campaign Group, TikTok Campaign)';
COMMENT ON COLUMN ad_campaigns.campaign_id IS 'Links to organizational campaign (asset library)';
COMMENT ON COLUMN ad_campaigns.platform IS 'Ad platform (Meta, LinkedIn, TikTok, etc.)';
COMMENT ON COLUMN ad_campaigns.objective IS 'Campaign objective (Traffic, Conversions, Awareness, etc.)';
