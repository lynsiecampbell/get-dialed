-- Add new columns to ads table for creative tracking
ALTER TABLE public.ads 
ADD COLUMN IF NOT EXISTS creative_group_id text,
ADD COLUMN IF NOT EXISTS meta_creative_id text;

-- Create a junction table for many-to-many relationship between ads and creatives
CREATE TABLE IF NOT EXISTS public.ad_creatives (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id uuid NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  creative_id uuid NOT NULL REFERENCES public.creatives(id) ON DELETE CASCADE,
  position integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(ad_id, creative_id)
);

-- Enable RLS on ad_creatives
ALTER TABLE public.ad_creatives ENABLE ROW LEVEL SECURITY;

-- RLS policies for ad_creatives
CREATE POLICY "Users can view own ad creatives"
ON public.ad_creatives
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.ads
    WHERE ads.id = ad_creatives.ad_id
    AND ads.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own ad creatives"
ON public.ad_creatives
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ads
    WHERE ads.id = ad_creatives.ad_id
    AND ads.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own ad creatives"
ON public.ad_creatives
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.ads
    WHERE ads.id = ad_creatives.ad_id
    AND ads.user_id = auth.uid()
  )
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_ad_creatives_ad_id ON public.ad_creatives(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_creative_id ON public.ad_creatives(creative_id);