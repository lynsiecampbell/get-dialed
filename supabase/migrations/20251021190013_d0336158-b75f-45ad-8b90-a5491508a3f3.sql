-- Drop the trigger and function, then recreate with new logic
DROP TRIGGER IF EXISTS create_link_on_ad_insert ON public.ads;
DROP FUNCTION IF EXISTS public.auto_create_link_from_ad();

-- Recreate the function with new naming conventions
CREATE OR REPLACE FUNCTION public.auto_create_link_from_ad()
RETURNS TRIGGER AS $$
DECLARE
  generated_name TEXT;
BEGIN
  -- Generate the ad name format using full audience type (no abbreviations)
  generated_name := NEW.campaign || ' | ' || NEW.audience_type || ' | ' || 
                    NEW.creative_type || ' | v' || NEW.version;
  
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
    NEW.campaign,
    NEW.audience_type,
    COALESCE(NEW.medium, 'paid_social'),
    COALESCE(NEW.source, 'Meta'),
    NEW.landing_page_url,
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Recreate the trigger
CREATE TRIGGER create_link_on_ad_insert
  AFTER INSERT ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_link_from_ad();