-- Create trigger function to auto-create links when ads are created
CREATE OR REPLACE FUNCTION public.auto_create_link_from_ad()
RETURNS TRIGGER AS $$
BEGIN
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
    COALESCE(NEW.ad_name, 'Ad Link - ' || NEW.campaign),
    NEW.campaign,
    NEW.audience_type,
    COALESCE(NEW.medium, 'paid_social'),
    COALESCE(NEW.source, 'Meta'),
    NEW.landing_page_url,
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on ads table to auto-create links
CREATE TRIGGER create_link_on_ad_insert
AFTER INSERT ON public.ads
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_link_from_ad();

-- Backfill existing ads into links table
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
SELECT 
  user_id,
  COALESCE(ad_name, 'Ad Link - ' || campaign),
  campaign,
  audience_type,
  COALESCE(medium, 'paid_social'),
  COALESCE(source, 'Meta'),
  landing_page_url,
  id
FROM public.ads
WHERE id NOT IN (SELECT ad_id FROM public.links WHERE ad_id IS NOT NULL);