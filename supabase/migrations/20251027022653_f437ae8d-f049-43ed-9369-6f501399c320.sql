-- Update all existing ad names to use the new format: Campaign | Audience Type | Ad Format | Version
UPDATE public.ads
SET ad_name = campaigns.name || ' | ' || ads.audience_type || ' | Page Post Ad | ' || ads.version
FROM public.campaigns
WHERE ads.campaign_id = campaigns.id
  AND ads.ad_name IS NOT NULL;

-- Also update any ads that don't have an ad_name set yet
UPDATE public.ads
SET ad_name = campaigns.name || ' | ' || ads.audience_type || ' | Page Post Ad | ' || ads.version
FROM public.campaigns
WHERE ads.campaign_id = campaigns.id
  AND ads.ad_name IS NULL;