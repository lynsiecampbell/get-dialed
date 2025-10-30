-- Create ad_creatives junction table
CREATE TABLE IF NOT EXISTS ad_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  creative_id UUID NOT NULL REFERENCES creatives(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ad_id, creative_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_ad_creatives_ad_id ON ad_creatives(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_creative_id ON ad_creatives(creative_id);

-- Enable RLS
ALTER TABLE ad_creatives ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own ad_creatives" ON ad_creatives FOR SELECT
USING (EXISTS (SELECT 1 FROM ads WHERE ads.id = ad_creatives.ad_id AND ads.user_id = auth.uid()));

CREATE POLICY "Users can insert own ad_creatives" ON ad_creatives FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM ads WHERE ads.id = ad_creatives.ad_id AND ads.user_id = auth.uid()));

CREATE POLICY "Users can update own ad_creatives" ON ad_creatives FOR UPDATE
USING (EXISTS (SELECT 1 FROM ads WHERE ads.id = ad_creatives.ad_id AND ads.user_id = auth.uid()));

CREATE POLICY "Users can delete own ad_creatives" ON ad_creatives FOR DELETE
USING (EXISTS (SELECT 1 FROM ads WHERE ads.id = ad_creatives.ad_id AND ads.user_id = auth.uid()));

-- Add columns to ads table
ALTER TABLE ads 
ADD COLUMN IF NOT EXISTS messaging_id UUID REFERENCES messaging(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS headline_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS body_copy_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cta_index INTEGER DEFAULT 0;

-- Add index
CREATE INDEX IF NOT EXISTS idx_ads_messaging_id ON ads(messaging_id);
