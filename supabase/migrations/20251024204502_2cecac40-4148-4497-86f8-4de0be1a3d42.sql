-- Auto-populate display_link for existing ads based on landing_page_url
UPDATE public.ads
SET display_link = CASE
  WHEN landing_page_url IS NOT NULL AND landing_page_url != '' THEN
    'www.' || regexp_replace(
      regexp_replace(landing_page_url, '^https?://(www\.)?', ''),
      '/.*$', 
      ''
    )
  ELSE NULL
END
WHERE display_link IS NULL;