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
  iconColor: string;
}

const assetConfig: Record<AssetType, AssetCountConfig> = {
  'creative': {
    icon: Image,
    label: 'Creatives',
    iconColor: 'text-cyan-600',
  },
  'landing-page': {
    icon: Globe,
    label: 'Landing Pages',
    iconColor: 'text-violet-600',
  },
  'ad': {
    icon: Layers,
    label: 'Ads',
    iconColor: 'text-orange-600',
  },
  'link': {
    icon: Link2,
    label: 'Links',
    iconColor: 'text-gray-600',
  },
  'email': {
    icon: Mail,
    label: 'Email',
    iconColor: 'text-blue-600',
  },
  'social': {
    icon: MessageCircle,
    label: 'Social',
    iconColor: 'text-purple-600',
  },
  'brand': {
    icon: Sparkles,
    label: 'Brand',
    iconColor: 'text-teal-600',
  },
  'ad-copy': {
    icon: Megaphone,
    label: 'Ad',
    iconColor: 'text-orange-600',
  },
  'audience': {
    icon: Users,
    label: 'Audiences',
    iconColor: 'text-teal-600',
  },
  'format': {
    icon: Layers,
    label: 'Ad Formats',
    iconColor: 'text-teal-600',
  },
};

interface AssetCountProps {
  type: AssetType;
  count: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export function AssetCount({
  type,
  count,
  label,
  size = 'md',
  className,
  onClick,
}: AssetCountProps) {
  const config = assetConfig[type];
  const Icon = config.icon;
  const displayLabel = label || config.label;

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 gap-1.5 text-xs',
      icon: 'h-3.5 w-3.5',
    },
    md: {
      container: 'px-3 py-2 gap-2 text-sm',
      icon: 'h-3.5 w-3.5',
    },
    lg: {
      container: 'px-4 py-2.5 gap-2.5 text-base',
      icon: 'h-5 w-5',
    },
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-sm bg-gray-50 border border-gray-300',
        sizeClasses[size].container,
        onClick && 'cursor-pointer hover:bg-gray-100',
        className
      )}
      onClick={onClick}
    >
      <Icon className={cn(config.iconColor, sizeClasses[size].icon)} />
      <span className="font-semibold text-gray-700">{count}</span>
      <span className="text-gray-700">{displayLabel}</span>
    </div>
  );
}

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
