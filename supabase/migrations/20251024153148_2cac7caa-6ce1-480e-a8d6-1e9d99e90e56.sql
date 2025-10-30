-- Update all existing ads to include utm_audience in their UTM URLs
UPDATE ads
SET utm_link = CASE
  -- Only update if utm_link exists and doesn't already have utm_audience
  WHEN utm_link IS NOT NULL 
    AND utm_link NOT LIKE '%utm_audience=%' 
    AND position('utm_campaign=' in utm_link) > 0 THEN
    -- Find the position after utm_campaign parameter
    CASE
      -- If there's utm_content after utm_campaign, insert utm_audience before it
      WHEN position('&utm_content=' in utm_link) > 0 THEN
        replace(
          utm_link,
          '&utm_content=',
          '&utm_audience=' || lower(replace(replace(audience_type, ' ', '_'), '-', '_')) || '&utm_content='
        )
      -- If there's version parameter after utm_campaign, insert utm_audience before it
      WHEN position('&version=' in utm_link) > 0 THEN
        replace(
          utm_link,
          '&version=',
          '&utm_audience=' || lower(replace(replace(audience_type, ' ', '_'), '-', '_')) || '&version='
        )
      -- Otherwise, append utm_audience at the end
      ELSE
        utm_link || '&utm_audience=' || lower(replace(replace(audience_type, ' ', '_'), '-', '_'))
    END
  -- Keep existing value if no update needed
  ELSE utm_link
END
WHERE utm_link IS NOT NULL;