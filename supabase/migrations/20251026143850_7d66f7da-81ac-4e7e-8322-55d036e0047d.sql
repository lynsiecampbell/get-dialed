-- Set default value for creative_type in ads table
ALTER TABLE public.ads 
ALTER COLUMN creative_type SET DEFAULT 'Page Post Ad';

-- Update existing NULL creative_type values to 'Page Post Ad'
UPDATE public.ads 
SET creative_type = 'Page Post Ad' 
WHERE creative_type IS NULL OR creative_type = '';