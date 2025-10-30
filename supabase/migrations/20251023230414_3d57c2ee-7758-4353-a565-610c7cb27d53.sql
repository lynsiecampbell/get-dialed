-- Update campaigns table messaging structure to new simplified format
-- This migration updates the default structure for the messaging and assets columns

-- First, update the default for messaging to match the new structure
ALTER TABLE campaigns 
ALTER COLUMN messaging SET DEFAULT '{
  "adMessaging": {
    "headlines": [],
    "primaryTexts": []
  },
  "emailMessaging": {
    "subjectLines": [],
    "bodyCopy": []
  },
  "socialMessaging": {
    "postCopy": [],
    "hashtags": []
  },
  "brandMessaging": {
    "brandHeadlines": [],
    "copy": [],
    "taglines": []
  }
}'::jsonb;

-- Update assets default to include all asset types
ALTER TABLE campaigns 
ALTER COLUMN assets SET DEFAULT '{
  "creatives": [],
  "landingPages": [],
  "ads": [],
  "links": []
}'::jsonb;

-- Migrate existing campaigns to new structure (preserve existing data where possible)
UPDATE campaigns
SET messaging = jsonb_build_object(
  'adMessaging', jsonb_build_object(
    'headlines', COALESCE(messaging->'ad'->'headlines', '[]'::jsonb),
    'primaryTexts', COALESCE(messaging->'ad'->'primaryTexts', '[]'::jsonb)
  ),
  'emailMessaging', jsonb_build_object(
    'subjectLines', COALESCE(messaging->'email'->'subjectLines', '[]'::jsonb),
    'bodyCopy', COALESCE(messaging->'email'->'bodyCopy', '[]'::jsonb)
  ),
  'socialMessaging', jsonb_build_object(
    'postCopy', COALESCE(messaging->'brand'->'socialCopy', '[]'::jsonb),
    'hashtags', '[]'::jsonb
  ),
  'brandMessaging', jsonb_build_object(
    'brandHeadlines', COALESCE(messaging->'brand'->'brandHeadlines', '[]'::jsonb),
    'copy', COALESCE(messaging->'brand'->'supportingCopy', '[]'::jsonb),
    'taglines', '[]'::jsonb
  )
)
WHERE messaging IS NOT NULL;