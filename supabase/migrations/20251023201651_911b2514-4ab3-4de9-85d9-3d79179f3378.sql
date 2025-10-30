-- Update existing Pricing Calculator creatives to set campaign field
UPDATE creatives
SET campaign = 'Pricing Calculator'
WHERE user_id = '961b588f-7872-4a60-8959-e955d23d735c'
AND creative_name LIKE 'Pricing Calculator%'
AND campaign IS NULL;