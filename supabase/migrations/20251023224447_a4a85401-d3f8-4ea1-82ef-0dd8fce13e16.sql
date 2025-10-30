-- Update campaigns table to support new messaging structure
-- Replace message_types and core_messaging with unified messaging and assets structure

ALTER TABLE campaigns 
DROP COLUMN IF EXISTS message_types,
DROP COLUMN IF EXISTS core_messaging;

ALTER TABLE campaigns
ADD COLUMN messaging jsonb DEFAULT '{
  "ad": {
    "headlines": [],
    "primaryTexts": [],
    "ctas": []
  },
  "email": {
    "subjectLines": [],
    "bodyCopy": [],
    "previewText": []
  },
  "brand": {
    "brandHeadlines": [],
    "supportingCopy": [],
    "valueProps": [],
    "painPoints": [],
    "socialCopy": []
  }
}'::jsonb,
ADD COLUMN assets jsonb DEFAULT '{
  "creatives": [],
  "landingPages": [],
  "ads": [],
  "links": []
}'::jsonb;