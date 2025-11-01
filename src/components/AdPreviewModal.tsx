import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  ExternalLink, 
  Pencil,
  X
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ad: {
    id: string;
    ad_name?: string | null;
    campaign?: string;
    audience_type: string;
    ad_format: string;
    status: string;
    platform?: string | null;
    headline?: string | null;
    body?: string | null;
    creative?: {
      name: string;
      creative_type: string;
      file_url: string | null;
      thumbnail_url: string | null;
    } | null;
    landing_page?: {
      name: string;
      url: string;
    } | null;
  };
  onEdit?: () => void;
}

export function AdPreviewModal({
  open,
  onOpenChange,
  ad,
  onEdit
}: AdPreviewModalProps) {
  const creative = ad.creative;
  const isVideo = creative?.creative_type === 'Video';
  const imageUrl = creative?.thumbnail_url || creative?.file_url || '/placeholder.svg';

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Creative Preview */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-black">
              {creative ? (
                isVideo && creative.file_url ? (
                  <video
                    src={creative.file_url}
                    controls
                    poster={creative.thumbnail_url || undefined}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <img
                    src={imageUrl}
                    alt={creative.name}
                    className="h-full w-full object-cover"
                  />
                )
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-muted">
                  <span className="text-muted-foreground">No Creative</span>
                </div>
              )}
            </div>

            {creative && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{creative.name}</p>
                <p className="capitalize">{creative.creative_type}</p>
              </div>
            )}
          </div>

          {/* Right: Ad Details */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold leading-tight">
                    {ad.ad_name || `${ad.campaign} | ${ad.audience_type}`}
                  </h2>
                  {ad.campaign && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {ad.campaign}
                    </p>
                  )}
                </div>

                <TooltipProvider>
                  <div className="flex items-center gap-2">
                    {onEdit && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={onEdit}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Ad</TooltipContent>
                      </Tooltip>
                    )}

                    <Badge status={ad.status.toLowerCase() as "active" | "draft" | "paused" | "archived"} dot compact />
                  </div>
                </TooltipProvider>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {ad.platform && (
                  <Badge platform={ad.platform.toLowerCase() as any}>
                    {ad.platform}
                  </Badge>
                )}
                <Badge audience={ad.audience_type.toLowerCase().replace(/ /g, '-') as any}>
                  {ad.audience_type}
                </Badge>
                <Badge type={ad.ad_format.toLowerCase() as any}>
                  {ad.ad_format}
                </Badge>
              </div>
            </div>

            {/* Ad Copy */}
            {(ad.headline || ad.body) && (
              <div className="space-y-4">
                <div className="h-px bg-border" />
                
                {ad.headline && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Headline
                      </h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyText(ad.headline!)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="text-sm leading-relaxed">{ad.headline}</p>
                  </div>
                )}

                {ad.body && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Primary Text
                      </h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyText(ad.body!)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {ad.body}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Landing Page */}
            {ad.landing_page && (
              <>
                <div className="h-px bg-border" />
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Landing Page
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{ad.landing_page.name}</span>
                    <a
                      href={ad.landing_page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-8 w-8 rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
