-- Make the campaigns column nullable on landing_pages table
-- This maintains backwards compatibility while we fully transition to the join table
COMMENT ON COLUMN public.landing_pages.campaigns IS 'Deprecated: Use campaign_assets join table instead. This column is kept for backwards compatibility only.';