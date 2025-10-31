import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { showSuccess, showError } from "@/lib/toast-helpers";
import { NewCampaignDrawer } from "@/components/NewCampaignDrawer";
import { ManageCampaignDrawer } from "@/components/ManageCampaignDrawer";
import { AssetCount } from "@/components/ui/asset-count";
import { AssetActions } from "@/components/AssetActions";
import { FilterDropdown } from "@/components/ui/FilterDropdown";

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  notes: string | null;
  updated_at: string;
}

interface CampaignWithCounts extends Campaign {
  creativesCount: number;
  landingPagesCount: number;
  adsCount: number;
  emailCount: number;
  adMessagingCount: number;
  brandCount: number;
  socialCount: number;
}

export default function Campaigns() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<CampaignWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDrawer, setShowNewDrawer] = useState(false);
  const [showManageDrawer, setShowManageDrawer] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [filterCampaigns, setFilterCampaigns] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchCampaigns();
    }
  }, [user]);

  const fetchCampaigns = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: campaignsData, error: campaignsError } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (campaignsError) throw campaignsError;

      if (!campaignsData || campaignsData.length === 0) {
        setCampaigns([]);
        setLoading(false);
        return;
      }

      const campaignsWithCounts = await Promise.all(
        campaignsData.map(async (campaign) => {
          const { count: creativesCount } = await supabase
            .from("campaign_creatives")
            .select("*", { count: "exact", head: true })
            .eq("campaign_id", campaign.id);

          const { count: landingPagesCount } = await supabase
            .from("campaign_landing_pages")
            .select("*", { count: "exact", head: true })
            .eq("campaign_id", campaign.id);

          const { count: adsCount } = await supabase
            .from("ads")
            .select("*", { count: "exact", head: true })
            .eq("campaign_id", campaign.id);

          const { data: messagingData } = await supabase
            .from("campaign_messaging")
            .select(`
              messaging:messaging_id (
                messaging_type
              )
            `)
            .eq("campaign_id", campaign.id);

          const emailCount = messagingData?.filter((m: any) => m.messaging?.messaging_type === "Email").length || 0;
          const adMessagingCount = messagingData?.filter((m: any) => m.messaging?.messaging_type === "Ad").length || 0;
          const brandCount = messagingData?.filter((m: any) => m.messaging?.messaging_type === "Brand").length || 0;
          const socialCount = messagingData?.filter((m: any) => m.messaging?.messaging_type === "Social").length || 0;

          return {
            ...campaign,
            creativesCount: creativesCount || 0,
            landingPagesCount: landingPagesCount || 0,
            adsCount: adsCount || 0,
            emailCount,
            adMessagingCount,
            brandCount,
            socialCount,
          };
        })
      );

      setCampaigns(campaignsWithCounts);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const campaignNames = campaigns.map(c => c.name).sort();
  
  const filteredCampaigns = campaigns.filter(campaign => {
    return filterCampaigns.length === 0 || filterCampaigns.includes(campaign.name);
  });

  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowManageDrawer(true);
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    try {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", id);

      if (error) throw error;

      showSuccess("Campaign deleted successfully");
      fetchCampaigns();
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleNewCampaignSuccess = () => {
    setShowNewDrawer(false);
    fetchCampaigns();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground mt-2">Store, organize, and manage key messaging and assets</p>
        </div>
        <Button onClick={() => setShowNewDrawer(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Campaign
        </Button>
      </div>

      {campaigns.length === 0 && (
        <div className="flex items-center justify-center h-[60vh]">
          <Button size="lg" onClick={() => setShowNewDrawer(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Campaign
          </Button>
        </div>
      )}

      {campaigns.length > 0 && (
        <>
          <div className="mb-6">
            <FilterDropdown
              label="Campaign"
              options={campaignNames}
              value={filterCampaigns}
              onChange={setFilterCampaigns}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
            {filteredCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="border rounded-sm p-4 hover:shadow-md transition-shadow bg-card cursor-pointer flex flex-col h-full"
                onClick={() => handleEditCampaign(campaign)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex-1 pr-2">{campaign.name}</h3>
                  <Badge variant="secondary" className="flex-shrink-0">{campaign.type}</Badge>
                </div>

                <div className="space-y-3 mb-4 flex-1">
                  <div className="pb-3 border-b">
                    <p className="text-sm font-medium mb-2">Assets</p>
                    <div className="flex flex-wrap gap-2">
                      {campaign.creativesCount > 0 && (
                        <AssetCount type="creative" count={campaign.creativesCount} size="sm" />
                      )}
                      {campaign.landingPagesCount > 0 && (
                        <AssetCount type="landing-page" count={campaign.landingPagesCount} size="sm" />
                      )}
                      {campaign.adsCount > 0 && (
                        <AssetCount type="ad" count={campaign.adsCount} size="sm" />
                      )}
                      {campaign.creativesCount === 0 && 
                       campaign.landingPagesCount === 0 && 
                       campaign.adsCount === 0 && (
                        <p className="text-xs text-muted-foreground italic">No assets yet</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Messaging</p>
                    <div className="flex flex-wrap gap-2">
                      {campaign.emailCount > 0 && (
                        <AssetCount type="email" count={campaign.emailCount} size="sm" />
                      )}
                      {campaign.adMessagingCount > 0 && (
                        <AssetCount type="ad-copy" count={campaign.adMessagingCount} size="sm" />
                      )}
                      {campaign.brandCount > 0 && (
                        <AssetCount type="brand" count={campaign.brandCount} size="sm" />
                      )}
                      {campaign.socialCount > 0 && (
                        <AssetCount type="social" count={campaign.socialCount} size="sm" />
                      )}
                      {campaign.emailCount === 0 && 
                       campaign.adMessagingCount === 0 && 
                       campaign.brandCount === 0 &&
                       campaign.socialCount === 0 && (
                        <p className="text-xs text-muted-foreground italic">No messaging yet</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground mt-auto">
                  <span>Updated {new Date(campaign.updated_at).toLocaleDateString()}</span>
                  <div onClick={(e) => e.stopPropagation()}>
                    <AssetActions
                      onEdit={() => handleEditCampaign(campaign)}
                      onDelete={() => handleDeleteCampaign(campaign.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <NewCampaignDrawer
        open={showNewDrawer}
        onClose={() => setShowNewDrawer(false)}
        onSuccess={handleNewCampaignSuccess}
      />

      <ManageCampaignDrawer
        open={showManageDrawer}
        onOpenChange={setShowManageDrawer}
        campaign={selectedCampaign}
        onSuccess={() => {
          setShowManageDrawer(false);
          fetchCampaigns();
        }}
      />
    </div>
  );
}
