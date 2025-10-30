-- Function to extract creative type from ad_format
CREATE OR REPLACE FUNCTION get_utm_content(ad_format TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE 
    WHEN ad_format ILIKE '%carousel%' THEN 'carousel'
    WHEN ad_format ILIKE '%video%' THEN 'video'
    WHEN ad_format ILIKE '%single%image%' THEN 'single_image'
    WHEN ad_format ILIKE '%image%' THEN 'single_image'
    ELSE 'single_image'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to slugify text (lowercase, replace spaces and pipes with underscores)
CREATE OR REPLACE FUNCTION slugify_utm(text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(text, '\s*\|\s*', '_', 'g'), '\s+', '_', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Rebuild all landing_page_url_with_utm fields with correct UTM parameters
UPDATE ads
SET landing_page_url_with_utm = CASE
  WHEN landing_page_url IS NOT NULL AND landing_page_url != '' THEN
    landing_page_url || 
    CASE WHEN landing_page_url LIKE '%?%' THEN '&' ELSE '?' END ||
    'utm_source=' || COALESCE(slugify_utm(source), 'meta') ||
    '&utm_medium=' || COALESCE(slugify_utm(medium), 'paid_social') ||
    '&utm_campaign=' || COALESCE(slugify_utm((SELECT name FROM campaigns WHERE campaigns.id = ads.campaign_id)), '') ||
    '&utm_audience=' || COALESCE(slugify_utm(audience_type), '') ||
    '&utm_content=' || get_utm_content(COALESCE(ad_format, 'single_image')) ||
    '&utm_version=' || COALESCE(version, 'v1')
  ELSE landing_page_url_with_utm
END
WHERE landing_page_url IS NOT NULL AND landing_page_url != '';