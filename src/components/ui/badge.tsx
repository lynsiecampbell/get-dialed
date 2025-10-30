import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// =====================================================
// UNIFIED BADGE COMPONENT
// =====================================================
// Replaces: badge.tsx, status-badge.tsx, Tag.tsx, 
//           MessagingTag.tsx, AssetTag.tsx
// =====================================================

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-[3px] border px-2.5 py-0.5 text-xs font-medium transition-colors whitespace-nowrap",
  {
    variants: {
      // Base visual variants
      variant: {
        default: "border-primary/20 bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-secondary/20 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-destructive/20 bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "border-border bg-background text-foreground hover:bg-muted",
        muted: "border-border bg-muted/50 text-foreground hover:bg-muted",
      },
      
      // Status colors (for campaigns, ads, etc.)
      status: {
        active: "border-green-200 bg-green-50 text-green-700 dark:border-green-800/30 dark:bg-green-950/30 dark:text-green-400",
        draft: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800/30 dark:bg-yellow-950/30 dark:text-yellow-400",
        paused: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800/30 dark:bg-orange-950/30 dark:text-orange-400",
        archived: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800/30 dark:bg-gray-950/30 dark:text-gray-400",
        completed: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/30 dark:bg-blue-950/30 dark:text-blue-400",
      },
      
      // Platform/Source colors
      platform: {
        meta: "border-blue-200 bg-blue-50 text-blue-700",
        facebook: "border-blue-200 bg-blue-50 text-blue-700",
        instagram: "border-rose-200 bg-rose-50 text-rose-700",
        linkedin: "border-sky-200 bg-sky-50 text-sky-700",
        google: "border-yellow-200 bg-yellow-50 text-yellow-700",
        youtube: "border-red-200 bg-red-50 text-red-700",
        tiktok: "border-pink-200 bg-pink-50 text-pink-700",
        email: "border-emerald-200 bg-emerald-50 text-emerald-700",
        website: "border-violet-200 bg-violet-50 text-violet-700",
        partner: "border-amber-200 bg-amber-50 text-amber-700",
        influencer: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
        event: "border-orange-200 bg-orange-50 text-orange-700",
        organic: "border-gray-200 bg-gray-50 text-gray-700",
      },
      
      // Medium colors
      medium: {
        "paid-social": "border-indigo-200 bg-indigo-50 text-indigo-700",
        "paid-search": "border-purple-200 bg-purple-50 text-purple-700",
        "paid-video": "border-rose-200 bg-rose-50 text-rose-700",
        email: "border-emerald-200 bg-emerald-50 text-emerald-700",
        newsletter: "border-teal-200 bg-teal-50 text-teal-700",
        organic_social: "border-violet-200 bg-violet-50 text-violet-700",
        referral: "border-cyan-200 bg-cyan-50 text-cyan-700",
        blog: "border-slate-200 bg-slate-50 text-slate-700",
        bio: "border-pink-200 bg-pink-50 text-pink-700",
        offline: "border-stone-200 bg-stone-50 text-stone-700",
        experiment: "border-amber-200 bg-amber-50 text-amber-700",
      },
      
      // Creative types
      type: {
        image: "border-blue-200 bg-blue-50 text-blue-700",
        video: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
        carousel: "border-cyan-200 bg-cyan-50 text-cyan-700",
      },
      
      // Audience types
      audience: {
        "website-visitors": "border-orange-200 bg-orange-50 text-orange-700",
        lookalike: "border-amber-200 bg-amber-50 text-amber-700",
        "customer-list": "border-emerald-200 bg-emerald-50 text-emerald-700",
        "company-list": "border-teal-200 bg-teal-50 text-teal-700",
        cold: "border-blue-200 bg-blue-50 text-blue-700",
        warm: "border-orange-200 bg-orange-50 text-orange-700",
        retargeting: "border-purple-200 bg-purple-50 text-purple-700",
      },
      
      // Size variants
      size: {
        sm: "text-[10px] px-1.5 py-0 gap-1",
        md: "text-xs px-2.5 py-0.5 gap-1.5",
        lg: "text-sm px-3 py-1 gap-2",
      },
    },
    defaultVariants: {
      variant: "muted",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  // Icon support
  icon?: LucideIcon;
  iconClassName?: string;
  
  // Dot indicator (for status badges)
  dot?: boolean;
  dotColor?: string;
  
  // Count display (for asset/messaging badges)
  count?: number;
  label?: string; // e.g., "Creative", "Ad", "Link"
  
  // Interactive
  clickable?: boolean;
  onRemove?: () => void;
  
  // Compact mode (hide text, show only dot/icon)
  compact?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant,
      status,
      platform,
      medium,
      type,
      audience,
      size,
      icon: Icon,
      iconClassName,
      dot,
      dotColor,
      count,
      label,
      clickable,
      onClick,
      onRemove,
      compact,
      children,
      ...props
    },
    ref
  ) => {
    // Determine if this should be a button
    const Component = clickable || onClick ? "button" : "div";
    
    // Auto-singularize label based on count
    const displayLabel = React.useMemo(() => {
      if (!label) return null;
      if (count === 1 && label.endsWith('s')) {
        return label.slice(0, -1);
      }
      return label;
    }, [label, count]);

    // Determine dot color from status
    const determinedDotColor = React.useMemo(() => {
      if (dotColor) return dotColor;
      if (status === "active") return "bg-green-600 dark:bg-green-400";
      if (status === "draft") return "bg-yellow-500 dark:bg-yellow-400";
      if (status === "paused") return "bg-orange-500 dark:bg-orange-400";
      if (status === "archived") return "bg-gray-500 dark:bg-gray-400";
      return "bg-primary";
    }, [dotColor, status]);

    return (
      <Component
        ref={ref}
        type={Component === "button" ? "button" : undefined}
        onClick={onClick}
        className={cn(
          badgeVariants({ variant, status, platform, medium, type, audience, size }),
          clickable && "cursor-pointer hover:opacity-90 hover:shadow-sm",
          className
        )}
        {...props}
      >
        {/* Dot indicator */}
        {dot && !compact && (
          <span className={cn("h-2 w-2 rounded-full", determinedDotColor)} />
        )}
        
        {/* Icon */}
        {Icon && <Icon className={cn("h-3.5 w-3.5", iconClassName)} />}
        
        {/* Content */}
        {!compact && (
          <>
            {count !== undefined ? (
              <span>
                {count} {displayLabel}
              </span>
            ) : (
              children
            )}
          </>
        )}
        
        {/* Remove button */}
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="ml-0.5 hover:text-destructive transition-colors"
          >
            ×
          </button>
        )}
      </Component>
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
