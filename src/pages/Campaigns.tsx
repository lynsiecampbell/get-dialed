import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Image as ImageIcon, Globe, Layers, Mail, Megaphone, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { showSuccess, showError } from "@/lib/toast-helpers";
import { NewCampaignDrawer } from "@/components/NewCampaignDrawer";
import { ManageCampaignDrawer } from "@/components/ManageCampaignDrawer";

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

  useEffect(() => {
    if (user) {
      fetchCampaigns();
    }
  }, [user]);

  const fetchCampaigns = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch campaigns
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

      // Fetch counts for each campaign
      const campaignsWithCounts = await Promise.all(
        campaignsData.map(async (campaign) => {
          // Creatives count
          const { count: creativesCount } = await supabase
            .from("campaign_creatives")
            .select("*", { count: "exact", head: true })
            .eq("campaign_id", campaign.id);

          // Landing pages count
          const { count: landingPagesCount } = await supabase
            .from("campaign_landing_pages")
            .select("*", { count: "exact", head: true })
            .eq("campaign_id", campaign.id);

          // Ads count
          const { count: adsCount } = await supabase
            .from("ads")
            .select("*", { count: "exact", head: true })
            .eq("campaign_id", campaign.id);

          // Messaging counts by type
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
      console.error("Error fetching campaigns:", error);
      showError(error.message || "Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowManageDrawer(true);
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    try {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", campaignId);

      if (error) throw error;

      showSuccess("Campaign deleted successfully");
      fetchCampaigns();
    } catch (error: any) {
      console.error("Error deleting campaign:", error);
      showError(error.message || "Failed to delete campaign");
    }
  };

  const handleNewCampaignSuccess = (campaignId: string) => {
    // Fetch the newly created campaign
    supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single()
      .then(({ data }) => {
        if (data) {
          setSelectedCampaign(data);
          setShowManageDrawer(true);
        }
      });
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
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Store, organize, and manage key messaging and assets</p>
        </div>
        <Button onClick={() => setShowNewDrawer(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Campaign
        </Button>
      </div>

      {/* Empty State */}
      {campaigns.length === 0 && (
        <div className="flex items-center justify-center h-[60vh]">
          <Button size="lg" onClick={() => setShowNewDrawer(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Campaign
          </Button>
        </div>
      )}

      {/* Campaign Grid */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{campaign.name}</h3>
                  <Badge variant="secondary">{campaign.type}</Badge>
                </div>
              </div>

              {/* Assets */}
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-sm font-medium mb-2">Assets</p>
                  <div className="flex flex-wrap gap-2">
                    {campaign.creativesCount > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <ImageIcon className="h-3 w-3" />
                        {campaign.creativesCount} Creatives
                      </Badge>
                    )}
                    {campaign.landingPagesCount > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Globe className="h-3 w-3" />
                        {campaign.landingPagesCount} Landing Page{campaign.landingPagesCount !== 1 ? 's' : ''}
                      </Badge>
                    )}
                    {campaign.adsCount > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Layers className="h-3 w-3" />
                        {campaign.adsCount} Ads
                      </Badge>
                    )}
                    {campaign.creativesCount === 0 && 
                     campaign.landingPagesCount === 0 && 
                     campaign.adsCount === 0 && (
                      <p className="text-xs text-muted-foreground italic">No assets yet</p>
                    )}
                  </div>
                </div>

                {/* Messaging */}
                <div>
                  <p className="text-sm font-medium mb-2">Messaging</p>
                  <div className="flex flex-wrap gap-2">
                    {campaign.emailCount > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Mail className="h-3 w-3" />
                        {campaign.emailCount} Email
                      </Badge>
                    )}
                    {campaign.adMessagingCount > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Megaphone className="h-3 w-3" />
                        {campaign.adMessagingCount} Ad
                      </Badge>
                    )}
                    {campaign.brandCount > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Sparkles className="h-3 w-3" />
                        {campaign.brandCount} Brand
                      </Badge>
                    )}
                    {campaign.socialCount > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Sparkles className="h-3 w-3" />
                        {campaign.socialCount} Social
                      </Badge>
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

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground">
                <span>Updated {new Date(campaign.updated_at).toLocaleDateString()}</span>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => handleEditCampaign(campaign)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => handleDeleteCampaign(campaign.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => handleEditCampaign(campaign)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawers */}
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
