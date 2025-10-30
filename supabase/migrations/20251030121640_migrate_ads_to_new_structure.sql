-- Update ads table to work with new ad_campaigns and ad_sets structure

-- Add new columns (platform already exists, so skip it)
ALTER TABLE ads
ADD COLUMN IF NOT EXISTS ad_set_id UUID REFERENCES ad_sets(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS ad_format TEXT,
ADD COLUMN IF NOT EXISTS messaging_id UUID REFERENCES messaging(id) ON DELETE SET NULL;

-- Update campaign from TEXT to UUID later (needs data migration)
-- For now, keep the old 'campaign' text column

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_ads_ad_set_id ON ads(ad_set_id);
CREATE INDEX IF NOT EXISTS idx_ads_messaging_id ON ads(messaging_id);
CREATE INDEX IF NOT EXISTS idx_ads_platform ON ads(platform);

-- Comments
COMMENT ON COLUMN ads.ad_set_id IS 'Links to parent ad_set (which links to ad_campaign)';
COMMENT ON COLUMN ads.platform IS 'Ad platform (Meta, LinkedIn, TikTok, etc.)';
COMMENT ON COLUMN ads.ad_format IS 'Ad format (single_image, video, carousel, collection, etc.)';
COMMENT ON COLUMN ads.messaging_id IS 'Links to messaging for this ad (headlines, body, CTAs)';
