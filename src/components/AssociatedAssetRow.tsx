import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { X, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { useState } from "react";
interface AssetItem {
  id: string;
  name: string;
  type?: string;
  url?: string;
  thumbnailUrl?: string;
  status?: string;
}
interface AssociatedAssetRowProps {
  icon: React.ReactNode;
  label: string;
  items: AssetItem[];
  onAttach: () => void;
  onRemove: (id: string) => void;
  emptyMessage: string;
}
export function AssociatedAssetRow({
  icon,
  label,
  items,
  onAttach,
  onRemove,
  emptyMessage
}: AssociatedAssetRowProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const count = items.length;
  const displayItems = items.slice(0, 3);
  const hasMore = count > 3;
  return <div className="space-y-2">
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-3">
          <div className="text-muted-foreground">{icon}</div>
          <span className="font-medium">{label}</span>
          <Badge variant="secondary" className="ml-2">
            {count} attached
          </Badge>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAttach}>
          + Add / Attach
        </Button>
      </div>

      {count > 0 && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-2 pl-10 pt-2">
            {displayItems.map(item => <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 transition-colors group">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {item.thumbnailUrl && <img src={item.thumbnailUrl} alt={item.name} className="h-10 w-10 object-cover rounded" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    {item.type && <Badge variant="outline" className="text-xs mt-1">
                        {item.type}
                      </Badge>}
                    {item.status && <Badge variant={item.status === "Active" ? "default" : "secondary"} className="text-xs mt-1 ml-1">
                        {item.status}
                      </Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {item.url && <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(item.url, "_blank")}>
                      <ExternalLink className="h-3 w-3" />
                    </Button>}
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onRemove(item.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>)}
            {hasMore && <Button type="button" variant="link" size="sm" className="text-xs">
                View All ({count})
              </Button>}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>;
}