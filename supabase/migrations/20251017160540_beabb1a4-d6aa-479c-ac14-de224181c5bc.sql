-- Add notes column to landing_pages table
ALTER TABLE public.landing_pages 
ADD COLUMN notes text;