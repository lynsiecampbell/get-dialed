-- Create messaging table for storing ad messaging variations
CREATE TABLE IF NOT EXISTS public.messaging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  messaging_type TEXT NOT NULL CHECK (messaging_type IN ('ad', 'brand', 'email', 'social')),
  headlines TEXT[] DEFAULT '{}',
  body_copy TEXT[] DEFAULT '{}',
  cta_labels TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on messaging table
ALTER TABLE public.messaging ENABLE ROW LEVEL SECURITY;

-- RLS policies for messaging
CREATE POLICY "Users can view own messaging"
  ON public.messaging FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messaging"
  ON public.messaging FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messaging"
  ON public.messaging FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messaging"
  ON public.messaging FOR DELETE
  USING (auth.uid() = user_id);

-- Create campaign_messaging junction table
CREATE TABLE IF NOT EXISTS public.campaign_messaging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  messaging_id UUID NOT NULL REFERENCES public.messaging(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(campaign_id, messaging_id)
);

-- Enable RLS on campaign_messaging
ALTER TABLE public.campaign_messaging ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaign_messaging
CREATE POLICY "Users can view own campaign messaging"
  ON public.campaign_messaging FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_messaging.campaign_id
    AND campaigns.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own campaign messaging"
  ON public.campaign_messaging FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_messaging.campaign_id
    AND campaigns.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own campaign messaging"
  ON public.campaign_messaging FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_messaging.campaign_id
    AND campaigns.user_id = auth.uid()
  ));

-- Create campaign_landing_pages junction table
CREATE TABLE IF NOT EXISTS public.campaign_landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  landing_page_id UUID NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(campaign_id, landing_page_id)
);

-- Enable RLS on campaign_landing_pages
ALTER TABLE public.campaign_landing_pages ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaign_landing_pages
CREATE POLICY "Users can view own campaign landing pages"
  ON public.campaign_landing_pages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_landing_pages.campaign_id
    AND campaigns.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own campaign landing pages"
  ON public.campaign_landing_pages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_landing_pages.campaign_id
    AND campaigns.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own campaign landing pages"
  ON public.campaign_landing_pages FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_landing_pages.campaign_id
    AND campaigns.user_id = auth.uid()
  ));

-- Create campaign_links junction table
CREATE TABLE IF NOT EXISTS public.campaign_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(campaign_id, link_id)
);

-- Enable RLS on campaign_links
ALTER TABLE public.campaign_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaign_links
CREATE POLICY "Users can view own campaign links"
  ON public.campaign_links FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_links.campaign_id
    AND campaigns.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own campaign links"
  ON public.campaign_links FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_links.campaign_id
    AND campaigns.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own campaign links"
  ON public.campaign_links FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_links.campaign_id
    AND campaigns.user_id = auth.uid()
  ));

-- Add missing columns to creatives table
ALTER TABLE public.creatives 
  ADD COLUMN IF NOT EXISTS name TEXT;

-- Update existing rows to have a name if they don't
UPDATE public.creatives 
SET name = creative_name 
WHERE name IS NULL AND creative_name IS NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaign_messaging_campaign ON public.campaign_messaging(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_messaging_messaging ON public.campaign_messaging(messaging_id);
CREATE INDEX IF NOT EXISTS idx_campaign_landing_pages_campaign ON public.campaign_landing_pages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_landing_pages_landing_page ON public.campaign_landing_pages(landing_page_id);
CREATE INDEX IF NOT EXISTS idx_campaign_links_campaign ON public.campaign_links(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_links_link ON public.campaign_links(link_id);
CREATE INDEX IF NOT EXISTS idx_messaging_campaign ON public.messaging(campaign_id);
CREATE INDEX IF NOT EXISTS idx_messaging_user ON public.messaging(user_id);

-- Add trigger to update updated_at on messaging
CREATE OR REPLACE FUNCTION public.update_messaging_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_messaging_updated_at
  BEFORE UPDATE ON public.messaging
  FOR EACH ROW
  EXECUTE FUNCTION public.update_messaging_updated_at();