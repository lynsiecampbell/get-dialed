-- Update all existing ad names to the new format
UPDATE public.ads
SET ad_name = c.name || ' | ' || ads.audience_type || ' | Page Post Ad | ' || ads.version
FROM public.campaigns c
WHERE ads.campaign_id = c.id
  AND (ads.ad_name IS NULL OR ads.ad_name != c.name || ' | ' || ads.audience_type || ' | Page Post Ad | ' || ads.version);