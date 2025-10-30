-- Add array columns for headlines and primary_texts to messaging_matrix
ALTER TABLE public.messaging_matrix 
ADD COLUMN IF NOT EXISTS headlines text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS primary_texts text[] DEFAULT '{}';

-- Migrate existing single headline and primary_text to arrays
UPDATE public.messaging_matrix
SET headlines = CASE WHEN headline IS NOT NULL AND headline != '' THEN ARRAY[headline] ELSE '{}' END,
    primary_texts = CASE WHEN primary_text IS NOT NULL AND primary_text != '' THEN ARRAY[primary_text] ELSE '{}' END
WHERE headlines = '{}' OR primary_texts = '{}';