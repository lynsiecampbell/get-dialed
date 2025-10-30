import { AdCard } from "./AdCard";

interface Creative {
  id: string;
  creative_name: string;
  creative_type: string;
  thumbnail_url: string | null;
  file_url: string | null;
}

type Ad = {
  id: string;
  campaign_id: string;
  campaign?: string; // campaign name (from join)
  audience_type: string;
  ad_format: string;
  creative_type: string;
  version: string;
  headline: string | null;
  body: string | null; // renamed from primary_text
  landing_page_url: string;
  status: "Active" | "Draft" | "Paused" | "Archived";
  creative_id: string | null;
  medium: string | null;
  source: string | null;
  updated_at: string;
  created_at?: string;
  user_id?: string;
  ad_name?: string | null;
  ad_set_name?: string | null;
  landing_page_id?: string | null;
  utm_link?: string | null;
  creative_group_id?: string | null;
  meta_creative_id?: string | null;
  attached_creatives?: Creative[];
  landing_page_name?: string | null;
  cta_label?: string | null;
  objective?: string | null;
  caption?: string | null;
  display_link?: string | null;
};

type AdGridProps = {
  ads: Ad[];
  onEdit: (ad: Ad) => void;
  onDuplicate: (adId: string) => void;
  onDelete: (id: string) => void;
  onView: (ad: Ad) => void;
  onViewCreative?: (creative: Creative) => void;
};

export function AdGrid({
  ads,
  onEdit,
  onDuplicate,
  onDelete,
  onView,
  onViewCreative,
}: AdGridProps) {
  if (ads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-muted-foreground mb-2">No ads found</div>
        <div className="text-sm text-muted-foreground">
          Try adjusting your filters or create a new ad
        </div>
      </div>
    );
  }

  return (
    <div className="card-grid">
      {ads.map((ad) => (
        <div key={ad.id} className="card-grid-item">
          <AdCard
            {...ad}
            onEdit={() => onEdit(ad)}
            onDuplicate={() => onDuplicate(ad.id)}
            onView={() => onView(ad)}
            onDelete={() => onDelete(ad.id)}
            onViewCreative={
              ad.attached_creatives && ad.attached_creatives.length > 0 && onViewCreative
                ? () => onViewCreative(ad.attached_creatives![0])
                : undefined
            }
          />
        </div>
      ))}
    </div>
  );
}
