import { useState, useEffect } from "react";
import { DrawerLarge } from "@/components/shared/DrawerLarge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/lib/toast-helpers";
import { 
  ChevronDown, 
  Plus, 
  Trash2, 
  Pencil,
  Mail, 
  Megaphone, 
  MessageCircle, 
  Sparkles,
  Image as ImageIcon,
  Globe,
  Layers,
  Link2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Import all the "New" drawers
import { NewBrandMessagingDrawer } from "./NewBrandMessagingDrawer";
import { NewEmailMessagingDrawer } from "./NewEmailMessagingDrawer";
import { NewAdMessagingDrawer } from "./NewAdMessagingDrawer";
import { NewSocialMessagingDrawer } from "./NewSocialMessagingDrawer";
import { NewCreativeDrawer } from "./NewCreativeDrawer";
import { NewLandingPageDrawer } from "./NewLandingPageDrawer";
import { NewAdDrawer } from "./NewAdDrawer";

interface Campaign {
  id: string;
  name: string;
  type: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
}

interface MessagingItem {
  id: string;
  name: string;
  messaging_type: string;
  headlines?: string[];
  body_copy?: string[];
  subject_lines?: string[];
  ctas?: string[];
  notes?: string;
}

interface Creative {
  id: string;
  name: string;
  creative_type: string;
  creative_format: string;
  image_urls?: string[];
  status: string;
}

interface LandingPage {
  id: string;
  name: string;
  url: string;
  description?: string;
  status: string;
}

interface Ad {
  id: string;
  platform?: string;
  audience_type?: string;
  ad_format?: string;
  status: string;
  version?: string;
}

interface Link {
  id: string;
  link_name?: string;
  link_type: string;
  base_url: string;
  full_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

interface ManageCampaignDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
  onSuccess?: () => void;
}

const CAMPAIGN_STATUSES = ["Planning", "Active", "Paused", "Completed", "Archived"];
const CAMPAIGN_TYPES = ["Evergreen", "Content", "Product", "Promotional", "Event"];

export function ManageCampaignDrawer({
  open,
  onOpenChange,
  campaign,
  onSuccess,
}: ManageCampaignDrawerProps) {
  const { user } = useAuth();

  // Campaign form data
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("Planning");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Assets state
  const [messaging, setMessaging] = useState<MessagingItem[]>([]);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [links, setLinks] = useState<Link[]>([]);

  // Drawer states
  const [showBrandDrawer, setShowBrandDrawer] = useState(false);
  const [showEmailDrawer, setShowEmailDrawer] = useState(false);
  const [showAdMessagingDrawer, setShowAdMessagingDrawer] = useState(false);
  const [showSocialDrawer, setShowSocialDrawer] = useState(false);
  const [showCreativeDrawer, setShowCreativeDrawer] = useState(false);
  const [showLandingPageDrawer, setShowLandingPageDrawer] = useState(false);
  const [showAdDrawer, setShowAdDrawer] = useState(false);

  // Collapsible states
  const [brandOpen, setBrandOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [adMessagingOpen, setAdMessagingOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [creativesOpen, setCreativesOpen] = useState(false);
  const [landingPagesOpen, setLandingPagesOpen] = useState(false);
  const [adsOpen, setAdsOpen] = useState(false);
  const [linksOpen, setLinksOpen] = useState(false);

  // Load campaign data when drawer opens
  useEffect(() => {
    if (campaign && open) {
      setName(campaign.name);
      setType(campaign.type || "");
      setStatus(campaign.status);
      setNotes(campaign.notes || "");
      fetchAssets();
    }
  }, [campaign, open]);

  const fetchAssets = async () => {
    if (!campaign) return;

    try {
      // Fetch messaging
      const { data: messagingData } = await supabase
        .from("campaign_messaging")
        .select(`
          messaging_id,
          messaging (
            id,
            name,
            messaging_type,
            headlines,
            body_copy,
            subject_lines,
            ctas,
            notes
          )
        `)
        .eq("campaign_id", campaign.id);

      if (messagingData) {
        setMessaging(messagingData.map((m: any) => m.messaging).filter(Boolean));
      }

      // Fetch creatives
      const { data: creativesData } = await supabase
        .from("campaign_creatives")
        .select(`
          creative_id,
          creatives (
            id,
            name,
            creative_type,
            creative_format,
            image_urls,
            status
          )
        `)
        .eq("campaign_id", campaign.id);

      if (creativesData) {
        setCreatives(creativesData.map((c: any) => c.creatives).filter(Boolean));
      }

      // Fetch landing pages
      const { data: lpData } = await supabase
        .from("campaign_landing_pages")
        .select(`
          landing_page_id,
          landing_pages (
            id,
            name,
            url,
            description,
            status
          )
        `)
        .eq("campaign_id", campaign.id);

      if (lpData) {
        setLandingPages(lpData.map((lp: any) => lp.landing_pages).filter(Boolean));
      }

      // Fetch ads
      const { data: adsData } = await supabase
        .from("ads")
        .select("id, platform, audience_type, ad_format, status, version")
        .eq("campaign_id", campaign.id);

      if (adsData) {
        setAds(adsData);
      }

      // Fetch manual links
      const { data: linksData } = await supabase
        .from("campaign_links")
        .select(`
          link_id,
          links (
            id,
            link_name,
            link_type,
            base_url,
            full_url,
            utm_source,
            utm_medium,
            utm_campaign
          )
        `)
        .eq("campaign_id", campaign.id);

      if (linksData) {
        setLinks(linksData.map((l: any) => l.links).filter(Boolean));
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

  const handleSave = async () => {
    if (!campaign || !user) return;

    if (!name.trim()) {
      showError("Campaign name is required");
      return;
    }

    if (!type) {
      showError("Campaign type is required");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("campaigns")
        .update({
          name: name.trim(),
          type,
          status,
          notes: notes.trim() || null,
        })
        .eq("id", campaign.id);

      if (error) throw error;

      showSuccess("Campaign updated successfully!");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating campaign:", error);
      showError(error.message || "Failed to update campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAsset = async (type: string, id: string) => {
    if (!campaign) return;

    try {
      if (type === "messaging") {
        await supabase
          .from("campaign_messaging")
          .delete()
          .eq("campaign_id", campaign.id)
          .eq("messaging_id", id);
      } else if (type === "creative") {
        await supabase
          .from("campaign_creatives")
          .delete()
          .eq("campaign_id", campaign.id)
          .eq("creative_id", id);
      } else if (type === "landing_page") {
        await supabase
          .from("campaign_landing_pages")
          .delete()
          .eq("campaign_id", campaign.id)
          .eq("landing_page_id", id);
      } else if (type === "ad") {
        await supabase
          .from("ads")
          .delete()
          .eq("id", id);
      } else if (type === "link") {
        await supabase
          .from("campaign_links")
          .delete()
          .eq("campaign_id", campaign.id)
          .eq("link_id", id);
      }

      showSuccess("Asset removed from campaign");
      fetchAssets();
    } catch (error: any) {
      console.error("Error deleting asset:", error);
      showError(error.message || "Failed to remove asset");
    }
  };

  // Filter messaging by type
  const brandMessaging = messaging.filter(m => m.messaging_type === "Brand");
  const emailMessaging = messaging.filter(m => m.messaging_type === "Email");
  const adMessaging = messaging.filter(m => m.messaging_type === "Ad");
  const socialMessaging = messaging.filter(m => m.messaging_type === "Social");

  if (!campaign) return null;

  return (
    <DrawerLarge
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Manage Campaign"
      onSave={handleSave}
      saveText={loading ? "Saving..." : "Save Changes"}
      isLoading={loading}
    >
      <div className="space-y-6 p-6">
        {/* Campaign Details */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Campaign Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Campaign name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {CAMPAIGN_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAMPAIGN_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Campaign notes..."
              className="min-h-[80px]"
            />
          </div>
        </div>

        {/* Two Column Layout: Messaging | Assets */}
        <div className="grid grid-cols-2 gap-6">
          {/* Campaign Messaging */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Campaign Messaging</h3>

            {/* Brand / Campaign Copy */}
            <Collapsible open={brandOpen} onOpenChange={setBrandOpen}>
              <div className="border rounded-lg">
                <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                  <CollapsibleTrigger className="flex items-center gap-2 flex-1">
                    <ChevronDown className={`h-4 w-4 transition-transform ${brandOpen ? "" : "-rotate-90"}`} />
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span className="font-medium text-sm">Brand / Campaign Copy</span>
                    <Badge variant="secondary" className="ml-auto">{brandMessaging.length}</Badge>
                  </CollapsibleTrigger>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowBrandDrawer(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <CollapsibleContent>
                  <div className="p-3 pt-0 space-y-2">
                    {brandMessaging.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-sm">{item.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAsset("messaging", item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {brandMessaging.length === 0 && (
                      <p className="text-xs text-muted-foreground">No brand messaging yet</p>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Email Messaging */}
            <Collapsible open={emailOpen} onOpenChange={setEmailOpen}>
              <div className="border rounded-lg">
                <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                  <CollapsibleTrigger className="flex items-center gap-2 flex-1">
                    <ChevronDown className={`h-4 w-4 transition-transform ${emailOpen ? "" : "-rotate-90"}`} />
                    <Mail className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium text-sm">Email Messaging</span>
                    <Badge variant="secondary" className="ml-auto">{emailMessaging.length}</Badge>
                  </CollapsibleTrigger>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEmailDrawer(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <CollapsibleContent>
                  <div className="p-3 pt-0 space-y-2">
                    {emailMessaging.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-sm">{item.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAsset("messaging", item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {emailMessaging.length === 0 && (
                      <p className="text-xs text-muted-foreground">No email messaging yet</p>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Ad Messaging */}
            <Collapsible open={adMessagingOpen} onOpenChange={setAdMessagingOpen}>
              <div className="border rounded-lg">
                <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                  <CollapsibleTrigger className="flex items-center gap-2 flex-1">
                    <ChevronDown className={`h-4 w-4 transition-transform ${adMessagingOpen ? "" : "-rotate-90"}`} />
                    <Megaphone className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">Ad Messaging</span>
                    <Badge variant="secondary" className="ml-auto">{adMessaging.length}</Badge>
                  </CollapsibleTrigger>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAdMessagingDrawer(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <CollapsibleContent>
                  <div className="p-3 pt-0 space-y-2">
                    {adMessaging.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-sm">{item.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAsset("messaging", item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {adMessaging.length === 0 && (
                      <p className="text-xs text-muted-foreground">No ad messaging yet</p>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Social Messaging */}
            <Collapsible open={socialOpen} onOpenChange={setSocialOpen}>
              <div className="border rounded-lg">
                <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                  <CollapsibleTrigger className="flex items-center gap-2 flex-1">
                    <ChevronDown className={`h-4 w-4 transition-transform ${socialOpen ? "" : "-rotate-90"}`} />
                    <MessageCircle className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-sm">Social Messaging</span>
                    <Badge variant="secondary" className="ml-auto">{socialMessaging.length}</Badge>
                  </CollapsibleTrigger>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSocialDrawer(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <CollapsibleContent>
                  <div className="p-3 pt-0 space-y-2">
                    {socialMessaging.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-sm">{item.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAsset("messaging", item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {socialMessaging.length === 0 && (
                      <p className="text-xs text-muted-foreground">No social messaging yet</p>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>

          {/* Campaign Assets */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Campaign Assets</h3>

            {/* Creatives */}
            <Collapsible open={creativesOpen} onOpenChange={setCreativesOpen}>
              <div className="border rounded-lg">
                <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                  <CollapsibleTrigger className="flex items-center gap-2 flex-1">
                    <ChevronDown className={`h-4 w-4 transition-transform ${creativesOpen ? "" : "-rotate-90"}`} />
                    <ImageIcon className="h-4 w-4 text-cyan-600" />
                    <span className="font-medium text-sm">Creatives</span>
                    <Badge variant="secondary" className="ml-auto">{creatives.length}</Badge>
                  </CollapsibleTrigger>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCreativeDrawer(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <CollapsibleContent>
                  <div className="p-3 pt-0 space-y-2">
                    {creatives.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-sm">{item.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAsset("creative", item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {creatives.length === 0 && (
                      <p className="text-xs text-muted-foreground">No creatives yet</p>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Landing Pages */}
            <Collapsible open={landingPagesOpen} onOpenChange={setLandingPagesOpen}>
              <div className="border rounded-lg">
                <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                  <CollapsibleTrigger className="flex items-center gap-2 flex-1">
                    <ChevronDown className={`h-4 w-4 transition-transform ${landingPagesOpen ? "" : "-rotate-90"}`} />
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">Landing Pages</span>
                    <Badge variant="secondary" className="ml-auto">{landingPages.length}</Badge>
                  </CollapsibleTrigger>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLandingPageDrawer(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <CollapsibleContent>
                  <div className="p-3 pt-0 space-y-2">
                    {landingPages.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-sm">{item.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAsset("landing_page", item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {landingPages.length === 0 && (
                      <p className="text-xs text-muted-foreground">No landing pages yet</p>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Ads */}
            <Collapsible open={adsOpen} onOpenChange={setAdsOpen}>
              <div className="border rounded-lg">
                <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                  <CollapsibleTrigger className="flex items-center gap-2 flex-1">
                    <ChevronDown className={`h-4 w-4 transition-transform ${adsOpen ? "" : "-rotate-90"}`} />
                    <Layers className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-sm">Ads</span>
                    <Badge variant="secondary" className="ml-auto">{ads.length}</Badge>
                  </CollapsibleTrigger>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAdDrawer(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <CollapsibleContent>
                  <div className="p-3 pt-0 space-y-2">
                    {ads.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-sm">{item.platform} - {item.audience_type}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAsset("ad", item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {ads.length === 0 && (
                      <p className="text-xs text-muted-foreground">No ads yet</p>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Links */}
            <Collapsible open={linksOpen} onOpenChange={setLinksOpen}>
              <div className="border rounded-lg">
                <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                  <CollapsibleTrigger className="flex items-center gap-2 flex-1">
                    <ChevronDown className={`h-4 w-4 transition-transform ${linksOpen ? "" : "-rotate-90"}`} />
                    <Link2 className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">Links</span>
                    <Badge variant="secondary" className="ml-auto">{links.length}</Badge>
                  </CollapsibleTrigger>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <CollapsibleContent>
                  <div className="p-3 pt-0 space-y-2">
                    {links.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-sm truncate">{item.link_name || item.base_url}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAsset("link", item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {links.length === 0 && (
                      <p className="text-xs text-muted-foreground">No links yet</p>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>
        </div>

        {/* Actions are handled by Drawer footer */}
      </div>

      {/* All the "New" drawers */}
      {campaign && (
        <>
          <NewBrandMessagingDrawer
            open={showBrandDrawer}
            onClose={() => setShowBrandDrawer(false)}
            onSuccess={() => {
              setShowBrandDrawer(false);
              fetchAssets();
            }}
            campaignId={campaign.id}
          />

          <NewEmailMessagingDrawer
            open={showEmailDrawer}
            onClose={() => setShowEmailDrawer(false)}
            onSuccess={() => {
              setShowEmailDrawer(false);
              fetchAssets();
            }}
            campaignId={campaign.id}
          />

          <NewAdMessagingDrawer
            open={showAdMessagingDrawer}
            onClose={() => setShowAdMessagingDrawer(false)}
            onSuccess={() => {
              setShowAdMessagingDrawer(false);
              fetchAssets();
            }}
            campaignId={campaign.id}
          />

          <NewSocialMessagingDrawer
            open={showSocialDrawer}
            onClose={() => setShowSocialDrawer(false)}
            onSuccess={() => {
              setShowSocialDrawer(false);
              fetchAssets();
            }}
            campaignId={campaign.id}
          />

          <NewCreativeDrawer
            open={showCreativeDrawer}
            onClose={() => setShowCreativeDrawer(false)}
            onSuccess={() => {
              setShowCreativeDrawer(false);
              fetchAssets();
            }}
            campaignId={campaign.id}
          />

          <NewLandingPageDrawer
            open={showLandingPageDrawer}
            onClose={() => setShowLandingPageDrawer(false)}
            onSuccess={() => {
              setShowLandingPageDrawer(false);
              fetchAssets();
            }}
            campaignId={campaign.id}
          />

          <NewAdDrawer
            open={showAdDrawer}
            onClose={() => setShowAdDrawer(false)}
            onSuccess={() => {
              setShowAdDrawer(false);
              fetchAssets();
            }}
            campaignId={campaign.id}
          />
        </>
      )}
    </DrawerLarge>
  );
}
