-- Migrate existing campaigns from messaging_matrix to campaigns table
INSERT INTO campaigns (user_id, name, notes, messaging, assets, created_at, updated_at)
SELECT DISTINCT ON (user_id, campaign)
  user_id,
  campaign as name,
  notes,
  jsonb_build_object(
    'adMessaging', jsonb_build_object(
      'headlines', COALESCE(to_jsonb(headlines), '[]'::jsonb),
      'primaryTexts', COALESCE(to_jsonb(primary_texts), '[]'::jsonb)
    ),
    'emailMessaging', jsonb_build_object(
      'subjectLines', '[]'::jsonb,
      'bodyCopy', '[]'::jsonb
    ),
    'socialMessaging', jsonb_build_object(
      'postCopy', '[]'::jsonb,
      'hashtags', '[]'::jsonb
    ),
    'brandMessaging', jsonb_build_object(
      'brandHeadlines', '[]'::jsonb,
      'copy', '[]'::jsonb,
      'taglines', '[]'::jsonb
    )
  ) as messaging,
  jsonb_build_object(
    'creatives', '[]'::jsonb,
    'landingPages', '[]'::jsonb,
    'ads', '[]'::jsonb,
    'links', '[]'::jsonb
  ) as assets,
  MIN(created_at) as created_at,
  MAX(updated_at) as updated_at
FROM messaging_matrix
WHERE NOT EXISTS (
  SELECT 1 FROM campaigns c 
  WHERE c.name = messaging_matrix.campaign 
  AND c.user_id = messaging_matrix.user_id
)
GROUP BY user_id, campaign, notes, headlines, primary_texts;