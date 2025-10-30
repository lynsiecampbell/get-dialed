-- Create trigger function to update parent message updated_at when assets change
CREATE OR REPLACE FUNCTION public.update_message_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update the updated_at of the parent messaging_matrix record
  UPDATE public.messaging_matrix
  SET updated_at = NOW()
  WHERE id = COALESCE(NEW.messaging_id, OLD.messaging_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger for messaging_creatives changes
CREATE TRIGGER update_message_on_creative_change
AFTER INSERT OR UPDATE OR DELETE ON public.messaging_creatives
FOR EACH ROW
EXECUTE FUNCTION public.update_message_updated_at();

-- Trigger for messaging_landing_pages changes
CREATE TRIGGER update_message_on_landing_page_change
AFTER INSERT OR UPDATE OR DELETE ON public.messaging_landing_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_message_updated_at();

-- Trigger for messaging_ads changes
CREATE TRIGGER update_message_on_ad_change
AFTER INSERT OR UPDATE OR DELETE ON public.messaging_ads
FOR EACH ROW
EXECUTE FUNCTION public.update_message_updated_at();