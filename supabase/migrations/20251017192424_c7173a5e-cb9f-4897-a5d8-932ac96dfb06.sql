-- Create links table for UTM tracking
CREATE TABLE public.links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  link_name TEXT NOT NULL,
  campaign TEXT NOT NULL,
  audience TEXT,
  medium TEXT NOT NULL,
  source TEXT NOT NULL,
  landing_page_url TEXT NOT NULL,
  ad_id UUID,
  creative_id UUID,
  generated_utm_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own links" 
ON public.links 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own links" 
ON public.links 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own links" 
ON public.links 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own links" 
ON public.links 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_links_updated_at
BEFORE UPDATE ON public.links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate UTM URL
CREATE OR REPLACE FUNCTION public.generate_utm_url(
  base_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger to auto-generate UTM URL
CREATE OR REPLACE FUNCTION public.auto_generate_utm_url()
RETURNS TRIGGER AS $$
DECLARE
  content_value TEXT;
BEGIN
  -- Determine utm_content value (use ad name or creative name)
  content_value := NULL;
  
  IF NEW.ad_id IS NOT NULL THEN
    SELECT ad_name INTO content_value FROM public.ads WHERE id = NEW.ad_id;
  END IF;
  
  -- Generate the UTM URL
  NEW.generated_utm_url := public.generate_utm_url(
    NEW.landing_page_url,
    NEW.source,
    NEW.medium,
    NEW.campaign,
    content_value
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Attach trigger to links table
CREATE TRIGGER generate_utm_on_insert_or_update
BEFORE INSERT OR UPDATE ON public.links
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_utm_url();