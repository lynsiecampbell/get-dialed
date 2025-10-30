import { Globe, Image, Video, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

export type AssetType = "landing-page" | "creative-image" | "creative-video" | "ad" | "default";

interface AssociatedAssetProps {
  type: AssetType;
  label: string;
  count?: number;
  onClick?: () => void;
  className?: string;
}

// Map icons to each asset type
const iconMap: Record<AssetType, React.ReactNode> = {
  "landing-page": <Globe className="h-3.5 w-3.5" />,
  "creative-image": <Image className="h-3.5 w-3.5" />,
  "creative-video": <Video className="h-3.5 w-3.5" />,
  ad: <Megaphone className="h-3.5 w-3.5" />,
  default: <Megaphone className="h-3.5 w-3.5" />,
};

export function AssociatedAsset({ type, label, count, onClick, className }: AssociatedAssetProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        "bg-muted rounded-[5px] px-2 py-1 inline-flex items-center gap-1 text-muted-foreground text-sm transition-colors",
        onClick && "cursor-pointer hover:bg-muted/80",
        className,
      )}
    >
      {iconMap[type]}
      <span>{label}</span>
      {count !== undefined && count > 0 && <span className="font-semibold text-xs">({count})</span>}
    </span>
  );
}
