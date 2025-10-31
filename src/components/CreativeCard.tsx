import { Badge } from "@/components/ui/badge";
import { ActionButtons } from "@/components/shared/ActionButtons";
import { Clock, Megaphone, Flag } from "lucide-react";
import { format } from "date-fns";

type CreativeCardProps = {
  id: string;
  name: string;
  campaign: string | null;
  creative_type: string;
  creative_group_type: string;
  image_urls: string[] | null;
  updated_at: string;
  ad_count: number;
  onEdit: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onViewAds: () => void;
};

export function CreativeCard({
  name,
  campaign,
  creative_type,
  creative_group_type,
  image_urls,
  updated_at,
  ad_count,
  onEdit,
  onDownload,
  onDelete,
  onViewAds,
}: CreativeCardProps) {
  const isVideo = creative_type === "Video";
  const primaryUrl = image_urls?.[0] || "";
  const imageUrl = primaryUrl || "/placeholder.svg";

  return (
    <div className="group rounded-[5px] border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Image/Video Preview */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-[5px] bg-black group">
        {isVideo && primaryUrl ? (
          <>
            <video
              src={primaryUrl}
              muted
              playsInline
              loop
              preload="metadata"
              poster={primaryUrl || undefined}
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
            alt={name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        )}
      </div>

      {/* Creative Name - Fixed height container */}
      <div className="mt-3 h-[42px] flex items-start">
        <h3 className="text-[15px] font-medium leading-snug break-words line-clamp-2">
          {name}
        </h3>
      </div>

      {/* Campaign Label */}
      {campaign && (
        <div className="mt-3">
          <Badge variant="outline" className="bg-muted text-xs flex items-center gap-1.5 w-fit">
            <Flag className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            {campaign}
          </Badge>
        </div>
      )}

      {/* Tags Row */}
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge type={creative_type.toLowerCase() as any}>{creative_type}</Badge>
        {creative_group_type && (
          <Badge variant="outline">{creative_group_type}</Badge>
        )}
      </div>

      {/* Divider */}
      <div className="my-3 h-px bg-border" />

      {/* Associated Ads Badge - Pill Style */}
      <div>
        <button 
          className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium transition-all hover:shadow-sm ${
            ad_count > 0 
              ? "bg-muted hover:bg-muted/80 cursor-pointer" 
              : "bg-muted/50 text-muted-foreground cursor-not-allowed"
          }`}
          style={{ borderRadius: '5px' }}
          disabled={ad_count === 0}
          onClick={ad_count > 0 ? onViewAds : undefined}
          title="View associated ads"
        >
          <Megaphone className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
          <span className="truncate text-[11px]">
            {ad_count} Ad{ad_count !== 1 ? "s" : ""}
          </span>
        </button>
      </div>

      {/* Divider */}
      <div className="my-4 h-px bg-border" />

      {/* Actions and Date Row */}
      <div className="flex items-center justify-between">
        <ActionButtons
          onEdit={onEdit}
          onDownload={onDownload}
          onDelete={onDelete}
        />
        
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {format(new Date(updated_at), "MMM d, yyyy")}
        </div>
      </div>
    </div>
  );
}
