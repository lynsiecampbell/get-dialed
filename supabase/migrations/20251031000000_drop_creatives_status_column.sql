-- Drop the status column from creatives table
-- This column is causing schema cache issues and is not needed
ALTER TABLE public.creatives DROP COLUMN IF EXISTS status;
