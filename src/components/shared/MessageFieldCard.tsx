import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit3, Trash2, Check, X, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MessageFieldCardProps {
  value: string;
  onEdit?: (newValue: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  className?: string;
  multiline?: boolean;
}

export function MessageFieldCard({
  value,
  onEdit,
  onDelete,
  className,
  multiline = false,
}: MessageFieldCardProps) {
  const [isEditing, setIsEditing] = useState(!value || !value.trim());
  const [editValue, setEditValue] = useState(value);
  const [isHovered, setIsHovered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);
  
  // Auto-enter edit mode for empty values
  useEffect(() => {
    if (!value || !value.trim()) {
      setIsEditing(true);
    }
  }, [value]);

  const handleCopy = async () => {
    if (isEditing || !value.trim()) return; // Don't copy when editing or empty
    
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard ✅", {
        duration: 1500,
        position: "bottom-center",
      });
      setTimeout(() => setCopied(false), 500);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(value);
  };

  const handleSave = async () => {
    if (!onEdit) return;
    
    setIsSaving(true);
    try {
      await onEdit(editValue);
      setIsEditing(false);
      toast.success("Updated successfully");
    } catch (error) {
      toast.error("Failed to update");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // If value is empty, delete instead of cancel
    if (!value || !value.trim()) {
      handleDelete();
      return;
    }
    setIsEditing(false);
    setEditValue(value);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      await onDelete();
      toast.success("Deleted successfully");
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete");
      setDeleteDialogOpen(false);
    }
  };

  if (isEditing) {
    return (
      <div className={cn("space-y-2", className)}>
        {multiline ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[100px] border-input focus:border-ring"
            placeholder="Enter text..."
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-sm focus:outline-none focus:ring-1 focus:ring-ring text-sm"
            placeholder="Enter text..."
            autoFocus
          />
        )}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !editValue.trim()}
            className="h-8"
          >
            <Check className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="h-8"
          >
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }


  return (
    <>
      <div
        className={cn(
          "relative group rounded-sm p-3 transition-all duration-200 cursor-pointer border border-transparent",
          copied && "animate-pulse bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
          !copied && isHovered && "bg-teal-50 dark:bg-teal-950 border-teal-200 dark:border-teal-800",
          !copied && !isHovered && "bg-muted border-border",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCopy}
      >
        <div className="text-sm leading-relaxed pr-16 whitespace-pre-wrap break-words">
          {value}
        </div>
        
        {isHovered && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
              >
                <Edit3 className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
