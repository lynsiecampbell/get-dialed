-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for creative images
INSERT INTO storage.buckets (id, name, public)
VALUES ('creative-images', 'creative-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for creative images
CREATE POLICY "Anyone can view creative images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'creative-images');

CREATE POLICY "Authenticated users can upload creative images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'creative-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own creative images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'creative-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own creative images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'creative-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create creative_library table
CREATE TABLE public.creative_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign TEXT NOT NULL,
  headline TEXT,
  primary_text TEXT,
  cta TEXT,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.creative_library ENABLE ROW LEVEL SECURITY;

-- Creative library policies
CREATE POLICY "Users can view own creatives"
  ON public.creative_library FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own creatives"
  ON public.creative_library FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own creatives"
  ON public.creative_library FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own creatives"
  ON public.creative_library FOR DELETE
  USING (auth.uid() = user_id);

-- Create ads table
CREATE TABLE public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'Paused', 'Archived')),
  campaign TEXT NOT NULL,
  audience_type TEXT NOT NULL,
  creative_id UUID REFERENCES public.creative_library(id) ON DELETE SET NULL,
  creative_type TEXT NOT NULL,
  version TEXT NOT NULL,
  headline TEXT,
  primary_text TEXT,
  landing_page_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Ads policies
CREATE POLICY "Users can view own ads"
  ON public.ads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ads"
  ON public.ads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ads"
  ON public.ads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ads"
  ON public.ads FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_creative_library_updated_at
  BEFORE UPDATE ON public.creative_library
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ads_updated_at
  BEFORE UPDATE ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();