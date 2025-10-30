# Get Dialed Migration Summary

## ✅ Completed Today (October 29, 2025)

### Database Changes
1. ✅ Created `ad_creatives` junction table
   - Allows multiple creatives per ad
   - Has `position` field for carousel ordering

2. ✅ Added new columns to `ads` table:
   - `messaging_id` - references messaging table
   - `headline_index` - which headline from array
   - `body_copy_index` - which body from array
   - `cta_index` - which CTA from array

3. ✅ Dropped `ad_variants` table
   - Not needed - using `ads.version` field instead
   - Version used for naming: `Campaign | Audience | Format | v1`

### Component Changes
1. ✅ Created `NewAdDrawer.tsx` component
   - Uses new messaging schema with messaging_id + indices
   - Selects from messaging table via dropdown
   - Picks specific headline/body/CTA from arrays
   - Links multiple creatives via ad_creatives junction
   - Removed all legacy `messaging_matrix` references

## 📋 Next Steps: Frontend-Backend Reconnection Plan

### Phase 1: Update Ad Display Components (High Priority)
**Files that display ads need to fetch messaging:**

1. **Ad List/Grid Views**
   - Update queries to join messaging table
   - Extract text using indices
   - Pattern:
```typescript
   const { data: ads } = await supabase
     .from('ads')
     .select(`
       *,
       messaging (headlines, body_copy, ctas),
       ad_creatives (
         creative:creatives (name, image_urls)
       )
     `)
     .eq('campaign_id', campaignId);
   
   // Get actual text
   const adsWithText = ads.map(ad => ({
     ...ad,
     headline: ad.messaging?.headlines[ad.headline_index],
     body: ad.messaging?.body_copy[ad.body_copy_index],
     cta: ad.messaging?.ctas[ad.cta_index]
   }));
```

2. **Ad Detail/View Pages**
   - Show messaging record being used
   - Display which indices are selected
   - Show all associated creatives

3. **Ad Export Functions** (Meta, Google, etc.)
   - Update to pull text from messaging using indices
   - Example:
```typescript
   function exportToMeta(ad) {
     return {
       headline: ad.messaging.headlines[ad.headline_index],
       body: ad.messaging.body_copy[ad.body_copy_index],
       call_to_action: ad.messaging.ctas[ad.cta_index],
       image_url: ad.ad_creatives[0]?.creative?.image_urls[0]
     };
   }
```

### Phase 2: Update Component Imports
**Files importing AddNewAdDrawer need updates:**

Search for:
```bash
grep -r "AddNewAdDrawer" src/
```

Replace with:
```typescript
import { NewAdDrawer } from "@/components/NewAdDrawer";
```

### Phase 3: Create Missing Drawers
**These don't exist yet but are needed:**

1. **EditAdDrawer** (or NewAdDrawer in edit mode)
   - Allow changing messaging selection
   - Allow changing indices
   - Allow adding/removing creatives

2. **Messaging Drawers** (per type)
   - NewEmailMessagingDrawer
   - NewAdMessagingDrawer
   - NewBrandMessagingDrawer
   - Each creates messaging records with arrays

### Phase 4: Update Manage Campaign Page
**This is where messaging is created/managed:**

- Show messaging records for campaign
- Allow adding new messaging
- Allow editing existing messaging
- Link messaging to campaign via campaign_messaging junction

### Phase 5: Clean Up Legacy Code
**Remove old unused code:**

1. Delete legacy tables references:
   - messaging_matrix
   - messaging_ads
   
2. Remove old drawer:
```bash
   rm src/components/AddNewAdDrawer.tsx
```

3. Update any JSONB messaging fields on campaigns table
   - Migrate data to messaging table
   - Remove campaigns.messaging JSONB field

## 🔧 Key Patterns to Follow

### Creating an Ad
```typescript
await supabase.from('ads').insert({
  messaging_id: messagingId,
  headline_index: 0,
  body_copy_index: 1,
  cta_index: 0,
  // ... other fields
});

// Then link creatives
await supabase.from('ad_creatives').insert([
  { ad_id: newAdId, creative_id: creative1Id, position: 0 },
  { ad_id: newAdId, creative_id: creative2Id, position: 1 }
]);
```

### Displaying Ad Text
```typescript
const { data: ad } = await supabase
  .from('ads')
  .select('*, messaging(headlines, body_copy, ctas)')
  .eq('id', adId)
  .single();

const headline = ad.messaging?.headlines[ad.headline_index];
const body = ad.messaging?.body_copy[ad.body_copy_index];
const cta = ad.messaging?.ctas[ad.cta_index];
```

### Updating Messaging (Updates All Ads)
```typescript
await supabase
  .from('messaging')
  .update({
    headlines: ['New Headline 1', 'New Headline 2']
  })
  .eq('id', messagingId);

// All ads using this messaging_id automatically show new headlines!
```

## 📊 Current Database Structure

### ads table
- messaging_id → messaging
- headline_index, body_copy_index, cta_index
- landing_page_id → landing_pages
- platform, audience_type, ad_format
- version (v1, v2, v3)
- status

### ad_creatives junction
- ad_id → ads
- creative_id → creatives
- position

### messaging table
- messaging_type (Email, Ad, Social, Brand)
- headlines[] (array)
- body_copy[] (array)
- ctas[] (array)

### campaign_messaging junction
- campaign_id → campaigns
- messaging_id → messaging

## 🎯 Benefits of New System

✅ Single source of truth for messaging
✅ Update messaging once, affects all ads
✅ Easy A/B testing with indices
✅ Multiple creatives per ad
✅ Clean separation of concerns
✅ No duplicate data

## 📝 Notes

- Version field (v1, v2, v3) is used for ad naming and UTM params
- Primary Text is now called "Body" throughout the app
- Messaging is created/managed on Manage Campaign page
- Ad creation just selects existing messaging + indices

---
*Migration completed: October 29, 2025*

## 🎉 UPDATE: Both Drawers Complete!

### Completed Components
1. ✅ **NewAdDrawer.tsx** (636 lines) - replaces AddNewAdDrawer
2. ✅ **EditAdDrawer.tsx** (654 lines) - rebuilt from scratch
3. ✅ Both use new messaging schema with messaging_id + indices
4. ✅ Both compile without errors
5. ✅ **60% code reduction** from old versions!

### File Size Comparison
- Old: ~3,255 lines total
- New: 1,290 lines total
- **Savings: 1,965 lines of code removed!**

---
*Updated: October 29, 2025 - Both drawers complete!*
