-- Rename creative_library table to messaging_matrix
ALTER TABLE creative_library RENAME TO messaging_matrix;

-- Drop the CTA and image_url columns as they're no longer needed
ALTER TABLE messaging_matrix DROP COLUMN IF EXISTS cta;
ALTER TABLE messaging_matrix DROP COLUMN IF EXISTS image_url;

-- Update the RLS policy names to reflect the new table name
DROP POLICY IF EXISTS "Users can delete own creatives" ON messaging_matrix;
DROP POLICY IF EXISTS "Users can insert own creatives" ON messaging_matrix;
DROP POLICY IF EXISTS "Users can update own creatives" ON messaging_matrix;
DROP POLICY IF EXISTS "Users can view own creatives" ON messaging_matrix;

-- Recreate RLS policies with new names
CREATE POLICY "Users can view own messages" ON messaging_matrix
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON messaging_matrix
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages" ON messaging_matrix
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON messaging_matrix
  FOR DELETE USING (auth.uid() = user_id);