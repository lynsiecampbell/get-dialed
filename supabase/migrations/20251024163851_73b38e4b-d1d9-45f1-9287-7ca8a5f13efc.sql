-- Migrate existing "Image" values to "Single Image" in ads table
UPDATE ads 
SET creative_type = 'Single Image' 
WHERE creative_type = 'Image';

-- Update any other common variations to standardized values
UPDATE ads 
SET creative_type = 'Video' 
WHERE creative_type = 'video' OR creative_type = 'VIDEO';

UPDATE ads 
SET creative_type = 'Carousel' 
WHERE creative_type = 'carousel' OR creative_type = 'CAROUSEL';

UPDATE ads 
SET creative_type = 'Collection' 
WHERE creative_type = 'collection' OR creative_type = 'COLLECTION';