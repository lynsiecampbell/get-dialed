# EditAdDrawer Changes Needed

## Changes to Make (Similar to NewAdDrawer)

### 1. Update Interface (around line 48)
Change:
```typescript
interface Message {
  id: string;
  campaign: string;
  headline: string | null;
  primary_text: string | null;
}
```
To:
```typescript
interface MessagingRecord {
  id: string;
  messaging_type: string;
  headlines: string[];
  body_copy: string[];
  ctas: string[];
  notes: string | null;
}
```

### 2. Update ad interface (around line 25)
Remove from ad prop:
```typescript
headline: string | null;
body: string | null;
cta_label: string | null;
```

Add to ad prop:
```typescript
messaging_id: string | null;
headline_index: number;
body_copy_index: number;
cta_index: number;
```

### 3. Update State Variables (around line 80)
Change:
```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [headline, setHeadline] = useState("");
const [primaryText, setPrimaryText] = useState("");
const [cta, setCta] = useState("");
```

To:
```typescript
const [messagingRecords, setMessagingRecords] = useState<MessagingRecord[]>([]);
const [messagingId, setMessagingId] = useState("");
const [headlineIndex, setHeadlineIndex] = useState(0);
const [bodyIndex, setBodyIndex] = useState(0);
const [ctaIndex, setCtaIndex] = useState(0);
const [selectedMessaging, setSelectedMessaging] = useState<MessagingRecord | null>(null);
```

### 4. Update Pre-fill Logic (around line 220)
Change:
```typescript
setHeadline(ad.headline || "");
setPrimaryText(ad.body || "");
setCta(ad.cta_label || "");
```

To:
```typescript
setMessagingId(ad.messaging_id || "");
setHeadlineIndex(ad.headline_index || 0);
setBodyIndex(ad.body_copy_index || 0);
setCtaIndex(ad.cta_index || 0);
```

### 5. Add Load Messaging Function
Same as NewAdDrawer - loadMessagingForCampaign function

### 6. Add useEffects
Same as NewAdDrawer - for loading messaging when campaign changes

### 7. Update handleSave (around line 856)
Change:
```typescript
.update({
  headline: headline || null,
  body: primaryText || null,
  cta_label: cta || null,
  // ... other fields
})
```

To:
```typescript
.update({
  messaging_id: messagingId,
  headline_index: headlineIndex,
  body_copy_index: bodyIndex,
  cta_index: ctaIndex,
  // ... other fields
})
```

### 8. Update UI (Step 2)
Replace headline/body/cta inputs with messaging selection dropdowns
(Same UI as NewAdDrawer Step 2)

---

Since this is a 57KB file, should we:
A) Make changes manually (I'll guide you through each section)
B) Rebuild it fresh like NewAdDrawer (faster but takes time)
C) Use find/replace commands in terminal (risky but quick)

What do you prefer?
