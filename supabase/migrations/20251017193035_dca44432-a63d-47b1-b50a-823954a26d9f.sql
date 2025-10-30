-- Update trigger function to generate proper ad name format for link name
CREATE OR REPLACE FUNCTION public.auto_create_link_from_ad()
RETURNS TRIGGER AS $$
DECLARE
  audience_abbrev TEXT;
  generated_name TEXT;
BEGIN
  -- Generate audience abbreviation
  audience_abbrev := CASE 
    WHEN NEW.audience_type = 'Retargeting' THEN 'RT'
    WHEN NEW.audience_type = 'Lookalike' THEN 'LAL'
    ELSE 'CLD'
  END;
  
  -- Generate the ad name format
  generated_name := NEW.campaign || ' | ' || audience_abbrev || ' | ' || 
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update existing links with proper names
UPDATE public.links
SET link_name = (
  SELECT 
    CASE 
      WHEN ads.ad_name IS NOT NULL THEN ads.ad_name
      ELSE ads.campaign || ' | ' || 
           CASE 
             WHEN ads.audience_type = 'Retargeting' THEN 'RT'
             WHEN ads.audience_type = 'Lookalike' THEN 'LAL'
             ELSE 'CLD'
           END || ' | ' || 
           ads.creative_type || ' | v' || ads.version
    END
  FROM public.ads
  WHERE ads.id = links.ad_id
)
WHERE ad_id IS NOT NULL;