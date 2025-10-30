import { cn } from "@/lib/utils";

/**
 * Standardized table styling utilities
 * Based on the Campaigns table structure
 */

export const tableStyles = {
  // Table headers - uppercase, smaller font, gray
  header: "text-sm font-medium text-gray-600 uppercase px-4 py-3",
  
  // Table cells - consistent padding
  cell: "px-4 py-3 align-middle",
  
  // Table row hover effect
  row: "hover:bg-gray-50 transition-colors",
  
  // Asset names - dark, bold, no background
  assetName: "text-gray-900 font-semibold",
  
  // Editable fields - gray background
  editableField: "bg-gray-50 px-2 py-1 rounded-md text-sm text-gray-700 hover:border hover:border-gray-300 cursor-pointer",
  
  // Tags - rounded pills with color coding
  tag: {
    base: "rounded-full text-xs font-medium px-2 py-1 inline-block",
    status: {
      active: "bg-green-100 text-green-700",
      draft: "bg-gray-100 text-gray-700",
      paused: "bg-yellow-100 text-yellow-700",
      archived: "bg-gray-100 text-gray-500",
    },
    type: "bg-blue-100 text-blue-700",
    medium: "bg-purple-100 text-purple-700",
    source: "bg-teal-100 text-teal-700",
    audience: "bg-orange-100 text-orange-700",
  },
  
  // Associated assets - light gray with icons
  associatedAsset: "bg-gray-50 rounded-md px-2 py-1 inline-flex items-center gap-1 text-gray-700 text-sm",
} as const;
