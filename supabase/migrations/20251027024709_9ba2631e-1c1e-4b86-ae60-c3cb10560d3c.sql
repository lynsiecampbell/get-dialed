-- Update ad_format based on attached creatives
-- First, set default to Page Post Ad for ads with no creatives
UPDATE public.ads
SET ad_format = 'Page Post Ad'
WHERE NOT EXISTS (
  SELECT 1 FROM ad_creatives WHERE ad_creatives.ad_id = ads.id
);

-- Update to Carousel for ads with multiple creatives
UPDATE public.ads
SET ad_format = 'Carousel'
WHERE (
  SELECT COUNT(*) FROM ad_creatives WHERE ad_creatives.ad_id = ads.id
) > 1;

-- Update to Single Image for ads with one Image creative
UPDATE public.ads
SET ad_format = 'Single Image'
FROM ad_creatives ac
JOIN creatives c ON ac.creative_id = c.id
WHERE ac.ad_id = ads.id
  AND c.creative_type = 'Image'
  AND (SELECT COUNT(*) FROM ad_creatives WHERE ad_creatives.ad_id = ads.id) = 1;

-- Update to Video for ads with one Video creative
UPDATE public.ads
SET ad_format = 'Video'
FROM ad_creatives ac
JOIN creatives c ON ac.creative_id = c.id
WHERE ac.ad_id = ads.id
  AND c.creative_type = 'Video'
  AND (SELECT COUNT(*) FROM ad_creatives WHERE ad_creatives.ad_id = ads.id) = 1;

-- Now rebuild all ad_name values with the correct ad_format
UPDATE public.ads
SET ad_name = c.name || ' | ' || ads.audience_type || ' | ' || ads.ad_format || ' | ' || ads.version
FROM public.campaigns c
WHERE ads.campaign_id = c.id;