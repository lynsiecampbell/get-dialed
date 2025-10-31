import { CreativeCard } from "./CreativeCard";

type Creative = {
  id: string;
  creative_name: string;
  campaign: string | null;
  creative_group_type: string;
  parent_creative_id: string | null;
  creative_type: string;
  file_url: string | null;
  thumbnail_url: string | null;
  format_dimensions: string | null;
  file_size_mb: number | null;
  tags: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type CreativeWithAdCount = Creative & {
  ad_count: number;
};

type CreativeGridProps = {
  creatives: CreativeWithAdCount[];
  onEdit: (creative: Creative) => void;
  onDownload: (creative: Creative) => void;
  onDelete: (id: string, name: string) => void;
  onViewAds: (creativeId: string, creativeName: string) => void;
};

export function CreativeGrid({
  creatives,
  onEdit,
  onDownload,
  onDelete,
  onViewAds,
}: CreativeGridProps) {
  if (creatives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-muted-foreground mb-2">No creatives found</div>
        <div className="text-sm text-muted-foreground">
          Try adjusting your filters or create a new creative
        </div>
      </div>
    );
  }

  return (
    <div className="card-grid px-0">
      {creatives.map((creative) => (
        <div key={creative.id} className="card-grid-item">
          <CreativeCard
            {...creative}
            onEdit={() => onEdit(creative)}
            onDownload={() => onDownload(creative)}
            onDelete={() => onDelete(creative.id, creative.creative_name)}
            onViewAds={() => onViewAds(creative.id, creative.creative_name)}
          />
        </div>
      ))}
    </div>
  );
}
