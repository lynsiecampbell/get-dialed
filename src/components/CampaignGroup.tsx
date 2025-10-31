import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AssetCount } from '@/components/ui/asset-count';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, ChevronRight, Plus, Copy, Download, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CampaignGroupProps {
  campaignName: string;
  campaignId?: string;
  campaignType?: string;
  adCount: number;
  audienceCount: number;
  formatCount: number;
  children: React.ReactNode;
  onNewAd?: () => void;
  onDuplicateCampaign?: () => void;
  onExportAds?: () => void;
  onCampaignSettings?: () => void;
  defaultOpen?: boolean;
}

export function CampaignGroup({
  campaignName,
  campaignId,
  campaignType = 'content',
  adCount,
  audienceCount,
  formatCount,
  children,
  onNewAd,
  onDuplicateCampaign,
  onExportAds,
  onCampaignSettings,
  defaultOpen = true,
}: CampaignGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-sm bg-card overflow-hidden mb-4">
      {/* Campaign Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Collapse Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={isOpen ? 'Collapse campaign' : 'Expand campaign'}
            >
              {isOpen ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>

            {/* Campaign Name */}
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-foreground">
                {campaignName}
              </h3>
            </div>

          </div>

          {/* Action Buttons */}
          <TooltipProvider>
            <div className="inline-flex items-center border border-border bg-background h-8 rounded-sm">
              {onCampaignSettings && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-full px-2 rounded-l-md hover:bg-muted transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCampaignSettings();
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Campaign Settings</TooltipContent>
                  </Tooltip>
                  {(onNewAd || onDuplicateCampaign || onExportAds) && (
                    <div className="w-px h-4 bg-border" />
                  )}
                </>
              )}
              {onNewAd && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-full px-2 hover:bg-muted transition-colors",
                          !onCampaignSettings && "rounded-l-md"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onNewAd();
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>New Ad</TooltipContent>
                  </Tooltip>
                  {(onDuplicateCampaign || onExportAds) && (
                    <div className="w-px h-4 bg-border" />
                  )}
                </>
              )}
              {onDuplicateCampaign && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-full px-2 hover:bg-muted transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateCampaign();
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Duplicate Campaign</TooltipContent>
                  </Tooltip>
                  {onExportAds && (
                    <div className="w-px h-4 bg-border" />
                  )}
                </>
              )}
              {onExportAds && (
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-full px-2 rounded-r-md hover:bg-muted transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Export Ads</TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" className="w-72">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onExportAds();
                      }}
                    >
                      <Download className="h-4 w-4 mr-2 flex-shrink-0" />
                      Export for Meta
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled className="opacity-50">
                      <Download className="h-4 w-4 mr-2 flex-shrink-0" />
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="whitespace-nowrap">Export for Google Ads</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Coming soon</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled className="opacity-50">
                      <Download className="h-4 w-4 mr-2 flex-shrink-0" />
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="whitespace-nowrap">Export for LinkedIn</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Coming soon</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled className="opacity-50">
                      <Download className="h-4 w-4 mr-2 flex-shrink-0" />
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="whitespace-nowrap">Export for TikTok</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Coming soon</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </TooltipProvider>
        </div>
      </div>

      {/* Campaign Content */}
      {isOpen && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
}
