-- Update campaigns table status and type constraints

-- First, update any existing data to match new values
UPDATE campaigns 
SET status = 'Planning' 
WHERE status = 'Draft';

-- Drop old constraint and add new one for status
ALTER TABLE campaigns 
DROP CONSTRAINT IF EXISTS campaigns_status_check;

ALTER TABLE campaigns
ADD CONSTRAINT campaigns_status_check 
CHECK (status IN ('Planning', 'Active', 'Paused', 'Completed', 'Archived'));

-- Update default status
ALTER TABLE campaigns 
ALTER COLUMN status SET DEFAULT 'Planning';

-- Add constraint for type column
ALTER TABLE campaigns
ADD CONSTRAINT campaigns_type_check
CHECK (type IN ('Evergreen', 'Content', 'Product', 'Promotional', 'Event'));

-- Comments
COMMENT ON COLUMN campaigns.status IS 'Campaign status: Planning (default), Active, Paused, Completed, Archived';
COMMENT ON COLUMN campaigns.type IS 'Campaign type: Evergreen, Content, Product, Promotional, Event';
