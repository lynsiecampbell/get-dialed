import React from 'react';
import { 
  Image, 
  Video, 
  Layers, 
  Globe, 
  Megaphone, 
  Link2, 
  Mail, 
  MessageCircle, 
  Sparkles,
  Users,
  type LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// ASSET COUNT COMPONENT
// ============================================================================
// Displays icon + count for assets (creatives, landing pages, ads, links, messaging)
// Used in: CampaignCard, ManageCampaignDrawer, asset summaries
//
// Usage Examples:
// <AssetCount type="creative" count={6} />
// <AssetCount type="landing-page" count={1} />
// <AssetCount type="ad" count={9} />
// <AssetCount type="link" count={35} />
// <AssetCount type="email" count={2} />
// <AssetCount type="social" count={4} />
// <AssetCount type="brand" count={1} />
// <AssetCount type="audience" count={3} />
// <AssetCount type="format" count={2} />
// ============================================================================

type AssetType = 
  | 'creative'
  | 'landing-page' 
  | 'ad'
  | 'link'
  | 'email'
  | 'social'
  | 'brand'
  | 'ad-copy'
  | 'audience'
  | 'format';

interface AssetCountConfig {
  icon: LucideIcon;
  label: string;
  colorClass: string; // Icon color
  bgClass: string;    // Background color
  borderClass: string; // Border color
}

const assetConfig: Record<AssetType, AssetCountConfig> = {
  'creative': {
    icon: Image,
    label: 'Creatives',
    colorClass: 'text-cyan-600',
    bgClass: 'bg-cyan-50',
    borderClass: 'border-cyan-200',
  },
  'landing-page': {
    icon: Globe,
    label: 'Landing Pages',
    colorClass: 'text-violet-600',
    bgClass: 'bg-violet-50',
    borderClass: 'border-violet-200',
  },
  'ad': {
    icon: Megaphone,
    label: 'Ads',
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-200',
  },
  'link': {
    icon: Link2,
    label: 'Links',
    colorClass: 'text-gray-600',
    bgClass: 'bg-gray-50',
    borderClass: 'border-gray-200',
  },
  'email': {
    icon: Mail,
    label: 'Email',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
  },
  'social': {
    icon: MessageCircle,
    label: 'Social',
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-50',
    borderClass: 'border-purple-200',
  },
  'brand': {
    icon: Sparkles,
    label: 'Brand',
    colorClass: 'text-teal-600',
    bgClass: 'bg-teal-50',
    borderClass: 'border-teal-200',
  },
  'ad-copy': {
    icon: Megaphone,
    label: 'Ad Copy',
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-200',
  },
  'audience': {
    icon: Users,
    label: 'Audiences',
    colorClass: 'text-teal-600',
    bgClass: 'bg-teal-50',
    borderClass: 'border-teal-200',
  },
  'format': {
    icon: Layers,
    label: 'Ad Formats',
    colorClass: 'text-teal-600',
    bgClass: 'bg-teal-50',
    borderClass: 'border-teal-200',
  },
};

interface AssetCountProps {
  type: AssetType;
  count: number;
  label?: string; // Override default label
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'minimal';
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
}

export function AssetCount({
  type,
  count,
  label,
  size = 'md',
  variant = 'outlined',
  className,
  iconClassName,
  onClick,
}: AssetCountProps) {
  const config = assetConfig[type];
  const Icon = config.icon;
  const displayLabel = label || config.label;

  // Size variants
  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 gap-1.5 text-xs',
      icon: 'h-3 w-3',
      text: 'text-xs',
    },
    md: {
      container: 'px-3 py-1.5 gap-2 text-sm',
      icon: 'h-3.5 w-3.5',
      text: 'text-sm',
    },
    lg: {
      container: 'px-4 py-2 gap-2.5 text-base',
      icon: 'h-4 w-4',
      text: 'text-base',
    },
  };

  // Variant styles
  const variantClasses = {
    default: `${config.bgClass} ${config.borderClass} border`,
    outlined: `bg-white ${config.borderClass} border`,
    minimal: 'bg-transparent',
  };

  const baseClasses = cn(
    'inline-flex items-center rounded-md font-medium transition-colors',
    sizeClasses[size].container,
    variantClasses[variant],
    onClick && 'cursor-pointer hover:opacity-80',
    className
  );

  const iconClasses = cn(
    config.colorClass,
    sizeClasses[size].icon,
    iconClassName
  );

  const textClasses = cn(
    'font-medium',
    variant === 'minimal' ? 'text-gray-700' : 'text-gray-900',
    sizeClasses[size].text
  );

  const countClasses = cn(
    'font-semibold',
    config.colorClass,
    sizeClasses[size].text
  );

  return (
    <div className={baseClasses} onClick={onClick}>
      <Icon className={iconClasses} />
      <span className={countClasses}>{count}</span>
      <span className={textClasses}>{displayLabel}</span>
    </div>
  );
}

// ============================================================================
// CONVENIENCE COMPONENTS
// ============================================================================

export function CreativeCount({ count, ...props }: Omit<AssetCountProps, 'type'>) {
  return <AssetCount type="creative" count={count} {...props} />;
}

export function LandingPageCount({ count, ...props }: Omit<AssetCountProps, 'type'>) {
  return <AssetCount type="landing-page" count={count} {...props} />;
}

export function AdCount({ count, ...props }: Omit<AssetCountProps, 'type'>) {
  return <AssetCount type="ad" count={count} {...props} />;
}

export function LinkCount({ count, ...props }: Omit<AssetCountProps, 'type'>) {
  return <AssetCount type="link" count={count} {...props} />;
}

export function EmailCount({ count, ...props }: Omit<AssetCountProps, 'type'>) {
  return <AssetCount type="email" count={count} {...props} />;
}

export function SocialCount({ count, ...props }: Omit<AssetCountProps, 'type'>) {
  return <AssetCount type="social" count={count} {...props} />;
}

export function BrandCount({ count, ...props }: Omit<AssetCountProps, 'type'>) {
  return <AssetCount type="brand" count={count} {...props} />;
}

export function AudienceCount({ count, ...props }: Omit<AssetCountProps, 'type'>) {
  return <AssetCount type="audience" count={count} {...props} />;
}

export function FormatCount({ count, ...props }: Omit<AssetCountProps, 'type'>) {
  return <AssetCount type="format" count={count} {...props} />;
}
