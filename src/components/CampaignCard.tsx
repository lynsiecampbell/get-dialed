import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Pencil, Trash2, Plus } from "lucide-react";
import { AddMenu } from "./AddMenu";
import { Separator } from "@/components/ui/separator";
import { AssetCount } from "@/components/ui/asset-count";

interface Message {
  id: string;
  campaign: string;
  campaign_type: "evergreen" | "product" | "content" | "promo";
  headline: string | null;
  primary_text: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Assets {
  creatives: number;
  landingPages: number;
  ads: number;
}

interface CampaignCardProps {
  campaign: string;
  messages: Message[];
  assets: Assets;
  onEdit: () => void;
  onDelete: () => void;
  onAddHeadline: () => void;
  onAddPrimaryText: () => void;
  onAddCreativeExisting: () => void;
  onAddCreativeNew: () => void;
  onAddLandingPageExisting: () => void;
  onAddLandingPageNew: () => void;
  onAddAdExisting: () => void;
  onAddAdNew: () => void;
  onViewCreatives: () => void;
  onViewLandingPages: () => void;
  onViewAds: () => void;
  onClick: () => void;
}

export function CampaignCard({
  campaign,
  messages,
  assets,
  onEdit,
  onDelete,
  onAddHeadline,
  onAddPrimaryText,
  onAddCreativeExisting,
  onAddCreativeNew,
  onAddLandingPageExisting,
  onAddLandingPageNew,
  onAddAdExisting,
  onAddAdNew,
  onViewCreatives,
  onViewLandingPages,
  onViewAds,
  onClick,
}: CampaignCardProps) {
  const campaignType = messages[0]?.campaign_type || "content";
  const latestUpdate = messages.reduce((latest, msg) => {
    return new Date(msg.updated_at) > new Date(latest) ? msg.updated_at : latest;
  }, messages[0]?.updated_at || "");

  // Extract messaging from the campaign's messaging field
  const messaging = (messages[0] as any)?.messaging || {};
  const brandMessaging = messaging.brandMessaging || {};
  const emailMessaging = messaging.emailMessaging || {};
  const adMessaging = messaging.adMessaging || {};
  const socialMessaging = messaging.socialMessaging || {};
  
  // Calculate counts for each messaging type
  const brandCount = (brandMessaging.brandHeadlines?.length || 0) + (brandMessaging.copy?.length || 0) + (brandMessaging.taglines?.length || 0);
  const emailCount = (emailMessaging.subjectLines?.length || 0) + (emailMessaging.bodyCopy?.length || 0);
  const adCount = (adMessaging.headlines?.length || 0) + (adMessaging.primaryTexts?.length || 0);
  const socialCount = (socialMessaging.postCopy?.length || 0) + (socialMessaging.hashtags?.length || 0);

  const campaignTypeConfig = {
    evergreen: {
      label: "Evergreen",
      color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    },
    product: {
      label: "Product",
      color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    },
    content: {
      label: "Content",
      color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    },
    promo: {
      label: "Promo",
      color: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
    },
  };

  const typeConfig = campaignTypeConfig[campaignType];

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer border border-border bg-card p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]" 
      style={{ borderRadius: '5px' }}
    >
      {/* Header: Campaign Name + Type Badge */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold text-foreground">{campaign}</h2>
        <Badge 
          variant="outline" 
          className={`${typeConfig.color} text-xs font-medium`}
          style={{ borderRadius: '3px' }}
        >
          {typeConfig.label}
        </Badge>
      </div>

      {/* Assets Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-foreground">Assets</span>
        </div>
        {(assets.creatives > 0 || assets.landingPages > 0 || assets.ads > 0) ? (
          <div className="flex flex-wrap gap-2">
            {assets.creatives > 0 && (
              <AssetCount
                type="creative"
                count={assets.creatives}
                size="sm"
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewCreatives();
                }}
              />
            )}
            {assets.landingPages > 0 && (
              <AssetCount
                type="landing-page"
                count={assets.landingPages}
                size="sm"
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewLandingPages();
                }}
              />
            )}
            {assets.ads > 0 && (
              <AssetCount
                type="ad"
                count={assets.ads}
                size="sm"
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewAds();
                }}
              />
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No assets yet</p>
        )}
      </div>

      {/* Divider */}
      <Separator className="my-4" />

      {/* Messaging Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-foreground">Messaging</span>
        </div>
        {(brandCount > 0 || emailCount > 0 || adCount > 0 || socialCount > 0) ? (
          <div className="flex flex-wrap gap-2">
            {brandCount > 0 && (
              <AssetCount
                type="brand"
                count={brandCount}
                size="sm"
                variant="outlined"
              />
            )}
            {emailCount > 0 && (
              <AssetCount
                type="email"
                count={emailCount}
                size="sm"
                variant="outlined"
              />
            )}
            {adCount > 0 && (
              <AssetCount
                type="ad-copy"
                count={adCount}
                size="sm"
                variant="outlined"
              />
            )}
            {socialCount > 0 && (
              <AssetCount
                type="social"
                count={socialCount}
                size="sm"
                variant="outlined"
              />
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No messaging yet</p>
        )}
      </div>

      {/* Footer: Actions and Date */}
      <div className="flex justify-between items-center text-sm text-muted-foreground border-t border-border pt-3">
        <span className="flex items-center gap-1.5 text-xs">
          <Clock className="h-3.5 w-3.5" />
          Updated {format(new Date(latestUpdate), "MMM d, yyyy")}
        </span>
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="hover:text-foreground transition-colors"
            title="Edit Campaign"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="hover:text-destructive transition-colors"
            title="Delete Campaign"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <AddMenu
            campaignId={campaign}
            side="left"
            trigger={
              <button 
                onClick={(e) => e.stopPropagation()}
                className="hover:text-foreground transition-colors"
                title="Add to Campaign"
              >
                <Plus className="h-4 w-4" />
              </button>
            }
            onAddHeadline={onAddHeadline}
            onAddPrimaryText={onAddPrimaryText}
            onSelectExistingCreative={onAddCreativeExisting}
            onAddNewCreative={onAddCreativeNew}
            onSelectExistingLandingPage={onAddLandingPageExisting}
            onAddNewLandingPage={onAddLandingPageNew}
            onSelectExistingAd={onAddAdExisting}
            onAddNewAd={onAddAdNew}
          />
        </div>
      </div>
    </div>
  );
}
