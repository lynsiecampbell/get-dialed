-- Fix ad_format values by extracting from ad_name
-- Parse the ad_name format: "Campaign | Audience | Format | Version"
UPDATE public.ads
SET ad_format = SPLIT_PART(ad_name, ' | ', 3)
WHERE ad_name IS NOT NULL 
  AND ad_name LIKE '%|%|%|%'
  AND ad_format != SPLIT_PART(ad_name, ' | ', 3);