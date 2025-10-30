-- Add landing_page_url_with_utm column to ads table
ALTER TABLE public.ads 
ADD COLUMN landing_page_url_with_utm TEXT;

-- Add index for better query performance
CREATE INDEX idx_ads_landing_page_url_with_utm ON public.ads(landing_page_url_with_utm);

-- Backfill existing ads with generated UTM URLs where possible
UPDATE public.ads
SET landing_page_url_with_utm = 
  CASE 
    WHEN landing_page_url IS NOT NULL AND source IS NOT NULL AND medium IS NOT NULL THEN
      landing_page_url || 
      CASE WHEN landing_page_url LIKE '%?%' THEN '&' ELSE '?' END ||
      'utm_source=' || LOWER(REPLACE(source, ' ', '_')) ||
      '&utm_medium=' || LOWER(REPLACE(medium, ' ', '_')) ||
      CASE WHEN campaign_id IS NOT NULL THEN 
        '&utm_campaign=' || LOWER(REPLACE((SELECT name FROM campaigns WHERE id = ads.campaign_id), ' ', '_'))
      ELSE '' END
    ELSE landing_page_url
  END
WHERE landing_page_url IS NOT NULL;