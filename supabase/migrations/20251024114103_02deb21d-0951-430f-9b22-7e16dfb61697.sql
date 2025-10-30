-- Update ALL ads to have the correct Ad Set Name format based on their current campaign and audience_type
UPDATE ads
SET ad_set_name = campaign || ' – ' || audience_type;