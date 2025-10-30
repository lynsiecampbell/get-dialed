-- Function to backfill landing_page_id for existing ads
CREATE OR REPLACE FUNCTION backfill_ad_landing_page_ids()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update ads that have a landing_page_url but no landing_page_id
  UPDATE ads
  SET landing_page_id = lp.id
  FROM landing_pages lp
  WHERE ads.landing_page_url = lp.url
    AND ads.user_id = lp.user_id
    AND ads.landing_page_id IS NULL
    AND ads.landing_page_url IS NOT NULL;
END;
$$;

-- Execute the backfill function
SELECT backfill_ad_landing_page_ids();

-- Create a trigger to automatically set landing_page_id when landing_page_url is set
CREATE OR REPLACE FUNCTION auto_set_landing_page_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If landing_page_url is set and landing_page_id is not, try to find it
  IF NEW.landing_page_url IS NOT NULL AND NEW.landing_page_id IS NULL THEN
    SELECT id INTO NEW.landing_page_id
    FROM landing_pages
    WHERE url = NEW.landing_page_url
      AND user_id = NEW.user_id
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS set_landing_page_id_on_insert ON ads;
CREATE TRIGGER set_landing_page_id_on_insert
  BEFORE INSERT ON ads
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_landing_page_id();

DROP TRIGGER IF EXISTS set_landing_page_id_on_update ON ads;
CREATE TRIGGER set_landing_page_id_on_update
  BEFORE UPDATE ON ads
  FOR EACH ROW
  WHEN (NEW.landing_page_url IS DISTINCT FROM OLD.landing_page_url)
  EXECUTE FUNCTION auto_set_landing_page_id();