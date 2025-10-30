-- Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  campaign_type text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Enable RLS on campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaigns
CREATE POLICY "Users can view own campaigns"
  ON public.campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns"
  ON public.campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns"
  ON public.campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing campaigns from messaging_matrix
INSERT INTO public.campaigns (user_id, name, notes, created_at)
SELECT DISTINCT user_id, campaign, notes, created_at
FROM public.messaging_matrix
ON CONFLICT (user_id, name) DO NOTHING;

-- Migrate campaigns from creatives
INSERT INTO public.campaigns (user_id, name, created_at)
SELECT DISTINCT user_id, campaign, created_at
FROM public.creatives
WHERE campaign IS NOT NULL
ON CONFLICT (user_id, name) DO NOTHING;

-- Migrate campaigns from ads
INSERT INTO public.campaigns (user_id, name, created_at)
SELECT DISTINCT user_id, campaign, created_at
FROM public.ads
ON CONFLICT (user_id, name) DO NOTHING;

-- Migrate campaigns from landing_pages (they have arrays)
INSERT INTO public.campaigns (user_id, name, created_at)
SELECT DISTINCT lp.user_id, unnest(lp.campaigns), lp.created_at
FROM public.landing_pages lp
WHERE lp.campaigns IS NOT NULL AND array_length(lp.campaigns, 1) > 0
ON CONFLICT (user_id, name) DO NOTHING;

-- Create campaign_assets join table
CREATE TABLE IF NOT EXISTS public.campaign_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL,
  asset_type text NOT NULL CHECK (asset_type IN ('creative', 'ad', 'landing_page', 'message')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, asset_id, asset_type)
);

-- Enable RLS on campaign_assets
ALTER TABLE public.campaign_assets ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaign_assets
CREATE POLICY "Users can view own campaign assets"
  ON public.campaign_assets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_assets.campaign_id
    AND campaigns.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own campaign assets"
  ON public.campaign_assets FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_assets.campaign_id
    AND campaigns.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own campaign assets"
  ON public.campaign_assets FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_assets.campaign_id
    AND campaigns.user_id = auth.uid()
  ));

-- Migrate existing relationships to campaign_assets

-- Migrate messaging_matrix relationships
INSERT INTO public.campaign_assets (campaign_id, asset_id, asset_type)
SELECT c.id, mm.id, 'message'
FROM public.messaging_matrix mm
JOIN public.campaigns c ON c.name = mm.campaign AND c.user_id = mm.user_id
ON CONFLICT (campaign_id, asset_id, asset_type) DO NOTHING;

-- Migrate creative relationships
INSERT INTO public.campaign_assets (campaign_id, asset_id, asset_type)
SELECT c.id, cr.id, 'creative'
FROM public.creatives cr
JOIN public.campaigns c ON c.name = cr.campaign AND c.user_id = cr.user_id
WHERE cr.campaign IS NOT NULL
ON CONFLICT (campaign_id, asset_id, asset_type) DO NOTHING;

-- Migrate ad relationships
INSERT INTO public.campaign_assets (campaign_id, asset_id, asset_type)
SELECT c.id, a.id, 'ad'
FROM public.ads a
JOIN public.campaigns c ON c.name = a.campaign AND c.user_id = a.user_id
ON CONFLICT (campaign_id, asset_id, asset_type) DO NOTHING;

-- Migrate landing page relationships (from array)
INSERT INTO public.campaign_assets (campaign_id, asset_id, asset_type)
SELECT c.id, lp.id, 'landing_page'
FROM public.landing_pages lp
CROSS JOIN unnest(lp.campaigns) AS campaign_name
JOIN public.campaigns c ON c.name = campaign_name AND c.user_id = lp.user_id
WHERE lp.campaigns IS NOT NULL AND array_length(lp.campaigns, 1) > 0
ON CONFLICT (campaign_id, asset_id, asset_type) DO NOTHING;