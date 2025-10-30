-- Add campaigns array field to landing_pages table
ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS campaigns text[] DEFAULT '{}';

-- Add landing_page_id to ads table to link ads to landing pages
ALTER TABLE ads ADD COLUMN IF NOT EXISTS landing_page_id uuid REFERENCES landing_pages(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_landing_pages_campaigns ON landing_pages USING GIN(campaigns);
CREATE INDEX IF NOT EXISTS idx_ads_landing_page_id ON ads(landing_page_id);