import { Pencil, Download, Trash2, Copy } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AssetActionsProps {
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
}

export function AssetActions({ onEdit, onDuplicate, onDownload, onDelete, disabled = false }: AssetActionsProps) {
  const baseButtonClasses = cn(
    "h-full px-2 inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-1",
    disabled 
      ? "text-gray-300 cursor-not-allowed" 
      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div className="inline-flex items-center border border-gray-200 bg-white h-8 rounded-md overflow-hidden">
        {onEdit && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={cn(baseButtonClasses, !onDuplicate && !onDownload && !onDelete && "rounded-md")}
                  onClick={onEdit}
                  disabled={disabled}
                  type="button"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit</p>
              </TooltipContent>
            </Tooltip>
            {(onDuplicate || onDownload || onDelete) && <div className="w-px h-4 bg-gray-200" />}
          </>
        )}

        {onDuplicate && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={baseButtonClasses}
                  onClick={onDuplicate}
                  disabled={disabled}
                  type="button"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Duplicate</p>
              </TooltipContent>
            </Tooltip>
            {(onDownload || onDelete) && <div className="w-px h-4 bg-gray-200" />}
          </>
        )}

        {onDownload && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={baseButtonClasses}
                  onClick={onDownload}
                  disabled={disabled}
                  type="button"
                >
                  <Download className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download</p>
              </TooltipContent>
            </Tooltip>
            {onDelete && <div className="w-px h-4 bg-gray-200" />}
          </>
        )}

        {onDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={cn(baseButtonClasses, "rounded-r-md", !onEdit && !onDuplicate && !onDownload && "rounded-l-md")}
                onClick={onDelete}
                disabled={disabled}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
