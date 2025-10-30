-- Add new messaging structure fields to campaigns table
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS core_messaging JSONB DEFAULT '{"valueProp": "", "tagline": "", "painPoint": ""}'::jsonb,
ADD COLUMN IF NOT EXISTS message_types JSONB DEFAULT '{"headlines": [], "primaryText": [], "subjectLines": [], "ctaCopy": [], "socialCopy": []}'::jsonb;

-- Create index for faster JSONB queries
CREATE INDEX IF NOT EXISTS idx_campaigns_message_types ON public.campaigns USING gin(message_types);
CREATE INDEX IF NOT EXISTS idx_campaigns_core_messaging ON public.campaigns USING gin(core_messaging);

-- Migrate existing headlines and primary texts from messaging_matrix to campaigns
UPDATE public.campaigns c
SET message_types = jsonb_set(
  jsonb_set(
    c.message_types,
    '{headlines}',
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('text', headline, 'notes', ''))
       FROM unnest(m.headlines) AS headline),
      '[]'::jsonb
    )
  ),
  '{primaryText}',
  COALESCE(
    (SELECT jsonb_agg(jsonb_build_object('text', primary_text, 'notes', ''))
     FROM unnest(m.primary_texts) AS primary_text),
    '[]'::jsonb
  )
)
FROM public.messaging_matrix m
WHERE m.campaign = c.name 
  AND m.user_id = c.user_id
  AND (array_length(m.headlines, 1) > 0 OR array_length(m.primary_texts, 1) > 0);

COMMENT ON COLUMN public.campaigns.core_messaging IS 'Core messaging: valueProp, tagline, painPoint';
COMMENT ON COLUMN public.campaigns.message_types IS 'Message variants: headlines, primaryText, subjectLines, ctaCopy, socialCopy';