import { Pencil, Download, Copy, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActionButtonsProps {
  onEdit?: () => void;
  onDownload?: () => void;
  onDuplicate?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  hideEdit?: boolean;
  hideDownload?: boolean;
  hideDuplicate?: boolean;
  hideView?: boolean;
  hideDelete?: boolean;
}

export function ActionButtons({
  onEdit,
  onDownload,
  onDuplicate,
  onView,
  onDelete,
  hideEdit = false,
  hideDownload = false,
  hideDuplicate = false,
  hideView = false,
  hideDelete = false,
}: ActionButtonsProps) {
  const visibleButtons = [
    { show: !hideEdit && onEdit, component: 'edit' },
    { show: !hideDownload && onDownload, component: 'download' },
    { show: !hideDuplicate && onDuplicate, component: 'duplicate' },
    { show: !hideView && onView, component: 'view' },
    { show: !hideDelete && onDelete, component: 'delete' },
  ].filter(btn => btn.show);

  return (
    <TooltipProvider>
      <div className="inline-flex items-center border border-border bg-background h-8 rounded-md">
        {!hideEdit && onEdit && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-full px-2 rounded-l-md hover:bg-muted transition-colors"
                  onClick={onEdit}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            {visibleButtons.findIndex(b => b.component === 'edit') < visibleButtons.length - 1 && (
              <div className="w-px h-4 bg-border" />
            )}
          </>
        )}

        {!hideDownload && onDownload && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-full px-2 hover:bg-muted transition-colors"
                  onClick={onDownload}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download</TooltipContent>
            </Tooltip>
            {visibleButtons.findIndex(b => b.component === 'download') < visibleButtons.length - 1 && (
              <div className="w-px h-4 bg-border" />
            )}
          </>
        )}

        {!hideDuplicate && onDuplicate && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-full px-2 hover:bg-muted transition-colors"
                  onClick={onDuplicate}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate</TooltipContent>
            </Tooltip>
            {visibleButtons.findIndex(b => b.component === 'duplicate') < visibleButtons.length - 1 && (
              <div className="w-px h-4 bg-border" />
            )}
          </>
        )}

        {!hideView && onView && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-full px-2 hover:bg-muted transition-colors"
                  onClick={onView}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View</TooltipContent>
            </Tooltip>
            {visibleButtons.findIndex(b => b.component === 'view') < visibleButtons.length - 1 && (
              <div className="w-px h-4 bg-border" />
            )}
          </>
        )}

        {!hideDelete && onDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-full px-2 rounded-r-md hover:bg-muted transition-colors"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
