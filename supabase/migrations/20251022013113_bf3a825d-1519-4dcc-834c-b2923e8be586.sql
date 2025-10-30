-- Fix search_path for generate_utm_url function
CREATE OR REPLACE FUNCTION public.generate_utm_url(base_url text, utm_source text, utm_medium text, utm_campaign text, utm_content text DEFAULT NULL::text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  result_url TEXT;
  separator TEXT;
  campaign_slug TEXT;
  content_slug TEXT;
BEGIN
  -- Start with base URL
  result_url := base_url;
  
  -- Determine separator (? or &)
  IF position('?' in base_url) > 0 THEN
    separator := '&';
  ELSE
    separator := '?';
  END IF;
  
  -- Create campaign slug (lowercase, replace spaces with underscores)
  campaign_slug := lower(replace(utm_campaign, ' ', '_'));
  
  -- Add UTM parameters
  result_url := result_url || separator || 'utm_source=' || lower(replace(utm_source, ' ', '_'));
  result_url := result_url || '&utm_medium=' || lower(replace(utm_medium, ' ', '_'));
  result_url := result_url || '&utm_campaign=' || campaign_slug;
  
  -- Add utm_content if provided
  IF utm_content IS NOT NULL AND utm_content != '' THEN
    content_slug := lower(replace(utm_content, ' ', '_'));
    result_url := result_url || '&utm_content=' || content_slug;
  END IF;
  
  RETURN result_url;
END;
$function$;