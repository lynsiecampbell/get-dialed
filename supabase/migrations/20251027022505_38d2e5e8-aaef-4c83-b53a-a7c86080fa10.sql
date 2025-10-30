-- Update the auto_create_link_from_ad trigger function to use Page Post Ad for ad format
CREATE OR REPLACE FUNCTION public.auto_create_link_from_ad()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  generated_name TEXT;
  campaign_name TEXT;
BEGIN
  -- Get campaign name from campaigns table
  SELECT name INTO campaign_name
  FROM public.campaigns
  WHERE id = NEW.campaign_id;
  
  -- Generate the ad name format: Campaign | Audience Type | Ad Format | Version
  generated_name := campaign_name || ' | ' || NEW.audience_type || ' | ' || 
                    'Page Post Ad' || ' | v' || NEW.version;
  
  -- Insert a new link record for the newly created ad
  INSERT INTO public.links (
    user_id,
    link_name,
    campaign,
    audience,
    medium,
    source,
    landing_page_url,
    ad_id
  )
  VALUES (
    NEW.user_id,
    COALESCE(NEW.ad_name, generated_name),
    campaign_name,
    NEW.audience_type,
    COALESCE(NEW.medium, 'paid_social'),
    COALESCE(NEW.source, 'Meta'),
    NEW.landing_page_url,
    NEW.id
  );
  
  RETURN NEW;
END;
$function$;