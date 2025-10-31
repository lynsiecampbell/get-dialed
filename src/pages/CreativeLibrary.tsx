import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { NewCreativeDrawerV2 } from "@/components/NewCreativeDrawerV2";
import { EditCreativeDrawer } from "@/components/EditCreativeDrawer";
import { CreativeGrid } from "@/components/CreativeGrid";
import { FilterDropdown } from "@/components/ui/FilterDropdown";

type Creative = {
  id: string;
  name: string;
  creative_type: string;
  image_urls: string[] | null;
  created_at: string;
  updated_at: string;
};

type CreativeWithCampaigns = Creative & {
  campaigns: { id: string; name: string }[];
  ad_count: number;
};

export default function CreativeLibrary() {
  const { user } = useAuth();
  const [creatives, setCreatives] = useState<CreativeWithCampaigns[]>([]);
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCreative, setEditingCreative] = useState<Creative | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const [filterCampaigns, setFilterCampaigns] = useState<string[]>([]);
  const [filterTypes, setFilterTypes] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchCreatives();
      fetchCampaigns();
    }
  }, [user]);

  const fetchCreatives = async () => {
    try {
      const { data: creativesData, error } = await supabase
        .from("creatives")
        .select("id, name, creative_type, image_urls, created_at, updated_at")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const creativesWithDetails = await Promise.all(
        (creativesData || []).map(async (creative) => {
          const { data: campaignLinks } = await supabase
            .from("campaign_creatives")
            .select("campaign_id, campaigns(id, name)")
            .eq("creative_id", creative.id);

          const campaigns = (campaignLinks || [])
            .map(link => link.campaigns)
            .filter(Boolean) as { id: string; name: string }[];

          const { count: adCount } = await supabase
            .from("ads")
            .select("*", { count: "exact", head: true })
            .eq("creative_id", creative.id);

          return {
            ...creative,
            campaigns,
            ad_count: adCount || 0
          };
        })
      );

      setCreatives(creativesWithDetails);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, name")
        .eq("user_id", user?.id)
        .order("name");

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      console.error("Error fetching campaigns:", error);
    }
  };

  const uniqueCampaigns = Array.from(
    new Set(
      creatives.flatMap(c => c.campaigns.map(camp => camp.name))
    )
  ).sort();

  const uniqueTypes = Array.from(
    new Set(creatives.map(c => c.creative_type))
  ).sort();

  const filteredCreatives = creatives.filter(creative => {
    const campaignMatch = filterCampaigns.length === 0 || 
      creative.campaigns.some(c => filterCampaigns.includes(c.name));
    
    const typeMatch = filterTypes.length === 0 || 
      filterTypes.includes(creative.creative_type);
    
    return campaignMatch && typeMatch;
  });

  const handleEdit = (creative: Creative) => {
    setEditingCreative(creative);
    setIsEditDrawerOpen(true);
  };

  const handleDelete = async (creativeId: string) => {
    try {
      const { error } = await supabase
        .from("creatives")
        .delete()
        .eq("id", creativeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Creative deleted successfully",
      });

      fetchCreatives();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <PageLayout 
      title="Creative Library"
      actions={
        <Button onClick={() => setDrawerOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Creative
        </Button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading creatives...</p>
        </div>
      ) : creatives.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No creatives yet
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Get started by uploading your first creative asset. You can add images, videos, and more.
            </p>
            <Button onClick={() => setDrawerOpen(true)} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Creative
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-3 mb-6">
            <FilterDropdown
              label="Campaign"
              options={uniqueCampaigns}
              value={filterCampaigns}
              onChange={setFilterCampaigns}
            />
            <FilterDropdown
              label="Type"
              options={uniqueTypes}
              value={filterTypes}
              onChange={setFilterTypes}
            />
          </div>
          
          <CreativeGrid
            creatives={filteredCreatives}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      )}

      <NewCreativeDrawerV2
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={fetchCreatives}
        campaigns={campaigns}
      />

      {editingCreative && (
        <EditCreativeDrawer
          open={isEditDrawerOpen}
          onClose={() => {
            setIsEditDrawerOpen(false);
            setEditingCreative(null);
          }}
          creative={editingCreative}
          onSuccess={fetchCreatives}
        />
      )}
    </PageLayout>
  );
}
