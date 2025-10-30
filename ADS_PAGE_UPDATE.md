# Update Ads.tsx to Fetch Messaging

## Current Query (line ~460):
```typescript
const { data, error } = await supabase
  .from('ads')
  .select(`
    *,
    campaigns!inner(name)
  `)
```

## Updated Query:
```typescript
const { data, error } = await supabase
  .from('ads')
  .select(`
    *,
    campaigns!inner(name),
    messaging (
      headlines,
      body_copy,
      ctas
    )
  `)
```

## Then in the map function (after line ~476), add:
```typescript
// Extract actual messaging text using indices
const headline = ad.messaging?.headlines?.[ad.headline_index] || ad.headline || null;
const body = ad.messaging?.body_copy?.[ad.body_copy_index] || ad.body || null;
const cta = ad.messaging?.ctas?.[ad.cta_index] || ad.cta_label || null;

return { 
  ...ad,
  campaign: ad.campaigns?.name || '',
  attached_creatives, 
  landing_page_name,
  status: ad.status as "Active" | "Draft" | "Paused" | "Archived",
  // Override with actual messaging text
  headline,
  body,
  cta_label: cta
};
```

This way:
- Old ads that still have headline/body stored directly will show those
- New ads will fetch from messaging table using indices
- AdDetailsDrawer doesn't need to change - it just receives headline/body as before
