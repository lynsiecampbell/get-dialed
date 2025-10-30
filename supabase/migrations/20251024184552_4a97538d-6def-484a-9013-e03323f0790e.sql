-- Add campaign_id column to ads table
ALTER TABLE public.ads 
ADD COLUMN campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE;

-- Backfill campaign_id by matching campaign names
UPDATE public.ads 
SET campaign_id = campaigns.id
FROM public.campaigns
WHERE ads.campaign = campaigns.name 
  AND ads.user_id = campaigns.user_id;

-- Make campaign_id NOT NULL now that it's backfilled
ALTER TABLE public.ads 
ALTER COLUMN campaign_id SET NOT NULL;

-- Drop the old text campaign column
ALTER TABLE public.ads 
DROP COLUMN campaign;

-- Update the auto_create_link_from_ad trigger function to use campaign_id
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
  
  -- Generate the ad name format using full audience type (no abbreviations)
  generated_name := campaign_name || ' | ' || NEW.audience_type || ' | ' || 
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