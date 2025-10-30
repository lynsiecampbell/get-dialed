# Drawer Migration Project - Context & Decisions

## Project Overview
Migrating all drawers from custom DrawerPanel to standardized DrawerSmall (500px), DrawerMedium (700px), and DrawerLarge (1000px) components.

## Database Schema Decisions

### Core Principles
1. **Campaign-centric design** - Everything connects to campaigns
2. **Junction tables for many-to-many relationships**
3. **Messaging is source of truth** - Ads reference messaging, don't store copies

### Key Tables & Relationships

#### Creatives → Campaigns (Many-to-Many)
- Junction: `campaign_creatives` (campaign_id, creative_id, is_primary)
- Creatives can belong to multiple campaigns

#### Landing Pages → Campaigns (Many-to-Many)
- Junction: `campaign_landing_pages` (campaign_id, landing_page_id, is_primary)
- Landing pages can be used across multiple campaigns

#### Messaging → Campaigns (Many-to-Many)
- Junction: `campaign_messaging` (campaign_id, messaging_id)
- Messaging table structure:
  - `messaging_type` (Email, Ad, Social, Brand)
  - `headlines` TEXT[] (array)
  - `body_copy` TEXT[] (array)
  - `subject_lines` TEXT[] (array)
  - `ctas` TEXT[] (array)

#### Ads Structure (NEW DECISIONS)
- `ads` table fields:
  - `campaign_id` (FK to campaigns)
  - `messaging_id` (FK to messaging) - **Source of truth for copy**
  - `headline_index` INT - which headline from messaging.headlines array
  - `body_copy_index` INT - which body_copy from messaging.body_copy array
  - `cta_index` INT - which cta from messaging.ctas array
  - `landing_page_id` (FK to landing_pages)
  - `platform` TEXT (Meta, LinkedIn, Google, TikTok, YouTube)
  - `audience_type` TEXT
  - `ad_format` TEXT
  - `status` TEXT
  - `version` TEXT
  - `source` TEXT (for UTM)
  - `medium` TEXT (for UTM)
  - `display_link` TEXT
  - Ad name fields: `ad_name`, `ad_set_name`
  - Meta export fields: `objective`, `campaign_budget`, `start_time`, `age_max`

#### Ad → Creatives (Many-to-Many)
- Junction: `ad_creatives` (ad_id, creative_id, position)
- **Rationale**: One ad can have multiple creative sizes (1080x1080, 1200x628, etc.)
- Position field for future carousel support

### Legacy Tables (DO NOT USE)
- ❌ `messaging_matrix` - replaced by `messaging` + `campaign_messaging`
- ❌ `messaging_creatives` - use `campaign_creatives` instead
- ❌ `messaging_landing_pages` - use `campaign_landing_pages` instead
- ❌ `messaging_ads` - ads now reference messaging_id directly

## Completed Migrations

### ✅ Small Drawers (500px) - ALL DONE
1. ✅ **CampaignSettingsDrawer** - Updates campaigns table (status, objective, dates, budget)
2. ✅ **AddNewLandingPageDrawer** - Creates landing page + links via campaign_landing_pages junction
3. ✅ **EditLandingPageDrawer** - Updates landing page + manages campaign_landing_pages associations
4. ✅ **CreateUTMDrawer** - Creates manual UTM links in links table
5. ✅ **AddNewCreativeDrawer** - Uploads creatives + links via campaign_creatives junction
6. ✅ **EditCreativeDrawer** - Updates creative name + manages campaign_creatives associations

### Common Patterns Used
- Multi-select campaigns: Popover + checkbox list pattern with Check icon
- Input height: `h-10` for all inputs/buttons
- Border radius: `rounded-sm` (consistent across all fields)
- DrawerSmall props: `isOpen`, `onClose`, `title`, `description`, `onSave`, `saveText`, `isLoading`
- Campaign popover width: `w-[436px]` (matches drawer content width)
- Consistent spacing: `space-y-4` for form sections, `space-y-2` for field groups
- Required fields: Red asterisk `<span className="text-red-500">*</span>`

### Key Implementation Details
- **Fetch campaigns with IDs**: Always fetch both id and name for junction tables
- **Delete + Re-insert pattern**: For updating many-to-many relationships:
  1. Delete all existing junction records
  2. Insert new junction records based on selections
- **Array fields**: Use TEXT[] in database, handle as string arrays in code
- **Loading states**: Disable all inputs when `loading` or `isLoading` is true

## Remaining Migrations

### Medium Drawers (700px)
7. **AddNewAdDrawer** ⬅️ NEXT (in progress, need to apply new schema)
   - Current issues: Uses messaging_matrix (legacy), needs messaging_id approach
   - Multi-step drawer (Step 1: Campaign/Audience/Creatives, Step 2: Messaging/Landing Page)
