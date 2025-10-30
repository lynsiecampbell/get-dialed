-- Update ALL ads to use a regular hyphen (-) instead of en dash (–) in Ad Set Name
UPDATE ads
SET ad_set_name = campaign || ' - ' || audience_type;