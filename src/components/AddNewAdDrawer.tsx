import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DrawerPanel } from "@/components/ui/DrawerPanel";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { X, ArrowLeft, ArrowRight, Image as ImageIcon, Plus, CalendarIcon } from "lucide-react";
import { CreativePickerModal } from "./CreativePickerModal";
import { AddNewCreativeDrawer } from "./AddNewCreativeDrawer";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { buildUTMUrl } from "@/lib/utm-helpers";

interface AddNewAdDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (ad?: any) => void;
  contextCampaign?: string;
}

interface Message {
  id: string;
  campaign: string;
  headline: string | null;
  primary_text: string | null;
}

interface LandingPage {
  id: string;
  url: string;
  name: string | null;
  campaigns: string[] | null;
}

export function AddNewAdDrawer({
  open,
  onClose,
  onSuccess,
  contextCampaign
}: AddNewAdDrawerProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [showCreativePicker, setShowCreativePicker] = useState(false);
  const [showCreateCreative, setShowCreateCreative] = useState(false);
  
  // Data lists
  const [campaigns, setCampaigns] = useState<string[]>([]);
  const [audienceTypes, setAudienceTypes] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>(["Meta", "LinkedIn", "Google", "TikTok", "YouTube"]);
  const [mediums, setMediums] = useState<string[]>(["paid_social", "cpc", "paid_video", "display", "organic", "email"]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  
  // Step 1 fields
  const [status, setStatus] = useState("Draft");
  const [campaign, setCampaign] = useState(contextCampaign || "");
  const [campaignId, setCampaignId] = useState("");
  const [audienceType, setAudienceType] = useState("");
  const [selectedCreatives, setSelectedCreatives] = useState<any[]>([]);
  
  // Step 1 fields - Meta export
  const [adSetName, setAdSetName] = useState("");
  const [objective, setObjective] = useState("");
  const [campaignBudget, setCampaignBudget] = useState("");
  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [ageMax, setAgeMax] = useState("64");
  
  // Step 2 fields
  const [headline, setHeadline] = useState("");
  const [primaryText, setPrimaryText] = useState("");
  const [landingPageId, setLandingPageId] = useState("");
  const [displayLink, setDisplayLink] = useState("");
  const [source, setSource] = useState("Meta"); // Default to Meta
  const [medium, setMedium] = useState("paid_social"); // Default to paid_social
  const [cta, setCta] = useState("");
  const [showCustomSource, setShowCustomSource] = useState(false);
  const [customSource, setCustomSource] = useState("");
  const [showCustomMedium, setShowCustomMedium] = useState(false);
  const [customMedium, setCustomMedium] = useState("");
  const [showCustomAudience, setShowCustomAudience] = useState(false);
  const [customAudience, setCustomAudience] = useState("");
  
  // Generated/computed values
  const [generatedAdName, setGeneratedAdName] = useState("");
  const [generatedAdSetName, setGeneratedAdSetName] = useState("");
  const [generatedUtmUrl, setGeneratedUtmUrl] = useState("");

  // CTA options per platform
  const ctaOptions: Record<string, string[]> = {
    "Meta": [
      "Book Now",
      "Contact Us",
      "Download",
      "Get Offer",
      "Learn More",
      "Shop Now",
      "Sign Up"
    ],
    "LinkedIn": [
      "Learn More",
      "Visit Website",
      "Register Now",
      "Sign Up",
      "Download",
      "Apply Now"
    ],
    "Google": [
      "Learn More",
      "Get Quote",
      "Subscribe",
      "Book Now",
      "Download",
      "Contact Us"
    ],
    "TikTok": [
      "Learn More",
      "Shop Now",
      "Sign Up",
      "Download Now",
      "Contact Us"
    ],
    "YouTube": [
      "Learn More",
      "Book Now",
      "Get Quote",
      "Subscribe"
    ]
  };

  // Medium mapping per platform
  const mediumMapping: Record<string, string> = {
    "Meta": "paid_social",
    "LinkedIn": "paid_social",
    "Google": "cpc",
    "TikTok": "paid_social",
    "YouTube": "paid_video"
  };

  // Get filtered CTAs based on source
  const availableCtAs = ctaOptions[source] || [];
  
  // Get medium based on source
  const getMediumForSource = (sourceValue: string) => {
    return mediumMapping[sourceValue] || "paid_social";
  };

  // Fetch data when drawer opens
  useEffect(() => {
    if (open && user) {
      fetchCampaigns();
      fetchAudienceTypes();
      fetchSources();
      fetchMediums();
      fetchMessages();
      fetchLandingPages();
      if (contextCampaign) {
        setCampaign(contextCampaign);
      }
    }
  }, [open, user, contextCampaign]);

  const fetchCampaigns = async () => {
    try {
      const { data } = await supabase
        .from("campaigns")
        .select("id, name")
        .eq("user_id", user!.id)
        .order("name");
      
      // Store campaigns with IDs for lookup
      setCampaigns(data?.map(c => c.name) || []);
      
      // If contextCampaign is set, find its ID
      if (contextCampaign && data) {
        const matchingCampaign = data.find(c => c.name === contextCampaign);
        if (matchingCampaign) {
          setCampaignId(matchingCampaign.id);
        }
      }
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
        new Set(data?.map(a => a.audience_type).filter(Boolean))
      ).sort() as string[];
      setAudienceTypes(unique);
    } catch (error) {
      console.error("Error fetching audience types:", error);
    }
  };

  const fetchSources = async () => {
    try {
      const { data } = await supabase
        .from("ads")
        .select("source")
        .eq("user_id", user!.id);
      
      const customSources = Array.from(
        new Set(data?.map(a => a.source).filter(Boolean))
      ).sort() as string[];
      
      // Merge predefined with custom sources
      const allSources = Array.from(new Set([
        "Meta", "LinkedIn", "Google", "TikTok", "YouTube",
        ...customSources
      ]));
      setSources(allSources);
    } catch (error) {
      console.error("Error fetching sources:", error);
    }
  };

  const fetchMediums = async () => {
    try {
      const { data } = await supabase
        .from("ads")
        .select("medium")
        .eq("user_id", user!.id);
      
      const customMediums = Array.from(
        new Set(data?.map(a => a.medium).filter(Boolean))
      ).sort() as string[];
      
      // Merge predefined with custom mediums
      const allMediums = Array.from(new Set([
        "paid_social", "cpc", "paid_video", "display", "organic", "email",
        ...customMediums
      ]));
      setMediums(allMediums);
    } catch (error) {
      console.error("Error fetching mediums:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data } = await supabase
        .from("campaigns")
        .select("id, name, messaging")
        .eq("user_id", user!.id);
      
      // Transform the data to extract headlines and primary texts from the messaging JSONB
      const transformedMessages: Message[] = [];
      
      data?.forEach(campaign => {
        const messaging = campaign.messaging as any;
        const adMessaging = messaging?.adMessaging || {};
        
        // Add headlines
        (adMessaging.headlines || []).forEach((headline: string, index: number) => {
          if (headline) {
            transformedMessages.push({
              id: `${campaign.id}-h-${index}`,
              campaign: campaign.name,
              headline: headline,
              primary_text: null
            });
          }
        });
        
        // Add primary texts
        (adMessaging.primaryTexts || []).forEach((primaryText: string, index: number) => {
          if (primaryText) {
            transformedMessages.push({
              id: `${campaign.id}-pt-${index}`,
              campaign: campaign.name,
              headline: null,
              primary_text: primaryText
            });
          }
        });
      });
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchLandingPages = async () => {
    try {
      const { data } = await supabase
        .from("landing_pages")
        .select("id, url, name, campaigns")
        .eq("user_id", user!.id);
      
      setLandingPages(data || []);
    } catch (error) {
      console.error("Error fetching landing pages:", error);
    }
  };

  // Auto-generated values
  const getAdSetName = () => {
    if (!campaign || !audienceType) return "";
    return `${campaign} | ${audienceType}`;
  };

  const getCreativeType = () => {
    // Determine format based on attached creatives
    if (selectedCreatives.length === 0) {
      return "single_image";
    }
    
    if (selectedCreatives.length > 1) {
      return "carousel";
    }
    
    const creativeType = selectedCreatives[0].creative_type;
    if (creativeType === "Image") {
      return "single_image";
    } else if (creativeType === "Video") {
      return "video";
    }
    
    return "single_image";
  };

  const slugify = (text: string) => {
    // First replace " | " pattern to preserve the pipe delimiter, then replace remaining spaces
    return text.toLowerCase().replace(/\s*\|\s*/g, '_|_').replace(/\s+/g, '_');
  };

  const getNextVersion = async () => {
    if (!campaign || !audienceType || !user) return 1;
    
    const creativeType = getCreativeType();
    
    try {
      const { data, error } = await supabase
        .from("ads")
        .select("version")
        .eq("user_id", user.id)
        .eq("campaign_id", campaignId)
        .eq("audience_type", audienceType)
        .eq("ad_format", creativeType)
        .order("version", { ascending: false })
        .limit(1);
      
      if (error) {
        console.error("Error fetching version:", error);
        return 1;
      }
      
      if (!data || data.length === 0) return 1;
      
      const latestVersion = parseInt(data[0].version) || 0;
      return latestVersion + 1;
    } catch (error) {
      console.error("Error in getNextVersion:", error);
      return 1;
    }
  };

  // Update generated names when dependencies change
  useEffect(() => {
    const updateGeneratedValues = async () => {
      if (!campaign || !audienceType) {
        setGeneratedAdName("");
        setGeneratedAdSetName("");
        setGeneratedUtmUrl("");
        return;
      }

      const adSetNameValue = getAdSetName();
      setGeneratedAdSetName(adSetNameValue);
      
      // Auto-populate Ad Set Name if it's empty
      if (!adSetName) {
        setAdSetName(adSetNameValue);
      }

      const creativeType = getCreativeType();
      const version = await getNextVersion();
      const adName = `${campaign} | ${audienceType} | Page Post Ad | v${version}`;
      setGeneratedAdName(adName);

      // Generate UTM URL if landing page is selected
      if (landingPageId && source && medium) {
        const selectedLandingPage = landingPages.find(lp => lp.id === landingPageId);
        if (selectedLandingPage) {
          const baseUrl = selectedLandingPage.url;
          const separator = baseUrl.includes('?') ? '&' : '?';
          
          const params = new URLSearchParams({
            utm_source: slugify(source),
            utm_medium: slugify(medium),
            utm_campaign: slugify(campaign),
            utm_audience: slugify(audienceType),
            utm_content: creativeType,
            utm_version: `v${version}`
          });

          setGeneratedUtmUrl(`${baseUrl}${separator}${params.toString()}`);
        }
      } else {
        setGeneratedUtmUrl("");
      }
    };

    updateGeneratedValues();
  }, [campaign, audienceType, selectedCreatives, landingPageId, source, medium, user, landingPages, adSetName]);

  // Auto-generate display link when landing page changes
  useEffect(() => {
    if (landingPageId) {
      const selectedLandingPage = landingPages.find(lp => lp.id === landingPageId);
      if (selectedLandingPage?.url) {
        try {
          const url = new URL(selectedLandingPage.url);
          const domain = url.hostname.replace(/^www\./, ''); // Remove www. prefix
          setDisplayLink(`www.${domain}`);
        } catch (error) {
          // If URL parsing fails, just use the domain part
          const domain = selectedLandingPage.url.split('/')[2] || selectedLandingPage.url;
          setDisplayLink(domain.replace(/^www\./, ''));
        }
      }
    } else {
      setDisplayLink("");
    }
  }, [landingPageId, landingPages]);

  // Add new headline/primary text states
  const [showAddHeadline, setShowAddHeadline] = useState(false);
  const [showAddPrimaryText, setShowAddPrimaryText] = useState(false);
  const [newHeadlineText, setNewHeadlineText] = useState("");
  const [newPrimaryTextText, setNewPrimaryTextText] = useState("");
  const [isAddingHeadline, setIsAddingHeadline] = useState(false);
  const [isAddingPrimaryText, setIsAddingPrimaryText] = useState(false);

  // Filtered messages by campaign (remove duplicates)
  const filteredHeadlines = messages
    .filter(m => m.campaign === campaign && m.headline)
    .map(m => ({ id: m.id, value: m.headline! }))
    .filter((h, index, self) => 
      index === self.findIndex(t => t.value === h.value)
    );
  
  const filteredPrimaryTexts = messages
    .filter(m => m.campaign === campaign && m.primary_text)
    .map(m => ({ id: m.id, value: m.primary_text! }))
    .filter((pt, index, self) => 
      index === self.findIndex(t => t.value === pt.value)
    );

  // Handle adding new headline
  const handleAddNewHeadline = async () => {
    if (!newHeadlineText.trim()) {
      toast.error("Headline cannot be empty");
      return;
    }

    // Check for duplicates
    const exists = filteredHeadlines.some(h => h.value === newHeadlineText.trim());
    if (exists) {
      toast.error("This headline already exists in the campaign");
      setNewHeadlineText("");
      setShowAddHeadline(false);
      return;
    }

    setIsAddingHeadline(true);
    try {
      // Get the current campaign's messaging data
      const { data: campaignData, error: fetchError } = await supabase
        .from("campaigns")
        .select("id, messaging")
        .eq("name", campaign)
        .eq("user_id", user!.id)
        .single();

      if (fetchError) throw fetchError;

      const currentMessaging = campaignData.messaging as any || {};
      const adMessaging = currentMessaging.adMessaging || { headlines: [], primaryTexts: [] };
      
      // Add the new headline
      const updatedMessaging = {
        ...currentMessaging,
        adMessaging: {
          ...adMessaging,
          headlines: [...(adMessaging.headlines || []), newHeadlineText.trim()]
        }
      };

      const { error } = await supabase
        .from("campaigns")
        .update({ messaging: updatedMessaging })
        .eq("id", campaignData.id);

      if (error) throw error;

      toast.success("New headline added to campaign");
      
      // Refresh messages
      await fetchMessages();
      
      // Select the new headline
      setHeadline(newHeadlineText.trim());
      setNewHeadlineText("");
      setShowAddHeadline(false);
    } catch (error: any) {
      toast.error(error.message || "Couldn't add headline. Please try again.");
    } finally {
      setIsAddingHeadline(false);
    }
  };

  // Handle adding new primary text
  const handleAddNewPrimaryText = async () => {
    if (!newPrimaryTextText.trim()) {
      toast.error("Body cannot be empty");
      return;
    }

    // Check for duplicates
    const exists = filteredPrimaryTexts.some(pt => pt.value === newPrimaryTextText.trim());
    if (exists) {
      toast.error("This body text already exists in the campaign");
      setNewPrimaryTextText("");
      setShowAddPrimaryText(false);
      return;
    }

    setIsAddingPrimaryText(true);
    try {
      // Get the current campaign's messaging data
      const { data: campaignData, error: fetchError } = await supabase
        .from("campaigns")
        .select("id, messaging")
        .eq("name", campaign)
        .eq("user_id", user!.id)
        .single();

      if (fetchError) throw fetchError;

      const currentMessaging = campaignData.messaging as any || {};
      const adMessaging = currentMessaging.adMessaging || { headlines: [], primaryTexts: [] };
      
      // Add the new primary text
      const updatedMessaging = {
        ...currentMessaging,
        adMessaging: {
          ...adMessaging,
          primaryTexts: [...(adMessaging.primaryTexts || []), newPrimaryTextText.trim()]
        }
      };

      const { error } = await supabase
        .from("campaigns")
        .update({ messaging: updatedMessaging })
        .eq("id", campaignData.id);

      if (error) throw error;

      toast.success("New body text added to campaign");
      
      // Refresh messages
      await fetchMessages();
      
      // Select the new primary text
      setPrimaryText(newPrimaryTextText.trim());
      setNewPrimaryTextText("");
      setShowAddPrimaryText(false);
    } catch (error: any) {
      toast.error(error.message || "Couldn't add body text. Please try again.");
    } finally {
      setIsAddingPrimaryText(false);
    }
  };

  // State for filtered landing pages
  const [filteredLandingPages, setFilteredLandingPages] = useState<LandingPage[]>([]);

  // Filter landing pages by campaign
  useEffect(() => {
    const filterLandingPages = () => {
      if (!campaign) {
        setFilteredLandingPages(landingPages);
        return;
      }
      
      // Filter landing pages by checking if the campaign name is in their campaigns array
      const filtered = landingPages.filter(lp => 
        lp.campaigns && lp.campaigns.includes(campaign)
      );
      setFilteredLandingPages(filtered);
    };
    
    filterLandingPages();
  }, [campaign, landingPages]);

  const handleNext = () => {
    if (!campaign.trim()) {
      toast.error("Campaign is required");
      return;
    }
    if (!source.trim()) {
      toast.error("Source is required");
      return;
    }
    if (!medium.trim()) {
      toast.error("Medium is required");
      return;
    }
    if (!audienceType.trim()) {
      toast.error("Audience type is required");
      return;
    }
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSave = async () => {
    if (!landingPageId) {
      toast.error("Landing page is required");
      return;
    }

    setLoading(true);
    try {
      const selectedLandingPage = landingPages.find(lp => lp.id === landingPageId);
      const creativeType = getCreativeType();
      const version = await getNextVersion();
      
      // Use adSetName or generate default if empty
      const finalAdSetName = adSetName.trim() || generatedAdSetName;
      
      // Get campaign ID from name
      const { data: campaignData } = await supabase
        .from("campaigns")
        .select("id")
        .eq("name", campaign)
        .eq("user_id", user!.id)
        .single();

      if (!campaignData) {
        throw new Error("Campaign not found");
      }

      // Build UTM URL with all parameters
      const landingPageUrlWithUtm = buildUTMUrl(
        selectedLandingPage?.url || "",
        source,
        medium,
        campaign,
        generatedAdName // Use ad name as utm_content
      );

      const { data, error } = await supabase.from("ads").insert({
        campaign_id: campaignData.id,
        audience_type: audienceType,
        ad_format: creativeType,
        creative_type: "Page Post Ad",
        version: version.toString(),
        landing_page_url: selectedLandingPage?.url || "",
        landing_page_id: landingPageId,
        landing_page_url_with_utm: landingPageUrlWithUtm,
        display_link: displayLink || null,
        status,
        headline: headline || null,
        body: primaryText || null,
        medium: medium || null,
        source: source || null,
        cta_label: cta || null,
        user_id: user!.id,
        ad_name: generatedAdName,
        ad_set_name: finalAdSetName,
        objective: objective || null,
        campaign_budget: campaignBudget ? parseFloat(campaignBudget) : null,
        start_time: startTime || null
      } as any).select().single();

      if (error) throw error;

      if (selectedCreatives.length > 0 && data) {
        const adCreatives = selectedCreatives.map((creative, index) => ({
          ad_id: data.id,
          creative_id: creative.id,
          position: index
        }));
        await supabase.from("ad_creatives").insert(adCreatives);
      }

      // Link ad to messaging_matrix campaigns
      const { data: messagingRecords } = await supabase
        .from("messaging_matrix")
        .select("id")
        .eq("user_id", user!.id)
        .eq("campaign", campaign);

      if (messagingRecords && messagingRecords.length > 0 && data) {
        // Link to all messaging_matrix records for this campaign
        for (const messagingRecord of messagingRecords) {
          await supabase.from("messaging_ads").insert({
            messaging_id: messagingRecord.id,
            ad_id: data.id
          });
        }
      }

      toast.success("Ad created successfully");
      resetForm();
      onClose();
      onSuccess?.(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to create ad");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setStatus("Draft");
    setCampaign(contextCampaign || "");
    setAudienceType("");
    setSelectedCreatives([]);
    setHeadline("");
    setPrimaryText("");
    setLandingPageId("");
    setSource("Meta");
    setMedium("paid_social");
    setCta("");
    setAdSetName("");
    setObjective("");
    setCampaignBudget("");
    setStartTime(undefined);
    setAgeMax("64");
    setShowCustomSource(false);
    setCustomSource("");
    setShowCustomMedium(false);
    setCustomMedium("");
    setShowCustomAudience(false);
    setCustomAudience("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <DrawerPanel
        open={open}
        onClose={handleClose}
        title="Create New Ad"
        currentStep={currentStep}
        totalSteps={2}
        hasNestedDrawer={showCreativePicker || showCreateCreative}
        showBack={currentStep === 2}
        showNext={currentStep === 1}
        showSave={currentStep === 2}
        onBack={handleBack}
        onNext={handleNext}
        onSave={handleSave}
        nextDisabled={!campaign.trim() || !source.trim() || !medium.trim() || !audienceType.trim()}
        saveLabel={loading ? "Saving..." : "Save"}
        bodyClassName={currentStep === 2 ? "p-0" : undefined}
        zIndex={1200}
      >
        {currentStep === 1 ? (
          <div className="space-y-2.5 px-3 py-3">
                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="ad-status" className="text-sm font-medium">
                    Status <span className="text-destructive">*</span>
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="ad-status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[1500]">
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Paused">Paused</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Source */}
                <div className="space-y-2">
                  <Label htmlFor="ad-source" className="text-sm font-medium">
                    Source <span className="text-destructive">*</span>
                  </Label>
                  {!showCustomSource ? (
                    <Select
                      value={source}
                      onValueChange={(value) => {
                        if (value === "+Add") {
                          setShowCustomSource(true);
                          setCustomSource("");
                        } else {
                          setSource(value);
                          setMedium(getMediumForSource(value)); // Auto-set medium
                          setCta(""); // Reset CTA when source changes
                        }
                      }}
                    >
                      <SelectTrigger id="ad-source" className="w-full">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent className="z-[1500]">
                        {sources.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                        <SelectItem value="+Add">+ Add</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={customSource}
                        onChange={(e) => setCustomSource(e.target.value)}
                        placeholder="Enter custom source"
                        autoFocus
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          if (customSource.trim()) {
                            const newSource = customSource.trim();
                            setSource(newSource);
                            // Add to sources list if not already there
                            if (!sources.includes(newSource)) {
                              setSources([...sources, newSource].sort());
                            }
                            setMedium(getMediumForSource(newSource)); // Auto-set medium
                            setShowCustomSource(false);
                            setCta(""); // Reset CTA when source changes
                          }
                        }}
                      >
                        Add
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowCustomSource(false);
                          setSource("Meta");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                {/* Medium */}
                <div className="space-y-2">
                  <Label htmlFor="ad-medium" className="text-sm font-medium">
                    Medium <span className="text-destructive">*</span>
                  </Label>
                  {!showCustomMedium ? (
                    <Select
                      value={medium}
                      onValueChange={(value) => {
                        if (value === "+Add") {
                          setShowCustomMedium(true);
                          setCustomMedium("");
                        } else {
                          setMedium(value);
                        }
                      }}
                    >
                      <SelectTrigger id="ad-medium" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[1500]">
                        {mediums.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                        <SelectItem value="+Add">+ Add</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={customMedium}
                        onChange={(e) => setCustomMedium(e.target.value)}
                        placeholder="Enter custom medium"
                        autoFocus
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          if (customMedium.trim()) {
                            const newMedium = customMedium.trim();
                            setMedium(newMedium);
                            // Add to mediums list if not already there
                            if (!mediums.includes(newMedium)) {
                              setMediums([...mediums, newMedium].sort());
                            }
                            setShowCustomMedium(false);
                          }
                        }}
                      >
                        Add
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowCustomMedium(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                {/* Campaign */}
                <div className="space-y-2">
                  <Label htmlFor="ad-campaign" className="text-sm font-medium">
                    Campaign <span className="text-destructive">*</span>
                  </Label>
                  <Select value={campaign} onValueChange={setCampaign}>
                    <SelectTrigger id="ad-campaign" className="w-full">
                      <SelectValue placeholder="Select campaign" />
                    </SelectTrigger>
                    <SelectContent className="z-[1500]">
                      {campaigns.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Audience Type */}
                <div className="space-y-2">
                  <Label htmlFor="ad-audience" className="text-sm font-medium">
                    Audience Type <span className="text-destructive">*</span>
                  </Label>
                  {!showCustomAudience ? (
                    <Select 
                      value={audienceType} 
                      onValueChange={(value) => {
                        if (value === "+Add") {
                          setShowCustomAudience(true);
                          setCustomAudience("");
                        } else {
                          setAudienceType(value);
                        }
                      }}
                    >
                      <SelectTrigger id="ad-audience" className="w-full">
                        <SelectValue placeholder="Select or add new" />
                      </SelectTrigger>
                      <SelectContent className="z-[1500]">
                        <SelectItem value="Retargeting">Retargeting</SelectItem>
                        <SelectItem value="Lookalike">Lookalike</SelectItem>
                        <SelectItem value="Re-engagement">Re-engagement</SelectItem>
                        <SelectItem value="+Add">+ Add</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={customAudience}
                        onChange={(e) => setCustomAudience(e.target.value)}
                        placeholder="Enter custom audience type"
                        autoFocus
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          if (customAudience.trim()) {
                            setAudienceType(customAudience.trim());
                            setShowCustomAudience(false);
                          }
                        }}
                      >
                        Add
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowCustomAudience(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                {/* New Meta Export Fields */}
                <div className="space-y-5">
                  {/* Ad Set Name */}
                  <div className="space-y-2">
                    <Label htmlFor="ad-set-name" className="text-sm font-medium">
                      Ad Set Name
                    </Label>
                    <Input
                      id="ad-set-name"
                      value={adSetName}
                      onChange={(e) => setAdSetName(e.target.value)}
                      placeholder={generatedAdSetName || "Auto-generated if left blank"}
                    />
                  </div>


                </div>

                {/* Attach Creative */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Creative (Optional)</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreativePicker(true)}
                      className="flex-1 justify-start"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Choose from Library
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateCreative(true)}
                      className="flex-1 justify-start"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Upload New
                    </Button>
                  </div>
                  {selectedCreatives.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedCreatives.map((creative) => (
                        <Badge
                          key={creative.id}
                          variant="secondary"
                          className="pr-1"
                        >
                          {creative.creative_name}
                          <button
                            onClick={() => setSelectedCreatives(prev => 
                              prev.filter(c => c.id !== creative.id)
                            )}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full">
                {/* Left: Ad Preview Panel */}
                <div className="w-[45%] bg-muted/30 p-6 border-r overflow-y-auto">
                  <div className="sticky top-0">
                    {/* Ad Card Preview */}
                    <div className="bg-background rounded-sm border shadow-sm overflow-hidden">
                      {/* Sponsored Label */}
                      <div className="px-4 pt-3 pb-2">
                        <p className="text-xs text-muted-foreground font-medium">Sponsored</p>
                      </div>

                      {/* Body (above media) */}
                      {primaryText && (
                        <div className="px-4 pb-3">
                          <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                            {primaryText}
                          </p>
                        </div>
                      )}
                      
                      {/* Creative Preview */}
                      <div className="relative bg-muted flex items-center justify-center min-h-[200px]">
                        {selectedCreatives.length > 0 && selectedCreatives[0].file_url ? (
                          selectedCreatives[0].creative_type === 'Video' ? (
                            <video
                              src={selectedCreatives[0].file_url}
                              className="w-full h-auto max-h-[400px] object-contain"
                              controls
                              loop
                            />
                          ) : (
                            <img
                              src={selectedCreatives[0].file_url}
                              alt={selectedCreatives[0].creative_name}
                              className="w-full h-auto max-h-[400px] object-contain"
                            />
                          )
                        ) : (
                          <div className="text-center p-8">
                            <ImageIcon className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">
                              Creative preview will appear here
                            </p>
                          </div>
                        )}
                        
                        {/* Ad Type Badge */}
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-xs">
                            {getCreativeType()}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Ad Content Below Media */}
                      <div className="p-4 space-y-3">
                        {/* Headline */}
                        {headline && (
                          <h4 className="font-semibold text-base leading-tight">
                            {headline}
                          </h4>
                        )}
                        
                        {/* Landing Page URL */}
                        {landingPageId && (
                          <p className="text-xs text-muted-foreground uppercase tracking-wide truncate">
                            {landingPages.find(lp => lp.id === landingPageId)?.url ? 
                              new URL(landingPages.find(lp => lp.id === landingPageId)!.url).hostname : ''}
                          </p>
                        )}
                        
                        {/* CTA Button */}
                        {cta && (
                          <button className="w-full py-2.5 bg-emerald-500 text-white font-semibold rounded-sm hover:bg-emerald-600 transition-colors text-sm shadow-sm">
                            {cta}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Empty State Helper */}
                    {!headline && !primaryText && (
                      <p className="text-xs text-muted-foreground mt-4 text-center">
                        Fill out the form fields to see your ad preview update in real-time
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Form Fields */}
                <div className="flex-1 overflow-y-auto py-6 px-6 space-y-5">
                {/* Auto-generated Ad Name */}
                <div className="space-y-2">
                  <Label htmlFor="ad-name-generated" className="text-sm font-medium">
                    Ad Name
                  </Label>
                  <Input
                    id="ad-name-generated"
                    value={generatedAdName}
                    readOnly
                    className="bg-muted"
                    placeholder="Auto-generated"
                  />
                </div>

                {/* Headline */}
                <div className="space-y-2">
                  <Label htmlFor="ad-headline" className="text-sm font-medium">
                    Headline <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={headline} 
                    onValueChange={(value) => {
                      if (value === "__add_new__") {
                        setShowAddHeadline(true);
                      } else {
                        setHeadline(value);
                      }
                    }}
                    disabled={!campaign}
                  >
                    <SelectTrigger id="ad-headline" className="w-full">
                      <SelectValue placeholder={campaign ? "Select headline…" : "Select a campaign first"} />
                    </SelectTrigger>
                    <SelectContent className="z-[1500]">
                       {filteredHeadlines.map((h) => (
                        <SelectItem key={h.id} value={h.value}>
                          {h.value}
                        </SelectItem>
                      ))}
                      {filteredHeadlines.length > 0 && (
                        <div className="px-2 py-1.5">
                          <div className="border-t border-border" />
                        </div>
                      )}
                      <SelectItem value="__add_new__" className="text-primary">
                        + Add New Headline
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Add New Headline Dialog */}
                  {showAddHeadline && (
                    <div className="mt-2 p-3 border border-border rounded-sm bg-muted/50">
                      <Label htmlFor="new-headline" className="text-sm font-medium mb-2 block">
                        New Headline
                      </Label>
                      <Input
                        id="new-headline"
                        value={newHeadlineText}
                        onChange={(e) => setNewHeadlineText(e.target.value)}
                        placeholder="Enter headline text…"
                        className="mb-2"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleAddNewHeadline}
                          disabled={isAddingHeadline || !newHeadlineText.trim()}
                        >
                          {isAddingHeadline ? "Adding..." : "Add"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowAddHeadline(false);
                            setNewHeadlineText("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="space-y-2">
                  <Label htmlFor="ad-primary-text" className="text-sm font-medium">
                    Body <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={primaryText} 
                    onValueChange={(value) => {
                      if (value === "__add_new__") {
                        setShowAddPrimaryText(true);
                      } else {
                        setPrimaryText(value);
                      }
                    }}
                    disabled={!campaign}
                  >
                    <SelectTrigger id="ad-primary-text" className="w-full">
                      <SelectValue placeholder={campaign ? "Select body…" : "Select a campaign first"} />
                    </SelectTrigger>
                    <SelectContent className="z-[1500] max-w-md">
                      {filteredPrimaryTexts.map((pt) => (
                        <SelectItem key={pt.id} value={pt.value} className="whitespace-normal h-auto py-2">
                          {pt.value}
                        </SelectItem>
                      ))}
                      {filteredPrimaryTexts.length > 0 && (
                        <div className="px-2 py-1.5">
                          <div className="border-t border-border" />
                        </div>
                      )}
                      <SelectItem value="__add_new__" className="text-primary">
                        + Add New Body Text
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Add New Body Text Dialog */}
                  {showAddPrimaryText && (
                    <div className="mt-2 p-3 border border-border rounded-sm bg-muted/50">
                      <Label htmlFor="new-primary-text" className="text-sm font-medium mb-2 block">
                        New Body Text
                      </Label>
                      <Textarea
                        id="new-primary-text"
                        value={newPrimaryTextText}
                        onChange={(e) => setNewPrimaryTextText(e.target.value)}
                        placeholder="Enter body text…"
                        className="mb-2 min-h-[80px]"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleAddNewPrimaryText}
                          disabled={isAddingPrimaryText || !newPrimaryTextText.trim()}
                        >
                          {isAddingPrimaryText ? "Adding..." : "Add"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowAddPrimaryText(false);
                            setNewPrimaryTextText("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Landing Page URL */}
                <div className="space-y-2">
                  <Label htmlFor="ad-landing-url" className="text-sm font-medium">
                    Destination URL <span className="text-destructive">*</span>
                  </Label>
                  <Select value={landingPageId} onValueChange={setLandingPageId}>
                    <SelectTrigger id="ad-landing-url" className="w-full">
                      <SelectValue placeholder="Select landing page" />
                    </SelectTrigger>
                    <SelectContent className="z-[1500]">
                      {filteredLandingPages.map((lp) => (
                        <SelectItem key={lp.id} value={lp.id}>
                          {lp.name || lp.url}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Display Link */}
                <div className="space-y-2">
                  <Label htmlFor="ad-display-link" className="text-sm font-medium">
                    Display Link
                  </Label>
                  <Input
                    id="ad-display-link"
                    value={displayLink}
                    onChange={(e) => setDisplayLink(e.target.value)}
                    placeholder="www.example.com"
                  />
                </div>

                {/* Call to Action (CTA) */}
                <div className="space-y-2">
                  <Label htmlFor="ad-cta" className="text-sm font-medium">
                    Call to Action (CTA) <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={cta} 
                    onValueChange={setCta}
                    disabled={!source || availableCtAs.length === 0}
                  >
                    <SelectTrigger id="ad-cta" className="w-full">
                      <SelectValue placeholder="Select CTA based on platform" />
                    </SelectTrigger>
                    <SelectContent className="z-[1500]">
                      {availableCtAs.map((ctaOption) => (
                        <SelectItem key={ctaOption} value={ctaOption}>
                          {ctaOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* UTM URL Preview */}
                <div className="space-y-2 pt-4 border-t">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Generated UTM URL
                  </Label>
                  <div className="bg-muted/50 rounded-[5px] p-3 border">
                    {generatedUtmUrl ? (
                      <p className="text-xs font-mono break-all text-foreground/80">
                        {generatedUtmUrl}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Complete the form to see your UTM URL
                      </p>
                    )}
                  </div>
                </div>
                </div>
              </div>
            )}
      </DrawerPanel>

      <CreativePickerModal
        open={showCreativePicker}
        onOpenChange={setShowCreativePicker}
        onSelect={(creatives) => {
          setSelectedCreatives(creatives);
          setShowCreativePicker(false);
        }}
        selectedCampaign={campaign}
        allowMultiple={true}
      />

      <AddNewCreativeDrawer
        open={showCreateCreative}
        onClose={() => setShowCreateCreative(false)}
        onSuccess={async () => {
          // Fetch the newly created creative and attach it
          const { data: newCreatives } = await supabase
            .from("creatives")
            .select("*")
            .eq("campaign", campaign)
            .eq("user_id", user!.id)
            .order("created_at", { ascending: false })
            .limit(1);
          
          if (newCreatives && newCreatives.length > 0) {
            setSelectedCreatives(prev => [...prev, newCreatives[0]]);
          }
          
          setShowCreateCreative(false);
        }}
        contextCampaign={campaign}
      />
    </>
  );
}
