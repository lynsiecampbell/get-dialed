-- Add content fields to messaging table
ALTER TABLE messaging
ADD COLUMN headlines TEXT[],
ADD COLUMN body_copy TEXT[],
ADD COLUMN subject_lines TEXT[],
ADD COLUMN ctas TEXT[];

-- Add comments
COMMENT ON COLUMN messaging.headlines IS 'Array of headline variations (used by Ad, Brand, Social)';
COMMENT ON COLUMN messaging.body_copy IS 'Array of body copy variations (used by all types)';
COMMENT ON COLUMN messaging.subject_lines IS 'Array of subject line variations (used by Email)';
COMMENT ON COLUMN messaging.ctas IS 'Array of CTA variations (used by Ad, Social)';
