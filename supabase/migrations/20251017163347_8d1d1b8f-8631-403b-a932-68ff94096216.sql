-- Create creatives table
CREATE TABLE public.creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  creative_name text NOT NULL,
  campaign text,
  status text NOT NULL DEFAULT 'Unassigned' CHECK (status IN ('Assigned', 'Unassigned')),
  creative_group_type text NOT NULL DEFAULT 'Single' CHECK (creative_group_type IN ('Single', 'Carousel')),
  parent_creative_id uuid REFERENCES public.creatives(id) ON DELETE CASCADE,
  creative_type text NOT NULL CHECK (creative_type IN ('Image', 'Video', 'Other')),
  file_url text,
  thumbnail_url text,
  format_dimensions text,
  file_size_mb numeric,
  mime_type text,
  tags text[] DEFAULT '{}',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creatives ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own creatives" 
  ON public.creatives FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own creatives" 
  ON public.creatives FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own creatives" 
  ON public.creatives FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own creatives" 
  ON public.creatives FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_creatives_updated_at
  BEFORE UPDATE ON public.creatives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create junction table for messaging matrix and creatives
CREATE TABLE public.messaging_creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  messaging_id uuid NOT NULL REFERENCES public.messaging_matrix(id) ON DELETE CASCADE,
  creative_id uuid NOT NULL REFERENCES public.creatives(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(messaging_id, creative_id)
);

-- Enable RLS
ALTER TABLE public.messaging_creatives ENABLE ROW LEVEL SECURITY;

-- RLS Policies for junction table
CREATE POLICY "Users can view own messaging creatives" 
  ON public.messaging_creatives FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.messaging_matrix
      WHERE id = messaging_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own messaging creatives" 
  ON public.messaging_creatives FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.messaging_matrix
      WHERE id = messaging_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own messaging creatives" 
  ON public.messaging_creatives FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.messaging_matrix
      WHERE id = messaging_id AND user_id = auth.uid()
    )
  );