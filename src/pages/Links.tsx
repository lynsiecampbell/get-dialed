import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Copy, ExternalLink, Plus, Clock } from "lucide-react";
import { AssetActions } from "@/components/AssetActions";
import { PageLayout } from "@/components/PageLayout";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { CreateUTMDrawer } from "@/components/CreateUTMDrawer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";

interface Link {
  id: string;
  link_name: string;
  campaign: string;
  audience: string | null;
  medium: string;
  source: string;
  landing_page_url: string;
  ad_id: string | null;
  creative_id: string | null;
  generated_utm_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Ad {
  id: string;
  ad_name: string | null;
  campaign: string;
  audience_type: string;
  creative_type: string;
  version: string;
}

interface LandingPage {
  id: string;
  url: string;
  name: string | null;
}

const MEDIUM_OPTIONS = ["paid_social", "organic_social", "email", "referral", "search"];
const SOURCE_OPTIONS = ["Meta", "LinkedIn", "HubSpot", "Email", "Other"];
const AUDIENCE_OPTIONS = ["Retargeting", "Lookalike", "Cold", "Other"];

export default function Links() {
  const { user } = useAuth();
  const [links, setLinks] = useState<Link[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [campaigns, setCampaigns] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filterCampaign, setFilterCampaign] = useState<string[]>([]);
  const [filterSource, setFilterSource] = useState<string[]>([]);
  const [filterMedium, setFilterMedium] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchLinks();
      fetchAds();
      fetchLandingPages();
      fetchCampaigns();
    }
  }, [user]);

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .is("ad_id", null) // Only fetch manually created links
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching links", description: error.message, variant: "destructive" });
    } else {
      setLinks(data || []);
    }
  };

  const fetchAds = async () => {
    const { data } = await supabase
      .from("ads")
      .select(`
        id,
        ad_name,
        campaign_id,
        audience_type,
        creative_type,
        version,
        campaigns!inner(name)
      `);
    
    const adsWithCampaignName = (data || []).map((ad: any) => ({
      ...ad,
      campaign: ad.campaigns?.name || ''
    }));
    
    setAds(adsWithCampaignName);
  };

  const fetchLandingPages = async () => {
    const { data } = await supabase.from("landing_pages").select("id, url, name");
    setLandingPages(data || []);
  };

  const fetchCampaigns = async () => {
    const { data } = await supabase
      .from("campaigns")
      .select("name")
      .eq("user_id", user?.id);
    
    const uniqueCampaigns = Array.from(new Set(data?.map(c => c.name) || [])).sort();
    setCampaigns(uniqueCampaigns);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting link", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Link deleted successfully" });
      fetchLinks();
    }
  };

  const handleDuplicate = async (link: Link) => {
    const { error } = await supabase.from("links").insert({
      user_id: user?.id,
      link_name: `${link.link_name} (Copy)`,
      campaign: link.campaign,
      audience: link.audience,
      medium: link.medium,
      source: link.source,
      landing_page_url: link.landing_page_url,
      ad_id: link.ad_id,
      creative_id: link.creative_id,
      generated_utm_url: link.generated_utm_url,
      notes: link.notes,
      utm_source_manual: link.source,
      utm_medium_manual: link.medium
    });

    if (error) {
      toast({ title: "Error duplicating link", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Link duplicated successfully" });
      fetchLinks();
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied to clipboard" });
  };

  const handleUrlClick = (url: string, event: React.MouseEvent) => {
    if (event.shiftKey) {
      window.open(url, '_blank');
    } else {
      copyToClipboard(url);
    }
  };

  const getAdName = (adId: string | null) => {
    if (!adId) return "—";
    const ad = ads.find((a) => a.id === adId);
    if (!ad) return "Unknown Ad";
    
    // Generate ad name from components if ad_name is null
    if (!ad.ad_name) {
      return `${ad.campaign} | ${ad.audience_type} | Page Post Ad | v${ad.version}`;
    }
    
    return ad.ad_name;
  };

  const filteredLinks = links.filter((link) => {
    const matchesCampaign = filterCampaign.length === 0 || filterCampaign.includes(link.campaign);
    const matchesSource = filterSource.length === 0 || filterSource.includes(link.source);
    const matchesMedium = filterMedium.length === 0 || filterMedium.includes(link.medium);
    return matchesCampaign && matchesSource && matchesMedium;
  });

  return (
    <>
      <CreateUTMDrawer 
        open={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onSuccess={fetchLinks}
      />
      
      <PageLayout
        title="Links"
        subtitle="Central tracking layer for all UTM-tracked links across channels"
        actions={
          <Button onClick={() => setIsDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Link
          </Button>
        }
      >

      <div className="mb-3 flex gap-2 items-center flex-wrap">
        <FilterDropdown
          label="Campaign"
          options={campaigns}
          value={filterCampaign}
          onChange={(val) => setFilterCampaign(Array.isArray(val) ? val : [])}
          multiSelect={true}
          searchable={true}
        />
        
        <FilterDropdown
          label="Source"
          options={SOURCE_OPTIONS}
          value={filterSource}
          onChange={(val) => setFilterSource(Array.isArray(val) ? val : [])}
          multiSelect={true}
          searchable={true}
        />
        
        <FilterDropdown
          label="Medium"
          options={MEDIUM_OPTIONS}
          value={filterMedium}
          onChange={(val) => setFilterMedium(Array.isArray(val) ? val : [])}
          multiSelect={true}
          searchable={true}
        />

        {(filterCampaign.length > 0 || filterSource.length > 0 || filterMedium.length > 0) && (
          <Button
            variant="ghost"
            onClick={() => {
              setFilterCampaign([]);
              setFilterSource([]);
              setFilterMedium([]);
            }}
            className="ml-auto text-sm text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {filteredLinks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No links yet — they'll appear here automatically when you build ads or create them manually.
          </p>
          <Button onClick={() => setIsDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Link
          </Button>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table style={{ minWidth: "1200px" }}>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-sm font-medium text-gray-600 w-[200px] min-w-[200px]">Link Name</TableHead>
                  <TableHead className="text-sm font-medium text-gray-600">Campaign</TableHead>
                  <TableHead className="text-sm font-medium text-gray-600">Source</TableHead>
                  <TableHead className="text-sm font-medium text-gray-600">Medium</TableHead>
                  <TableHead className="text-sm font-medium text-gray-600 min-w-[250px]">Destination URL</TableHead>
                  <TableHead className="text-sm font-medium text-gray-600 w-[500px] min-w-[500px] max-w-[500px]">UTM URL</TableHead>
                  <TableHead className="text-sm font-medium text-gray-600 text-right">Created</TableHead>
                  <TableHead className="text-sm font-medium text-gray-600 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {filteredLinks.map((link) => (
                <TableRow key={link.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="px-4 py-3 w-[200px] min-w-[200px]">
                    <div className="text-gray-900 font-medium break-words">
                      {link.link_name}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {link.campaign ? (
                      <Badge variant="outline">{link.campaign}</Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge platform={link.source.toLowerCase() as any}>
                      {link.source}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge medium={link.medium.toLowerCase().replace(/_/g, '-') as any}>
                      {link.medium}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 min-w-[250px]">
                    <div className="relative group">
                      <a
                        href={link.landing_page_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-50 rounded-md px-3 py-2 pr-8 text-sm truncate text-primary block hover:bg-gray-100 transition-colors hover:underline"
                      >
                        {link.landing_page_url}
                      </a>
                      <ExternalLink className="h-3.5 w-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 w-[500px] min-w-[500px] max-w-[500px]">
                    <div 
                      className="bg-gray-50 rounded-md px-3 py-2 pr-8 text-xs break-all text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors group relative"
                      onClick={(e) => handleUrlClick(link.generated_utm_url || "", e)}
                      title="Click to copy • Shift+Click to open"
                    >
                      {link.generated_utm_url}
                      <Copy className="h-3 w-3 absolute right-2 top-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-end text-gray-600 text-sm whitespace-nowrap">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{format(new Date(link.created_at), "MMM dd, yyyy")}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <AssetActions
                        onEdit={() => console.log("Edit link", link.id)}
                        onDuplicate={() => handleDuplicate(link)}
                        onDelete={() => handleDelete(link.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        </div>
      )}
    </PageLayout>
    </>
  );
}
