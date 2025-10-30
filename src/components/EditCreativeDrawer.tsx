import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DrawerSmall } from "@/components/shared/DrawerSmall";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { showSuccess, showError } from "@/lib/toast-helpers";

interface Creative {
  id: string;
  creative_name: string;
  campaign: string | null;
  notes: string | null;
  status: string;
  creative_group_type: string;
  parent_creative_id: string | null;
  creative_type: string;
  file_url: string | null;
  thumbnail_url: string | null;
  format_dimensions: string | null;
  file_size_mb: number | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface EditCreativeDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  creative: Creative | null;
}

export function EditCreativeDrawer({
  open,
  onClose,
  onSuccess,
  creative
}: EditCreativeDrawerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [creativeName, setCreativeName] = useState("");
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  
  // Data lists
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);

  // Pre-fill form when creative changes
  useEffect(() => {
    if (open && creative && user) {
      setCreativeName(creative.creative_name);
      fetchCampaigns();
      fetchCreativeCampaigns();
    }
  }, [open, creative, user]);

  const fetchCampaigns = async () => {
    try {
      const { data } = await supabase
        .from("campaigns")
        .select("id, name")
        .eq("user_id", user!.id)
        .order("name");
      
      setCampaigns(data || []);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  const fetchCreativeCampaigns = async () => {
    if (!creative) return;

    try {
      // Get campaign IDs associated with this creative
      const { data: junctionData } = await supabase
        .from("campaign_creatives")
        .select("campaign_id")
        .eq("creative_id", creative.id);

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
      console.error("Error fetching creative campaigns:", error);
    }
  };

  const handleCampaignToggle = (campaignName: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignName)
        ? prev.filter(c => c !== campaignName)
        : [...prev, campaignName]
    );
  };

  const handleSave = async () => {
    if (!creative) return;
    
    if (!creativeName.trim()) {
      showError("Creative name is required");
      return;
    }

    setLoading(true);
    try {
      // Update creative name
      const { error: updateError } = await supabase
        .from("creatives")
        .update({
          creative_name: creativeName.trim(),
          updated_at: new Date().toISOString()
        })
        .eq("id", creative.id);

      if (updateError) throw updateError;

      // Update campaign associations
      // First, remove all existing associations
      const { error: deleteError } = await supabase
        .from("campaign_creatives")
        .delete()
        .eq("creative_id", creative.id);

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
          const insertData = campaignData.map(campaign => ({
            campaign_id: campaign.id,
            creative_id: creative.id
          }));

          const { error: insertError } = await supabase
            .from("campaign_creatives")
            .insert(insertData);

          if (insertError) throw insertError;
        }
      }

      showSuccess("Creative updated successfully");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      showError(error.message || "Failed to update creative");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCreativeName("");
    setSelectedCampaigns([]);
    onClose();
  };

  return (
    <DrawerSmall
      isOpen={open}
      onClose={handleClose}
      title="Edit Creative"
      onSave={handleSave}
      saveText="Save Changes"
      isLoading={loading}
    >
      <div className="space-y-4">
        {/* Creative Name */}
        <div className="space-y-2">
          <Label htmlFor="creative-name" className="text-sm font-medium">
            Creative Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="creative-name"
            value={creativeName}
            onChange={(e) => setCreativeName(e.target.value)}
            placeholder="Enter creative name"
            autoFocus
            required
            className="h-10 rounded-sm"
          />
        </div>

        {/* Campaign Multi-Select */}
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
      </div>
    </DrawerSmall>
  );
}
