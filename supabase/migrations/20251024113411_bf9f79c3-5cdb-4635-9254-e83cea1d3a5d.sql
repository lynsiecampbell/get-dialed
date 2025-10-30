-- Update all ads that don't have an ad_set_name to use the auto-generated format
UPDATE ads
SET ad_set_name = campaign || ' – ' || audience_type
WHERE ad_set_name IS NULL OR ad_set_name = '';