-- Create social_posts table
CREATE TABLE public.social_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id text NOT NULL,
  status text NOT NULL DEFAULT 'Draft',
  platform text NOT NULL,
  campaign text,
  creative_id uuid REFERENCES public.creatives(id) ON DELETE SET NULL,
  copy text,
  utm_link text,
  scheduled_date timestamp with time zone,
  posted_url text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own social posts"
  ON public.social_posts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social posts"
  ON public.social_posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social posts"
  ON public.social_posts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social posts"
  ON public.social_posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON public.social_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();