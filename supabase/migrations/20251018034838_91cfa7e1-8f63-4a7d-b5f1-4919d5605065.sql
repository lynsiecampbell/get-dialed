-- Create messaging_landing_pages association table
CREATE TABLE IF NOT EXISTS public.messaging_landing_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  messaging_id UUID NOT NULL REFERENCES public.messaging_matrix(id) ON DELETE CASCADE,
  landing_page_id UUID NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(messaging_id, landing_page_id)
);

-- Enable RLS
ALTER TABLE public.messaging_landing_pages ENABLE ROW LEVEL SECURITY;

-- Create policies for messaging_landing_pages
CREATE POLICY "Users can view own messaging landing pages"
ON public.messaging_landing_pages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.messaging_matrix
    WHERE messaging_matrix.id = messaging_landing_pages.messaging_id
    AND messaging_matrix.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own messaging landing pages"
ON public.messaging_landing_pages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.messaging_matrix
    WHERE messaging_matrix.id = messaging_landing_pages.messaging_id
    AND messaging_matrix.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own messaging landing pages"
ON public.messaging_landing_pages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.messaging_matrix
    WHERE messaging_matrix.id = messaging_landing_pages.messaging_id
    AND messaging_matrix.user_id = auth.uid()
  )
);

-- Create messaging_ads association table
CREATE TABLE IF NOT EXISTS public.messaging_ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  messaging_id UUID NOT NULL REFERENCES public.messaging_matrix(id) ON DELETE CASCADE,
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(messaging_id, ad_id)
);

-- Enable RLS
ALTER TABLE public.messaging_ads ENABLE ROW LEVEL SECURITY;

-- Create policies for messaging_ads
CREATE POLICY "Users can view own messaging ads"
ON public.messaging_ads
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.messaging_matrix
    WHERE messaging_matrix.id = messaging_ads.messaging_id
    AND messaging_matrix.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own messaging ads"
ON public.messaging_ads
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.messaging_matrix
    WHERE messaging_matrix.id = messaging_ads.messaging_id
    AND messaging_matrix.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own messaging ads"
ON public.messaging_ads
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.messaging_matrix
    WHERE messaging_matrix.id = messaging_ads.messaging_id
    AND messaging_matrix.user_id = auth.uid()
  )
);