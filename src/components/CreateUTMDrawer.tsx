import { useState, useEffect } from "react";
import { DrawerSmall } from "@/components/shared/DrawerSmall";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, X } from "lucide-react";

interface CreateUTMDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Campaign {
  id: string;
  name: string;
}

interface AdditionalParam {
  key: string;
  value: string;
  locked: boolean;
}

const TEMPLATE_OPTIONS = [
  {
    value: "newsletter",
    label: "Newsletter",
    source: "email",
    medium: "newsletter",
    description: "Links in newsletters or automations"
  },
  {
    value: "social_post",
    label: "Social Post",
    source: "{platform}",
    medium: "organic_social",
    description: "Organic social content"
  },
  {
    value: "bio_link",
    label: "Bio Link",
    source: "{platform}",
    medium: "bio",
    description: "Links in profile or Linktree"
  },
  {
    value: "partner_email",
    label: "Partner Email",
    source: "partner",
    medium: "email",
    description: "Shared in partner's email or newsletter"
  },
  {
    value: "influencer",
    label: "Influencer",
    source: "influencer",
    medium: "referral",
    description: "Influencer mentions or shoutouts"
  },
  {
    value: "event_qr",
    label: "Event / QR",
    source: "event",
    medium: "offline",
    description: "QR codes, posters, or print links"
  }
];

const SOCIAL_PLATFORMS = [
  "linkedin",
  "instagram",
  "facebook",
  "tiktok",
  "youtube"
];

const SOURCE_OPTIONS = [
  "email",
  "website",
  "linkedin",
  "instagram",
  "facebook",
  "partner",
  "influencer",
  "event"
];

const MEDIUM_OPTIONS = [
  "email",
  "newsletter",
  "organic_social",
  "referral",
  "blog",
  "bio",
  "offline",
  "experiment"
];

