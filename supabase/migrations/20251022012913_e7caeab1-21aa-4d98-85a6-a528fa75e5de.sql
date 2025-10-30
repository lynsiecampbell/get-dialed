-- Fix function search_path for update_message_updated_at
CREATE OR REPLACE FUNCTION public.update_message_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Update the updated_at of the parent messaging_matrix record
  UPDATE public.messaging_matrix
  SET updated_at = NOW()
  WHERE id = COALESCE(NEW.messaging_id, OLD.messaging_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;