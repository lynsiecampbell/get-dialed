import { Badge } from "@/components/ui/badge";
import { AssociatedAsset } from "@/components/shared/AssociatedAsset";
import { ActionButtons } from "@/components/shared/ActionButtons";
import { Clock, Flag } from "lucide-react";
import { format } from "date-fns";

interface Creative {
  id: string;
  name: string;
  creative_type: string;
  thumbnail_url: string | null;
  file_url: string | null;
}

type AdCardProps = {
  id: string;
  campaign?: string;
  audience_type: string;
  ad_format: string;
  creative_type: string;
  status: "Active" | "Draft" | "Paused" | "Archived";
  medium: string | null;
  source: string | null;
  version: string;
  headline: string | null;
  body: string | null;
  updated_at: string;
  ad_name?: string | null;
  attached_creatives?: Creative[];
  landing_page_name?: string | null;
  onEdit: () => void;
  onDuplicate: () => void;
  onView: () => void;
  onDelete: () => void;
  onViewCreative?: () => void;
};

export function AdCard({
  campaign,
  audience_type,
  ad_format,
  creative_type,
  status,
  medium,
  source,
  version,
  headline,
  updated_at,
  ad_name,
  attached_creatives = [],
  landing_page_name,
  onEdit,
  onDuplicate,
  onView,
  onDelete,
  onViewCreative,
}: AdCardProps) {
  const primaryCreative = attached_creatives[0];
  const isVideo = primaryCreative?.creative_type === "Video";
  const imageUrl = primaryCreative?.thumbnail_url || primaryCreative?.file_url || "/placeholder.svg";
  const displayName = ad_name || `${campaign} | ${audience_type} | ${ad_format} | v${version}`;

  return (
    <div className="group rounded-[5px] border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Image/Video Preview */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-[5px] bg-black">
        {primaryCreative ? (
          <>
            {isVideo && primaryCreative.file_url ? (
              <>
                <video
                  src={primaryCreative.file_url}
                  muted
                  playsInline
                  loop
                  preload="metadata"
                  poster={primaryCreative.thumbnail_url || undefined}
                  className="h-full w-full object-contain bg-black transition-transform duration-200 group-hover:scale-[1.02]"
                  onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play().catch(() => {})}
                  onMouseLeave={(e) => {
                    const video = e.currentTarget as HTMLVideoElement;
                    video.pause();
                    video.currentTime = 0;
                  }}
                />
                
                {/* Play indicator overlay */}
                <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0 pointer-events-none">
                  <div className="bg-black/50 rounded-full p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white opacity-90"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </>
            ) : (
              <img
                src={imageUrl}
                alt={primaryCreative.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            )}
            {attached_creatives.length > 1 && (
              <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs rounded-full px-2 py-1 font-medium">
                +{attached_creatives.length - 1}
              </div>
            )}
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground text-sm">No Creative</span>
          </div>
        )}
      </div>

      {/* Ad Name - Fixed height container */}
      <div className="mt-3 h-[42px] flex items-start">
        <h3 className="text-[15px] font-medium leading-snug break-words line-clamp-2">
          {displayName}
        </h3>
      </div>

      {/* Campaign Badge and Status */}
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge status={status.toLowerCase() as "active" | "draft" | "paused" | "archived"} dot>
          {status}
        </Badge>
        <Badge icon={Flag} iconClassName="text-teal-600 dark:text-teal-400">
          {campaign}
        </Badge>
      </div>

      {/* Tags Row */}
      <div className="mt-3 flex flex-wrap gap-2">
        {source && (
          <Badge platform={source.toLowerCase() as any}>
            {source}
          </Badge>
        )}
        {medium && (
          <Badge medium={medium.toLowerCase().replace(/ /g, '-') as any}>
            {medium}
          </Badge>
        )}
        <Badge audience={audience_type.toLowerCase().replace(/ /g, '-') as any}>
          {audience_type}
        </Badge>
      </div>

      {/* Divider */}
      <div className="my-4 h-px bg-border" />

      {/* Actions + Timestamp */}
      <div className="flex items-center justify-between">
        <ActionButtons
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onView={onView}
          onDelete={onDelete}
        />
        
        <div className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
          <Clock className="h-3.5 w-3.5" />
          {format(new Date(updated_at), "MMM d, yyyy")}
        </div>
      </div>
    </div>
  );
}
