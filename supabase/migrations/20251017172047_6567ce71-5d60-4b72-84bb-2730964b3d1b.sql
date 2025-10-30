-- Add medium and source columns to ads table
ALTER TABLE public.ads 
ADD COLUMN medium text,
ADD COLUMN source text;