import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DrawerSmall } from "@/components/shared/DrawerSmall";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface EditLandingPageDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  landingPage: {
    id: string;
    name: string;
    url: string;
    description: string | null;
  } | null;
}

interface Campaign {
  id: string;
  name: string;
}

export function EditLandingPageDrawer({
  open,
  onClose,
  onSuccess,
  landingPage
}: EditLandingPageDrawerProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);

  useEffect(() => {
    if (open && landingPage && user) {
      setName(landingPage.name);
      setUrl(landingPage.url);
      setNotes(landingPage.description || "");
      fetchCampaigns();
      fetchLandingPageCampaigns();
    }
  }, [open, landingPage, user]);

  const fetchCampaigns = async () => {
    try {
      const { data } = await supabase
        .from("campaigns")
        .select("id, name")
        .eq("user_id", user?.id)
        .order("name");
      
      setCampaigns(data || []);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  const fetchLandingPageCampaigns = async () => {
    if (!landingPage) return;

    try {
      // Get campaign IDs associated with this landing page
      const { data: junctionData } = await supabase
        .from("campaign_landing_pages")
        .select("campaign_id")
        .eq("landing_page_id", landingPage.id);

      if (junctionData && junctionData.length > 0) {
        const campaignIds = junctionData.map(j => j.campaign_id);
        
        // Get campaign names
        const { data: campaignData } = await supabase
          .from("campaigns")
          .select("name")
          .in("id", campaignIds);

        setSelectedCampaigns(campaignData?.map(c => c.name) || []);
      }
    } catch (error) {
      console.error("Error fetching landing page campaigns:", error);
    }
  };

  const validateUrl = (url: string): boolean => {
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const handleCampaignToggle = (campaignName: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignName)
        ? prev.filter(c => c !== campaignName)
        : [...prev, campaignName]
    );
  };

  const handleSave = async () => {
    if (!landingPage) return;

    if (!name || !url) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!validateUrl(url)) {
      toast.error("URL must start with http:// or https://");
      return;
    }

    setLoading(true);
    try {
      // Update the landing page
      const { error: updateError } = await supabase
        .from("landing_pages")
        .update({
          name,
          url,
          description: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", landingPage.id);

      if (updateError) throw updateError;

      // Update campaign associations
      // First, remove all existing associations
      const { error: deleteError } = await supabase
        .from("campaign_landing_pages")
        .delete()
        .eq("landing_page_id", landingPage.id);

      if (deleteError) throw deleteError;

      // Then, add new associations
      if (selectedCampaigns.length > 0) {
        // Get campaign IDs from campaign names
        const { data: campaignData } = await supabase
          .from("campaigns")
          .select("id, name")
          .in("name", selectedCampaigns)
          .eq("user_id", user!.id);

        if (campaignData && campaignData.length > 0) {
          const junctionRecords = campaignData.map(campaign => ({
            campaign_id: campaign.id,
            landing_page_id: landingPage.id
          }));

          const { error: insertError } = await supabase
            .from("campaign_landing_pages")
            .insert(junctionRecords);

          if (insertError) throw insertError;
        }
      }

      toast.success("Landing page updated successfully");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update landing page");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setUrl("");
    setNotes("");
    setSelectedCampaigns([]);
    onClose();
  };

  return (
    <DrawerSmall
      isOpen={open}
      onClose={handleClose}
      title="Edit Landing Page"
      onSave={handleSave}
      saveText="Save Changes"
      isLoading={loading}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="lp-name" className="text-sm font-medium">
            Landing Page Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lp-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Homepage Q1 2024"
            disabled={loading}
            className="h-10 rounded-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lp-url" className="text-sm font-medium">
            URL <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lp-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Must start with http:// or https://"
            disabled={loading}
            className="h-10 rounded-sm"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Associated Campaigns</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full h-10 justify-between font-normal rounded-sm"
                disabled={loading}
              >
                {selectedCampaigns.length > 0
                  ? `${selectedCampaigns.length} campaign${selectedCampaigns.length !== 1 ? 's' : ''} selected`
                  : 'Select campaigns...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[436px] p-0 pointer-events-auto" 
              align="start"
            >
              <div className="max-h-64 overflow-y-auto p-2">
                {campaigns.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">
                    No campaigns available
                  </p>
                ) : (
                  campaigns.map((campaign) => (
                    <button
                      key={campaign.id}
                      type="button"
                      onClick={() => handleCampaignToggle(campaign.name)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer',
                        selectedCampaigns.includes(campaign.name) && 'bg-accent'
                      )}
                    >
                      <div
                        className={cn(
                          'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                          selectedCampaigns.includes(campaign.name)
                            ? 'bg-primary text-primary-foreground'
                            : 'opacity-50'
                        )}
                      >
                        <Check className={cn('h-4 w-4', !selectedCampaigns.includes(campaign.name) && 'invisible')} />
                      </div>
                      {campaign.name}
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lp-notes" className="text-sm font-medium">Notes (Optional)</Label>
          <Textarea
            id="lp-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about testing, performance, or creative context..."
            rows={4}
            disabled={loading}
            className="rounded-sm resize-vertical"
          />
        </div>
      </div>
    </DrawerSmall>
  );
}
