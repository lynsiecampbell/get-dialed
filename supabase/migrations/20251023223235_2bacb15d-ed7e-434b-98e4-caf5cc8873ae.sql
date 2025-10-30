-- Update campaigns table to support new messaging structure
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS core_messaging jsonb DEFAULT '{"valueProp": "", "tagline": "", "painPoint": ""}'::jsonb,
ADD COLUMN IF NOT EXISTS message_types jsonb DEFAULT '{"headlines": [], "primaryTexts": [], "emailSubjectLines": [], "ctaCopy": [], "socialCopy": []}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN campaigns.core_messaging IS 'Core campaign messaging including value proposition, tagline, and pain point';
COMMENT ON COLUMN campaigns.message_types IS 'All message types for the campaign including headlines, primary texts, email subject lines, CTA copy, and social copy';