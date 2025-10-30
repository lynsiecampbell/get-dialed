-- Fix search_path for newly created functions
DROP FUNCTION IF EXISTS get_utm_content(TEXT);
DROP FUNCTION IF EXISTS slugify_utm(TEXT);

CREATE OR REPLACE FUNCTION get_utm_content(ad_format TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
BEGIN
  RETURN CASE 
    WHEN ad_format ILIKE '%carousel%' THEN 'carousel'
    WHEN ad_format ILIKE '%video%' THEN 'video'
    WHEN ad_format ILIKE '%single%image%' THEN 'single_image'
    WHEN ad_format ILIKE '%image%' THEN 'single_image'
    ELSE 'single_image'
  END;
END;
$$;

CREATE OR REPLACE FUNCTION slugify_utm(text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(text, '\s*\|\s*', '_', 'g'), '\s+', '_', 'g'));
END;
$$;