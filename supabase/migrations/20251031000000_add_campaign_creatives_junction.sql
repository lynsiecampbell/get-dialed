-- Create campaign_creatives junction table
CREATE TABLE IF NOT EXISTS campaign_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  creative_id UUID NOT NULL REFERENCES creatives(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, creative_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_campaign_creatives_campaign_id ON campaign_creatives(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_creatives_creative_id ON campaign_creatives(creative_id);

-- Enable RLS
ALTER TABLE campaign_creatives ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view campaign_creatives if they own the campaign
CREATE POLICY "Users can view own campaign_creatives" ON campaign_creatives FOR SELECT
USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_creatives.campaign_id AND campaigns.user_id = auth.uid()));

-- Users can insert campaign_creatives if they own the campaign
CREATE POLICY "Users can insert own campaign_creatives" ON campaign_creatives FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_creatives.campaign_id AND campaigns.user_id = auth.uid()));

-- Users can update campaign_creatives if they own the campaign
CREATE POLICY "Users can update own campaign_creatives" ON campaign_creatives FOR UPDATE
USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_creatives.campaign_id AND campaigns.user_id = auth.uid()));

-- Users can delete campaign_creatives if they own the campaign
CREATE POLICY "Users can delete own campaign_creatives" ON campaign_creatives FOR DELETE
USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_creatives.campaign_id AND campaigns.user_id = auth.uid()));
