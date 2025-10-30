-- Rebuild all ad_name values correctly using the ad_format field
UPDATE public.ads
SET ad_name = c.name || ' | ' || ads.audience_type || ' | ' || ads.ad_format || ' | ' || ads.version
FROM public.campaigns c
WHERE ads.campaign_id = c.id;