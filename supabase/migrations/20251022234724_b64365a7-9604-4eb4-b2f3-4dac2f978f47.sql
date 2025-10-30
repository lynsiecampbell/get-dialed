-- Add manual UTM fields for manually created links
ALTER TABLE public.links 
ADD COLUMN utm_source_manual TEXT,
ADD COLUMN utm_medium_manual TEXT;

COMMENT ON COLUMN public.links.utm_source_manual IS 'Manual UTM source - used only for manually created UTM links';
COMMENT ON COLUMN public.links.utm_medium_manual IS 'Manual UTM medium - used only for manually created UTM links';