export function CreateUTMDrawer({ open, onClose, onSuccess }: CreateUTMDrawerProps) {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [additionalParams, setAdditionalParams] = useState<AdditionalParam[]>([]);
  const [showCustomSource, setShowCustomSource] = useState(false);
  const [customSource, setCustomSource] = useState("");
  const [showCustomMedium, setShowCustomMedium] = useState(false);
  const [customMedium, setCustomMedium] = useState("");
  const [urlError, setUrlError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    baseUrl: "",
    source: "",
    medium: "",
    notes: ""
  });

  useEffect(() => {
    if (open && user) {
      fetchCampaigns();
    }
  }, [open, user]);

  const fetchCampaigns = async () => {
    const { data } = await supabase
      .from("campaigns")
      .select("name")
      .eq("user_id", user?.id);
    
    const uniqueCampaigns = Array.from(new Set(data?.map(c => c.name) || [])).sort();
    const campaignObjects = uniqueCampaigns.map(name => ({ id: name, name }));
    setCampaigns(campaignObjects);
  };

  const handleTemplateSelect = (templateValue: string) => {
    if (!templateValue) {
      setSelectedTemplate("");
      return;
    }
    
    setSelectedTemplate(templateValue);
    const template = TEMPLATE_OPTIONS.find(t => t.value === templateValue);
    if (template) {
      setFormData(prev => ({
        ...prev,
        source: template.source,
        medium: template.medium
      }));
      setShowCustomSource(false);
      setCustomSource("");
    }
  };

  const getSourceOptions = () => {
    if (selectedTemplate === "social_post" || selectedTemplate === "bio_link") {
      return SOCIAL_PLATFORMS;
    }
    return SOURCE_OPTIONS;
  };

  const addAdditionalParam = () => {
    setAdditionalParams([...additionalParams, { key: "", value: "", locked: false }]);
  };

  const updateAdditionalParam = (index: number, field: "key" | "value", value: string) => {
    const updated = [...additionalParams];
    updated[index][field] = value;
    setAdditionalParams(updated);
  };

  const lockAdditionalParam = (index: number) => {
    const param = additionalParams[index];
    if (!param.key.trim() || !param.value.trim()) {
      toast({ 
        title: "Validation Error", 
        description: "Please fill in both parameter name and value.",
        variant: "destructive" 
      });
      return;
    }
    const updated = [...additionalParams];
    updated[index].locked = true;
    setAdditionalParams(updated);
  };

  const removeAdditionalParam = (index: number) => {
    setAdditionalParams(additionalParams.filter((_, i) => i !== index));
  };

  const generateUTMUrl = () => {
    if (!formData.baseUrl) return "";
    
    try {
      const url = new URL(formData.baseUrl);
      const params = new URLSearchParams();
      
      if (formData.source) params.append("utm_source", formData.source.toLowerCase().replace(/\s+/g, "_"));
      if (formData.medium) params.append("utm_medium", formData.medium.toLowerCase().replace(/\s+/g, "_"));
      if (selectedCampaigns.length > 0) {
        const campaignName = campaigns.find(c => c.id === selectedCampaigns[0])?.name || "";
        if (campaignName) {
          params.append("utm_campaign", campaignName.toLowerCase().replace(/\s+/g, "_"));
        }
      }
      
      additionalParams.forEach(param => {
        if (param.key && param.value && param.locked) {
          params.append(`utm_${param.key}`, param.value.toLowerCase().replace(/\s+/g, "_"));
        }
      });
      
      return `${url.origin}${url.pathname}${url.search ? url.search + "&" : "?"}${params.toString()}`;
    } catch {
      return "";
    }
  };

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const cleanupUrl = (url: string): string => {
    let cleaned = url.trim();
    
    try {
      const urlObj = new URL(cleaned);
      urlObj.hostname = urlObj.hostname.toLowerCase();
      if (urlObj.pathname === "/") {
        urlObj.pathname = "";
      } else if (urlObj.pathname.endsWith("/")) {
        urlObj.pathname = urlObj.pathname.slice(0, -1);
      }
      return urlObj.toString();
    } catch {
      return cleaned;
    }
  };

  const handleUrlBlur = () => {
    if (formData.baseUrl && !validateUrl(formData.baseUrl)) {
      setUrlError("Please enter a valid URL starting with http:// or https://");
    } else {
      setUrlError("");
    }
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.baseUrl.trim() !== "" &&
      validateUrl(formData.baseUrl) &&
      formData.source.trim() !== "" &&
      formData.medium.trim() !== ""
    );
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ 
        title: "Validation Error", 
        description: "Please enter a name for this UTM link.",
        variant: "destructive" 
      });
      return;
    }

    if (!formData.baseUrl.trim() || !validateUrl(formData.baseUrl)) {
      setUrlError("Please enter a valid URL starting with http:// or https://");
      toast({ 
        title: "Validation Error", 
        description: "Please enter a valid URL (must start with http:// or https://).",
        variant: "destructive" 
      });
      return;
    }

    if (!formData.source.trim()) {
      toast({ 
        title: "Validation Error", 
        description: "Please select or enter a source.",
        variant: "destructive" 
      });
      return;
    }

    if (!formData.medium.trim()) {
      toast({ 
        title: "Validation Error", 
        description: "Please select or enter a medium.",
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);

    const cleanedUrl = cleanupUrl(formData.baseUrl);
    const url = new URL(cleanedUrl);
    const params = new URLSearchParams();
    
    if (formData.source) params.append("utm_source", formData.source.toLowerCase().replace(/\s+/g, "_"));
    if (formData.medium) params.append("utm_medium", formData.medium.toLowerCase().replace(/\s+/g, "_"));
    if (selectedCampaigns.length > 0) {
      const campaignName = campaigns.find(c => c.id === selectedCampaigns[0])?.name || "";
      params.append("utm_campaign", campaignName.toLowerCase().replace(/\s+/g, "_"));
    }
    
    additionalParams.forEach(param => {
      if (param.key && param.value && param.locked) {
        params.append(`utm_${param.key}`, param.value.toLowerCase().replace(/\s+/g, "_"));
      }
    });
    
    const generatedUrl = `${url.origin}${url.pathname}${url.search ? url.search + "&" : "?"}${params.toString()}`;
    
    const linkData = {
      user_id: user?.id,
      link_name: formData.name,
      campaign: selectedCampaigns.length > 0 
        ? campaigns.find(c => c.id === selectedCampaigns[0])?.name || ""
        : "",
      utm_source_manual: formData.source,
      utm_medium_manual: formData.medium,
      source: formData.source,
      medium: formData.medium,
      landing_page_url: cleanedUrl,
      generated_utm_url: generatedUrl,
      notes: formData.notes || null,
      audience: null,
      ad_id: null,
      creative_id: null
    };

    const { error } = await supabase.from("links").insert([linkData]);

    setIsLoading(false);

    if (error) {
      toast({ 
        title: "Error creating UTM URL", 
        description: error.message, 
        variant: "destructive" 
      });
      return;
    }

    toast({ 
      title: "✅ UTM URL created successfully",
      description: "Your UTM link has been added to the list."
    });

    handleClose();
    onSuccess();
  };

  const handleClose = () => {
    setFormData({
      name: "",
      baseUrl: "",
      source: "",
      medium: "",
      notes: ""
    });
    setSelectedTemplate("");
    setSelectedCampaigns([]);
    setAdditionalParams([]);
    setShowCustomSource(false);
    setCustomSource("");
    setShowCustomMedium(false);
    setCustomMedium("");
    setUrlError("");
    onClose();
  };

  return (
    <DrawerSmall
      isOpen={open}
      onClose={handleClose}
      title="Create UTM URL"
      onSave={handleSave}
      saveText="Save"
      isLoading={isLoading}
    >
      <div className="space-y-4">
        {/* Template Selection */}
        <div className="space-y-2">
          <Label htmlFor="template" className="text-sm font-medium">Template (Optional)</Label>
          <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
            <SelectTrigger id="template" className="h-10 rounded-sm">
              <SelectValue placeholder="Start with a template...">
                {selectedTemplate && TEMPLATE_OPTIONS.find(t => t.value === selectedTemplate)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TEMPLATE_OPTIONS.map((template) => (
                <SelectItem key={template.value} value={template.value}>
                  <span className="font-medium">{template.label} <span className="text-xs text-muted-foreground font-normal">({template.description})</span></span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter link name"
            required
            className="h-10 rounded-sm"
          />
        </div>

        {/* Destination URL */}
        <div className="space-y-2">
          <Label htmlFor="baseUrl" className="text-sm font-medium">
            Destination URL <span className="text-red-500">*</span>
          </Label>
          <Input
            id="baseUrl"
            type="url"
            value={formData.baseUrl}
            onChange={(e) => {
              setFormData({ ...formData, baseUrl: e.target.value });
              if (urlError) setUrlError("");
            }}
            onBlur={handleUrlBlur}
            placeholder="Must start with http:// or https://"
            required
            className={`h-10 rounded-sm ${urlError ? "border-red-500" : ""}`}
          />
          {urlError && (
            <p className="text-sm text-red-600 mt-1">{urlError}</p>
          )}
        </div>

        {/* Source */}
        <div className="space-y-2">
          <Label htmlFor="source" className="text-sm font-medium">
            Source (utm_source) <span className="text-red-500">*</span>
          </Label>
          {!showCustomSource ? (
            <Select
              value={formData.source}
              onValueChange={(value) => {
                if (value === "+Add") {
                  setShowCustomSource(true);
                  setCustomSource("");
                } else {
                  setFormData({ ...formData, source: value });
                }
              }}
            >
              <SelectTrigger id="source" className="h-10 rounded-sm">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {getSourceOptions().map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
                <SelectItem value="+Add">+ Add New</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="flex gap-2">
              <Input
                value={customSource}
                onChange={(e) => setCustomSource(e.target.value)}
                placeholder="Enter custom source"
                autoFocus
                className="h-10 rounded-sm"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (customSource.trim()) {
                    setFormData({ ...formData, source: customSource.trim() });
                    setShowCustomSource(false);
                    setCustomSource("");
                  }
                }}
                className="h-10"
              >
                Add
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowCustomSource(false);
                  setCustomSource("");
                }}
                className="h-10"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Medium */}
        <div className="space-y-2">
          <Label htmlFor="medium" className="text-sm font-medium">
            Medium (utm_medium) <span className="text-red-500">*</span>
          </Label>
          {!showCustomMedium ? (
            <Select
              value={formData.medium}
              onValueChange={(value) => {
                if (value === "+Add") {
                  setShowCustomMedium(true);
                  setCustomMedium("");
                } else {
                  setFormData({ ...formData, medium: value });
                }
              }}
            >
              <SelectTrigger id="medium" className="h-10 rounded-sm">
                <SelectValue placeholder="Select medium" />
              </SelectTrigger>
              <SelectContent>
                {MEDIUM_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
                <SelectItem value="+Add">+ Add New</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="flex gap-2">
              <Input
                value={customMedium}
                onChange={(e) => setCustomMedium(e.target.value)}
                placeholder="Enter custom medium"
                autoFocus
                className="h-10 rounded-sm"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (customMedium.trim()) {
                    setFormData({ ...formData, medium: customMedium.trim() });
                    setShowCustomMedium(false);
                    setCustomMedium("");
                  }
                }}
                className="h-10"
              >
                Add
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowCustomMedium(false);
                  setCustomMedium("");
                }}
                className="h-10"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Campaign */}
        <div className="space-y-2">
          <Label htmlFor="campaign" className="text-sm font-medium">Campaign (Optional)</Label>
          {campaigns.length > 0 && (
            <>
              <Select
                value={selectedCampaigns[0] || ""}
                onValueChange={(value) => {
                  if (value) {
                    setSelectedCampaigns([value]);
                  } else {
                    setSelectedCampaigns([]);
                  }
                }}
              >
                <SelectTrigger id="campaign" className="h-10 rounded-sm">
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCampaigns.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCampaigns.map(id => {
                    const campaign = campaigns.find(c => c.id === id);
                    return campaign ? (
                      <Badge key={id} variant="secondary" className="flex items-center gap-1">
                        {campaign.name}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => setSelectedCampaigns([])}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Additional Parameters */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Additional Parameters (Optional)</Label>
          
          {additionalParams.length > 0 && (
            <div className="space-y-3">
              {additionalParams.map((param, index) => (
                <div key={index} className="space-y-2">
                  {param.locked ? (
                    <div className="flex items-center justify-between border rounded-sm p-3 bg-muted/50">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">utm_{param.key}={param.value}</span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAdditionalParam(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label htmlFor={`param-name-${index}`} className="text-xs text-muted-foreground">
                          Parameter Name
                        </Label>
                        <div className="flex items-center border rounded-sm focus-within:ring-2 focus-within:ring-ring">
                          <span className="px-3 text-sm text-muted-foreground bg-muted border-r">
                            utm_
                          </span>
                          <Input
                            id={`param-name-${index}`}
                            placeholder="example: content"
                            value={param.key}
                            onChange={(e) => updateAdditionalParam(index, "key", e.target.value)}
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`param-value-${index}`} className="text-xs text-muted-foreground">
                          Tracking Value
                        </Label>
                        <Input
                          id={`param-value-${index}`}
                          placeholder="example: yellow_button"
                          value={param.value}
                          onChange={(e) => updateAdditionalParam(index, "value", e.target.value)}
                          className="h-10 rounded-sm"
                        />
                      </div>
                      <div className="flex items-end gap-2 pb-1">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => lockAdditionalParam(index)}
                          className="h-10"
                        >
                          Add
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => removeAdditionalParam(index)}
                          className="h-10"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAdditionalParam}
            className="w-full h-10 rounded-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {additionalParams.length > 0 ? "Add Another Parameter" : "Add Parameter"}
          </Button>
        </div>

        {/* UTM URL Preview */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">UTM URL Preview</Label>
          <div className="border rounded-sm p-3 bg-muted/50 min-h-[60px] break-all text-sm font-mono">
            {generateUTMUrl()}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any additional context or notes..."
            rows={3}
            className="rounded-sm resize-vertical"
          />
        </div>
      </div>
    </DrawerSmall>
  );
}
