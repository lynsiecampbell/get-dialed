-- Add display_link column to ads table
ALTER TABLE public.ads 
ADD COLUMN IF NOT EXISTS display_link text;