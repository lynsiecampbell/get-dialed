import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus } from "lucide-react";

interface AssetAttachmentRowProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  onSelectExisting: () => void;
  onAddNew?: () => void;
}

export function AssetAttachmentRow({
  icon,
  label,
  count,
  onSelectExisting,
  onAddNew
}: AssetAttachmentRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <span className="font-medium">{label}</span>
        {count > 0 && (
          <Badge variant="secondary" className="text-xs">
            {count} attached
          </Badge>
        )}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent align="end" className="w-48 z-[100]" sideOffset={6}>
            <DropdownMenuItem onClick={onSelectExisting}>
              <Plus className="h-4 w-4 mr-2" />
              Select Existing
            </DropdownMenuItem>
            {onAddNew && (
              <DropdownMenuItem onClick={onAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    </div>
  );
}
