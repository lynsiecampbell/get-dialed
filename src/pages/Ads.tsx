import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { showError } from "@/lib/toast-helpers";
import { CampaignGroup } from "@/components/CampaignGroup";

interface Ad {
  id: string;
  campaign: string;
  platform: string;
  audience_type: string;
  ad_format: string;
  status: string;
  version: string;
  creative_id: string | null;
  landing_page_id: string | null;
  messaging_id: string | null;
  created_at: string;
  updated_at: string;
}

interface CampaignGroupData {
  campaign: string;
  ads: Ad[];
}

export default function Ads() {
  const { user } = useAuth();
  const [campaignGroups, setCampaignGroups] = useState<CampaignGroupData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAds();
    }
  }, [user]);

  const fetchAds = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Group ads by campaign
      const grouped = (data || []).reduce((acc: Record<string, Ad[]>, ad: Ad) => {
        if (!acc[ad.campaign]) {
          acc[ad.campaign] = [];
        }
        acc[ad.campaign].push(ad);
        return acc;
      }, {});

      const groups = Object.entries(grouped).map(([campaign, ads]) => ({
        campaign,
        ads,
      }));

      setCampaignGroups(groups);
    } catch (error: any) {
      console.error("Error fetching ads:", error);
      showError(error.message || "Failed to fetch ads");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">Loading ads...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Ads</h1>
          <p className="text-muted-foreground">Build and manage your ad campaigns</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Ad
        </Button>
      </div>

      {campaignGroups.length === 0 && (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No ads yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first ad to get started
            </p>
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Ad
            </Button>
          </div>
        </div>
      )}

      {campaignGroups.length > 0 && (
        <div className="space-y-4">
          {campaignGroups.map((group) => (
            <CampaignGroup
              key={group.campaign}
              campaign={group.campaign}
              ads={group.ads}
              onRefresh={fetchAds}
            />
          ))}
        </div>
      )}
    </div>
  );
}