8. **EditAdDrawer** (follow AddNewAdDrawer pattern with pre-filled data)
9. **AdDetailsDrawer** (view-only, possibly doesn't need migration?)
10. **CreativePickerModal** → Rename to SelectCreativesDrawer

### Large Drawers (1000px)
11. **ManageCampaignDrawer** - Complex drawer managing all campaign assets

### New Drawers to Create (after migrations)
12. **AddEmailMessagingDrawer** (500px) - Create messaging with subject_lines + body_copy + ctas arrays
13. **AddAdMessagingDrawer** (500px) - Create messaging with headlines + body_copy + ctas arrays
14. **AddSocialMessagingDrawer** (500px) - Create messaging with platform-specific fields
15. **AddBrandMessagingDrawer** (500px) - Create messaging for campaign copy

## Key Migration Rules

### Always Review First (Process)
1. Show current drawer code to user
2. Identify database tables it uses
3. Check if using legacy tables (messaging_matrix, messaging_creatives, etc.)
4. Confirm correct junction tables for many-to-many relationships
5. Ask clarifying questions about behavior
6. Get explicit approval before writing migration code

### Database Operations
- **Creatives**: Use `campaign_creatives` junction table (campaign_id, creative_id, is_primary)
- **Landing Pages**: Use `campaign_landing_pages` junction table (campaign_id, landing_page_id, is_primary)
- **Messaging**: Use `messaging` table + `campaign_messaging` junction table
- **Ads**: 
  - Reference `messaging_id` (FK to messaging table)
  - Store array indices (`headline_index`, `body_copy_index`, `cta_index`)
  - Link to creatives via `ad_creatives` junction
  - Link to landing pages via `landing_page_id` (direct FK)

### UI Component Patterns
- **Small drawers**: 500px width (DrawerSmall component)
- **Medium drawers**: 700px width (DrawerMedium component) 
- **Large drawers**: 1000px width (DrawerLarge component)
- **Multi-select pattern**: 
```tsx
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" role="combobox" className="w-full h-10 justify-between font-normal rounded-sm">
        {selected.length > 0 ? `${selected.length} selected` : 'Select...'}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-[436px] p-0 pointer-events-auto" align="start">
      {/* Checkbox list with Check icons */}
    </PopoverContent>
  </Popover>
```
- **Campaign context**: Pre-select campaign if `contextCampaign` prop provided

### Styling Standards
- All inputs/selects/buttons: `h-10` height
- All inputs/buttons: `rounded-sm` border radius
- Form section spacing: `space-y-4`
- Field group spacing: `space-y-2`
- Label styling: `text-sm font-medium`
- Required indicator: `<span className="text-red-500">*</span>`

## AddNewAdDrawer - Current Analysis

### What It Currently Does
1. **Step 1**: Select campaign, audience type, platform/source, creatives
2. **Step 2**: Select/create messaging (headline, body, CTA), landing page, generate UTM URL
3. **Save**: Creates ad record + links to creatives + generates UTM link

### Current Problems
- Uses `messaging_matrix` table (legacy)
- Uses `messaging_ads` junction (doesn't exist in new schema)
- Stores messaging in campaigns.messaging JSONB field (should use messaging table)
- Fetches headlines/body from campaigns.messaging.adMessaging object

### How It Should Work (New Schema)
1. **Step 1**: Same (campaign, audience, platform, creatives)
2. **Step 2**: 
   - Fetch messaging records for selected campaign (via campaign_messaging junction)
   - Show dropdowns for headlines/body/CTAs from messaging.headlines[], body_copy[], ctas[] arrays
   - User selects which array index to use
   - Can add new messaging (launches AddAdMessagingDrawer, adds to messaging table)
3. **Save**:
   - Insert into ads table with messaging_id + indices
   - Link to creatives via ad_creatives junction
   - Auto-generate UTM link in links table (link_type='auto_ad')

### Key Questions Answered
- **Q**: Should ads store messaging text or reference it?
  - **A**: Reference via messaging_id - messaging is source of truth
- **Q**: How to handle multiple creatives per ad?
  - **A**: Use ad_creatives junction table with position field
- **Q**: Do ads update when messaging changes?
  - **A**: Yes - ads pull current messaging via messaging_id reference

## Current Status
- **Completed**: All 6 small drawers migrated successfully
- **In Progress**: AddNewAdDrawer schema analysis complete, ready to migrate
- **Challenge**: Chat performance degrading due to length
- **Next Action**: Create new chat with this context document

## Files & Locations
- Drawer components: `src/components/`
- Shared drawer components: `src/components/shared/` (DrawerSmall, DrawerMedium, DrawerLarge)
- Database schema reference: `GET_DIALED_V2_DATABASE_SCHEMA.md` in project root
- Supabase client: `@/integrations/supabase/client`

## Important Notes
- User is using terminal on Mac (lynsiecampbell@Mac get-dialed-main %)
- Working directory: `get-dialed-main` project
- Always confirm database operations before implementing
- Messaging drawers will be created LAST after all migrations complete
