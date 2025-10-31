import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DrawerPanel } from "@/components/ui/DrawerPanel";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { showSuccess, showError } from "@/lib/toast-helpers";
import { X, ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { CreativePickerModal } from "./CreativePickerModal";
import { NewCreativeDrawer } from "./NewCreativeDrawer";
import { buildUTMUrl } from "@/lib/utm-helpers";

interface EditAdDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  ad: {
    id: string;
    campaign_id: string;
    campaign?: string;
    messaging_id: string | null;
    headline_index: number;
    body_copy_index: number;
    cta_index: number;
    audience_type: string;
    ad_format: string;
    version: string;
    landing_page_id: string | null;
    landing_page_url: string;
    status: string;
    platform: string | null;
    ad_name: string | null;
    ad_set_name: string | null;
    display_link?: string | null;
    objective?: string | null;
    campaign_budget?: number | null;
    start_time?: string | null;
    attached_creatives?: any[];
  } | null;
}

interface MessagingRecord {
  id: string;
  messaging_type: string;
  headlines: string[];
  body_copy: string[];
  ctas: string[];
  notes: string | null;
}

interface LandingPage {
  id: string;
  url: string;
  name: string | null;
}

export function EditAdDrawer({
  open,
  onClose,
  onSuccess,
  ad
}: EditAdDrawerProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [showCreativePicker, setShowCreativePicker] = useState(false);
  const [showCreateCreative, setShowCreateCreative] = useState(false);
  
  // Data lists
  const [campaigns, setCampaigns] = useState<string[]>([]);
  const [audienceTypes, setAudienceTypes] = useState<string[]>([]);
  const [messagingRecords, setMessagingRecords] = useState<MessagingRecord[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  
  // Form fields
  const [status, setStatus] = useState("Draft");
  const [campaign, setCampaign] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [audienceType, setAudienceType] = useState("");
  const [selectedCreatives, setSelectedCreatives] = useState<any[]>([]);
  
  const [messagingId, setMessagingId] = useState("");
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [bodyIndex, setBodyIndex] = useState(0);
  const [ctaIndex, setCtaIndex] = useState(0);
  const [selectedMessaging, setSelectedMessaging] = useState<MessagingRecord | null>(null);
  
  const [landingPageId, setLandingPageId] = useState("");
  const [displayLink, setDisplayLink] = useState("");
  const [source, setSource] = useState("Meta");
  const [medium, setMedium] = useState("paid_social");
  
  const [adSetName, setAdSetName] = useState("");
  const [objective, setObjective] = useState("");
  const [campaignBudget, setCampaignBudget] = useState("");
  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  
  const [generatedAdName, setGeneratedAdName] = useState("");
  const [generatedAdSetName, setGeneratedAdSetName] = useState("");
  const [generatedUtmUrl, setGeneratedUtmUrl] = useState("");

  // Pre-fill form when ad loads
  useEffect(() => {
    if (open && ad && user) {
      console.log('[EditAdDrawer] Pre-filling form with ad:', ad.id);
      
      // Step 1 fields
      setStatus(ad.status || "Draft");
      setCampaignId(ad.campaign_id);
      setCampaign(ad.campaign || "");
      setAudienceType(ad.audience_type);
      setSource(ad.platform || "Meta");
      
      // Messaging fields
      setMessagingId(ad.messaging_id || "");
      setHeadlineIndex(ad.headline_index || 0);
      setBodyIndex(ad.body_copy_index || 0);
      setCtaIndex(ad.cta_index || 0);
      
      // Step 2 fields
      setLandingPageId(ad.landing_page_id || "");
      setDisplayLink(ad.display_link || "");
      
      // Meta export fields
      setAdSetName(ad.ad_set_name || "");
      setObjective(ad.objective || "");
      setCampaignBudget(ad.campaign_budget ? ad.campaign_budget.toString() : "");
      setStartTime(ad.start_time ? new Date(ad.start_time) : undefined);
      
      // Ad name
      setGeneratedAdName(ad.ad_name || "");
      setGeneratedAdSetName(ad.ad_set_name || "");
      
      // Creatives
      if (ad.attached_creatives && ad.attached_creatives.length > 0) {
        setSelectedCreatives(ad.attached_creatives);
      }
      
      // Load data
      fetchCampaigns();
      fetchAudienceTypes();
      fetchLandingPages();
      if (ad.campaign) {
        loadMessagingForCampaign(ad.campaign);
      }
    }
  }, [open, ad, user]);

  // Update selected messaging when messagingId changes
  useEffect(() => {
    if (messagingId) {
      const selected = messagingRecords.find(m => m.id === messagingId);
      setSelectedMessaging(selected || null);
    } else {
      setSelectedMessaging(null);
    }
  }, [messagingId, messagingRecords]);

  // Auto-set medium based on source
  useEffect(() => {
    const mediumMapping: Record<string, string> = {
      "Meta": "paid_social",
      "LinkedIn": "paid_social",
      "Google": "cpc",
      "TikTok": "paid_social",
      "YouTube": "paid_video"
    };
    const defaultMedium = mediumMapping[source];
    if (defaultMedium) {
      setMedium(defaultMedium);
    }
  }, [source]);

  // Generate UTM URL
  useEffect(() => {
    if (landingPageId && campaign) {
      const selectedLp = landingPages.find(lp => lp.id === landingPageId);
      if (selectedLp) {
        const url = buildUTMUrl(
          selectedLp.url,
          source,
          medium,
          campaign,
          generatedAdName
        );
        setGeneratedUtmUrl(url);
      }
    }
  }, [landingPageId, source, medium, campaign, generatedAdName, landingPages]);

  const fetchCampaigns = async () => {
    try {
      const { data } = await supabase
        .from("campaigns")
        .select("id, name")
        .eq("user_id", user!.id)
        .order("name");
      
      setCampaigns(data?.map(c => c.name) || []);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  const fetchAudienceTypes = async () => {
    try {
      const { data } = await supabase
        .from("ads")
        .select("audience_type")
        .eq("user_id", user!.id);
      
      const unique = Array.from(
        new Set(data?.map((ad: any) => ad.audience_type).filter(Boolean))
      ) as string[];
      
      setAudienceTypes(unique);
    } catch (error) {
      console.error("Error fetching audience types:", error);
    }
  };

  const fetchLandingPages = async () => {
    try {
      const { data } = await supabase
        .from("landing_pages")
        .select("*")
        .eq("user_id", user!.id)
        .order("name");
      
      setLandingPages(data || []);
    } catch (error) {
      console.error("Error fetching landing pages:", error);
    }
  };

  const loadMessagingForCampaign = async (campaignName: string) => {
    try {
      const { data: campaignData } = await supabase
        .from("campaigns")
        .select("id")
        .eq("name", campaignName)
        .eq("user_id", user!.id)
        .single();

      if (!campaignData) return;

      const { data, error } = await supabase
        .from("campaign_messaging")
        .select(`
          messaging (
            id,
            messaging_type,
            headlines,
            body_copy,
            ctas,
            notes
          )
        `)
        .eq("campaign_id", campaignData.id);

      if (error) throw error;

      const adMessaging = data
        ?.map(item => item.messaging)
        .filter(m => m && m.messaging_type === "Ad") as MessagingRecord[];

      setMessagingRecords(adMessaging || []);
    } catch (error: any) {
      console.error("Error loading messaging:", error);
    }
  };

  const getCreativeType = (): string => {
    if (selectedCreatives.length === 0) return "single_image";
    if (selectedCreatives.length === 1) {
      return selectedCreatives[0].creative_format === "Carousel" ? "carousel" : "single_image";
    }
    return "carousel";
  };

  const handleSave = async () => {
    if (!landingPageId) {
      showError("Landing page is required");
      return;
    }

    if (!messagingId) {
      showError("Please select messaging");
      return;
    }

    if (selectedCreatives.length === 0) {
      showError("Please select at least one creative");
      return;
    }

    if (!ad) return;

    setLoading(true);
    try {
      const selectedLandingPage = landingPages.find(lp => lp.id === landingPageId);
      const creativeType = getCreativeType();
      
      const slugifiedAdName = generatedAdName.toLowerCase().replace(/\s*\|\s*/g, '_').replace(/\s+/g, '_');
      const landingPageUrlWithUtm = buildUTMUrl(
        selectedLandingPage?.url || "",
        source,
        medium,
        campaign,
        slugifiedAdName
      );
      
      // Update ad
      const { error } = await supabase
        .from("ads")
        .update({
          messaging_id: messagingId,
          headline_index: headlineIndex,
          body_copy_index: bodyIndex,
          cta_index: ctaIndex,
          audience_type: audienceType,
          ad_format: creativeType,
          version: ad.version,
          landing_page_id: landingPageId,
          landing_page_url: selectedLandingPage?.url || "",
          landing_page_url_with_utm: landingPageUrlWithUtm,
          display_link: displayLink || null,
          platform: source,
          status,
          ad_name: generatedAdName,
          ad_set_name: adSetName || generatedAdSetName,
          objective: objective || null,
          campaign_budget: campaignBudget ? parseFloat(campaignBudget) : null,
          start_time: startTime?.toISOString() || null
        } as any)
        .eq("id", ad.id)
        .eq("user_id", user!.id);

      if (error) throw error;

      // Update ad-creative relationships
      await supabase.from("ad_creatives").delete().eq("ad_id", ad.id);
      
      if (selectedCreatives.length > 0) {
        const adCreatives = selectedCreatives.map((creative, index) => ({
          ad_id: ad.id,
          creative_id: creative.id,
          position: index
        }));
        await supabase.from("ad_creatives").insert(adCreatives);
      }

      showSuccess("Ad updated successfully");
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      showError(error.message || "Failed to update ad");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!campaign) {
      showError("Please select a campaign");
      return;
    }
    if (!audienceType) {
      showError("Please select an audience type");
      return;
    }
    if (selectedCreatives.length === 0) {
      showError("Please select at least one creative");
      return;
    }
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleClose = () => {
    setCurrentStep(1);
    onClose();
  };

  if (!open || !ad) return null;

  return (
    <DrawerPanel
      open={open}
      onOpenChange={(isOpen) => !isOpen && handleClose()}
      title={currentStep === 1 ? "Edit Ad - Step 1 of 2" : "Edit Ad - Step 2 of 2"}
      size="lg"
    >
      {currentStep === 1 ? (
        <div className="space-y-6 p-6">
          {/* Campaign (read-only) */}
          <div className="space-y-2">
            <Label>Campaign</Label>
            <Input value={campaign} disabled className="bg-muted" />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Audience Type */}
          <div className="space-y-2">
            <Label>Audience Type *</Label>
            <Select value={audienceType} onValueChange={setAudienceType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {audienceTypes.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Creatives */}
          <div className="space-y-2">
            <Label>Creatives * ({selectedCreatives.length} selected)</Label>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreativePicker(true)}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Select Creatives
            </Button>
            {selectedCreatives.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {selectedCreatives.map((creative) => (
                  <div key={creative.id} className="relative">
                    <img
                      src={creative.image_urls?.[0]}
                      alt={creative.name}
                      className="w-full aspect-square object-cover rounded"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1"
                      onClick={() => setSelectedCreatives(
                        selectedCreatives.filter(c => c.id !== creative.id)
                      )}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meta Export Fields */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium">Meta Export Options (Optional)</h3>
            <div className="space-y-2">
              <Label>Ad Set Name</Label>
              <Input
                value={adSetName}
                onChange={(e) => setAdSetName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Objective</Label>
              <Input
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <div />
            <Button onClick={handleNext}>
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 p-6">
          {/* Messaging Selection */}
          <div className="space-y-2">
            <Label>Messaging *</Label>
            <Select value={messagingId} onValueChange={setMessagingId}>
              <SelectTrigger>
                <SelectValue placeholder="Select messaging" />
              </SelectTrigger>
              <SelectContent>
                {messagingRecords.map((msg) => (
                  <SelectItem key={msg.id} value={msg.id}>
                    {msg.notes || `Ad Messaging ${msg.id.slice(0, 8)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Show messaging content selection */}
          {selectedMessaging && (
            <div className="space-y-4 p-4 border rounded-sm bg-muted/50">
              {/* Headline */}
              {selectedMessaging.headlines.length > 0 && (
                <div className="space-y-2">
                  <Label>Headline *</Label>
                  <Select 
                    value={headlineIndex.toString()} 
                    onValueChange={(v) => setHeadlineIndex(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedMessaging.headlines.map((h, i) => (
                        <SelectItem key={i} value={i.toString()}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Body */}
              {selectedMessaging.body_copy.length > 0 && (
                <div className="space-y-2">
                  <Label>Body *</Label>
                  <Select 
                    value={bodyIndex.toString()} 
                    onValueChange={(v) => setBodyIndex(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedMessaging.body_copy.map((b, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {b.length > 50 ? b.substring(0, 50) + '...' : b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* CTA */}
              {selectedMessaging.ctas.length > 0 && (
                <div className="space-y-2">
                  <Label>Call-to-Action *</Label>
                  <Select 
                    value={ctaIndex.toString()} 
                    onValueChange={(v) => setCtaIndex(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedMessaging.ctas.map((c, i) => (
                        <SelectItem key={i} value={i.toString()}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Landing Page */}
          <div className="space-y-2">
            <Label>Landing Page *</Label>
            <Select value={landingPageId} onValueChange={setLandingPageId}>
              <SelectTrigger>
                <SelectValue placeholder="Select landing page" />
              </SelectTrigger>
              <SelectContent>
                {landingPages.map((lp) => (
                  <SelectItem key={lp.id} value={lp.id}>
                    {lp.name || lp.url}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Display Link */}
          <div className="space-y-2">
            <Label>Display Link (Optional)</Label>
            <Input
              value={displayLink}
              onChange={(e) => setDisplayLink(e.target.value)}
              placeholder="e.g., www.yoursite.com"
            />
          </div>

          {/* Generated UTM URL */}
          {generatedUtmUrl && (
            <div className="space-y-2">
              <Label>Generated UTM URL</Label>
              <Input value={generatedUtmUrl} readOnly className="bg-muted" />
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreativePickerModal
        open={showCreativePicker}
        onClose={() => setShowCreativePicker(false)}
        onSelect={(creatives) => {
          setSelectedCreatives(creatives);
          setShowCreativePicker(false);
        }}
        selectedCreatives={selectedCreatives}
      />

      <NewCreativeDrawer
        open={showCreateCreative}
        onClose={() => setShowCreateCreative(false)}
        onSuccess={() => setShowCreateCreative(false)}
      />
    </DrawerPanel>
  );
}
