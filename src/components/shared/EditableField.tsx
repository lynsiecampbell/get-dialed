import { useState } from "react";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
  value: string;
  onSave?: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  editable?: boolean;
}

export function EditableField({
  value,
  onSave,
  placeholder = "—",
  className,
  multiline = false,
  editable = true,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    if (onSave && editValue.trim() !== value.trim()) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  // 🟢 1. Read-only mode (no onSave)
  if (!editable || !onSave) {
    return (
      <div
        className={cn(
          "px-2 py-1 text-sm text-gray-800 truncate",
          value ? "bg-transparent" : "text-gray-400 italic",
          className,
        )}
      >
        {value || placeholder}
      </div>
    );
  }

  // ✏️ 2. Editing mode
  if (isEditing) {
    return multiline ? (
      <textarea
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn(
          "bg-gray-50 px-2 py-1 rounded-md text-sm text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full resize-none transition-all",
          className,
        )}
        autoFocus
        rows={3}
      />
    ) : (
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn(
          "bg-gray-50 px-2 py-1 rounded-md text-sm text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full transition-all",
          className,
        )}
        autoFocus
      />
    );
  }

  // 🖱️ 3. Display mode (clickable / hoverable)
  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        "px-2 py-1 rounded-md text-sm text-gray-800 cursor-pointer hover:bg-gray-50 hover:border hover:border-gray-300 transition-colors truncate",
        className,
      )}
      title="Click to edit"
    >
      {value || placeholder}
    </div>
  );
}
