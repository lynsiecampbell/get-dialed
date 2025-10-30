-- Rename existing creative_type column to ad_format
ALTER TABLE public.ads 
RENAME COLUMN creative_type TO ad_format;

-- Create new creative_type column with default value
ALTER TABLE public.ads 
ADD COLUMN creative_type text NOT NULL DEFAULT 'Page Post Ad';

-- Update existing records to have the new creative_type value
UPDATE public.ads 
SET creative_type = 'Page Post Ad' 
WHERE creative_type IS NULL OR creative_type = '';