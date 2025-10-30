-- Add Meta export fields to ads table
ALTER TABLE public.ads
ADD COLUMN IF NOT EXISTS objective text,
ADD COLUMN IF NOT EXISTS campaign_budget numeric,
ADD COLUMN IF NOT EXISTS start_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS age_max integer DEFAULT 64,
ADD COLUMN IF NOT EXISTS caption text,
ADD COLUMN IF NOT EXISTS creative_filename text;