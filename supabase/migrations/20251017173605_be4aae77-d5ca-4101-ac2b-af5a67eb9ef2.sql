-- Add new columns to ads table
ALTER TABLE public.ads 
ADD COLUMN IF NOT EXISTS ad_set_name text,
ADD COLUMN IF NOT EXISTS ad_name text,
ADD COLUMN IF NOT EXISTS utm_link text;