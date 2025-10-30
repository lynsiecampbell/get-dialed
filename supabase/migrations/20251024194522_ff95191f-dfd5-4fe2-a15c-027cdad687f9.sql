-- Add campaign-level settings for Meta exports and reporting
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Paused', 'Archived')),
ADD COLUMN IF NOT EXISTS objective TEXT,
ADD COLUMN IF NOT EXISTS buying_type TEXT DEFAULT 'Auction',
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS daily_budget NUMERIC(10, 2);

-- Add comment explaining these fields
COMMENT ON COLUMN campaigns.status IS 'Campaign status for ad exports (Active, Paused, Archived)';
COMMENT ON COLUMN campaigns.objective IS 'Campaign objective for Meta exports (Awareness, Traffic, etc.)';
COMMENT ON COLUMN campaigns.buying_type IS 'Buying type for Meta (default: Auction)';
COMMENT ON COLUMN campaigns.daily_budget IS 'Daily budget in USD for the campaign';