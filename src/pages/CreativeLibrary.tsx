import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditCreativeDrawer } from "@/components/EditCreativeDrawer";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Film, Image as ImageIcon, Megaphone, ChevronUp, ChevronDown, LayoutGrid, List } from "lucide-react";
import { useSort } from "@/hooks/useSort";
import { AssetActions } from "@/components/AssetActions";
import { Label } from "@/components/ui/label";
import { NewCreativeDrawer } from "@/components/NewCreativeDrawer";
import { PageLayout } from "@/components/PageLayout";
import { CreativeGrid } from "@/components/CreativeGrid";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
type Creative = {
  id: string;
  creative_name: string;
  campaign: string | null;
  status: string;
  creative_group_type: string;
  parent_creative_id: string | null;
  creative_type: string;
  file_url: string | null;
  thumbnail_url: string | null;
  format_dimensions: string | null;
  file_size_mb: number | null;
  tags: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type CreativeWithAdCount = Creative & {
  ad_count: number;
};

type Ad = {
  id: string;
  ad_name: string | null;
  campaign: string;
  status: string;
  creative_type: string;
  version: string;
  audience_type: string;
};
export default function CreativeLibrary() {
  const {
    user
  } = useAuth();
  const [creatives, setCreatives] = useState<CreativeWithAdCount[]>([]);
  const [campaigns, setCampaigns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewCreativeOpen, setIsNewCreativeOpen] = useState(false);
  const [isNewCarouselOpen, setIsNewCarouselOpen] = useState(false);
  const [previewCreative, setPreviewCreative] = useState<Creative | null>(null);
  const [editingCreative, setEditingCreative] = useState<Creative | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  
  // Associated Ads dialog states
  const [associatedAdsDialogOpen, setAssociatedAdsDialogOpen] = useState(false);
  const [associatedAdsData, setAssociatedAdsData] = useState<Ad[]>([]);
  const [selectedCreativeName, setSelectedCreativeName] = useState<string>("");

  // Delete confirmation states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [creativeToDelete, setCreativeToDelete] = useState<{ id: string; name: string } | null>(null);

  // View mode state - defaults to 'card', stored in sessionStorage
  const [viewMode, setViewMode] = useState<'card' | 'list'>(() => {
    const saved = sessionStorage.getItem('creative-library-view-mode');
    // Explicitly check for 'list', otherwise default to 'card'
    return saved === 'list' ? 'list' : 'card';
  });

  // Form states
  const [creativeName, setCreativeName] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState("");

  // Filter states
  const [filterCampaigns, setFilterCampaigns] = useState<string[]>([]);
  const [filterTypes, setFilterTypes] = useState<string[]>([]);

  // Carousel form states
  const [carouselName, setCarouselName] = useState("");
  const [carouselCampaign, setCarouselCampaign] = useState("");
  const [carouselFiles, setCarouselFiles] = useState<File[]>([]);

  // Save view mode preference to sessionStorage
  const handleViewModeChange = (value: string) => {
    if (value === 'card' || value === 'list') {
      setViewMode(value);
      sessionStorage.setItem('creative-library-view-mode', value);
    }
  };
  useEffect(() => {
    if (user) {
      fetchCreatives();
      fetchCampaigns();
    }
  }, [user]);
  const fetchCreatives = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("creatives").select("*").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      
      // Fetch ad counts for each creative
      const creativesWithCounts = await Promise.all(
        (data || []).map(async (creative) => {
          const { count } = await supabase
            .from("ad_creatives")
            .select("*", { count: "exact", head: true })
            .eq("creative_id", creative.id);
          
          return {
            ...creative,
            ad_count: count || 0,
          };
        })
      );
      
      setCreatives(creativesWithCounts);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchCampaigns = async () => {
    try {
      const { data } = await supabase
        .from("campaigns")
        .select("name")
        .eq("user_id", user?.id);
      
      const uniqueCampaigns = Array.from(new Set(data?.map(c => c.name) || [])).sort();
      setCampaigns(uniqueCampaigns);
    } catch (error: any) {
      console.error("Error fetching campaigns:", error);
    }
  };
  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
    const {
      error: uploadError
    } = await supabase.storage.from("creative-images").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false
    });
    if (uploadError) throw uploadError;
    const {
      data: urlData
    } = supabase.storage.from("creative-images").getPublicUrl(fileName);
    return urlData.publicUrl;
  };
  const detectFileMetadata = (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    const creativeType = isImage ? "Image" : isVideo ? "Video" : "Other";
    const fileSizeMB = file.size / (1024 * 1024);
    return {
      creativeType,
      fileSizeMB: parseFloat(fileSizeMB.toFixed(2)),
      mimeType: file.type
    };
  };
  const handleCreateCreative = async () => {
    if (!file && !externalUrl) {
      toast({
        title: "Error",
        description: "Please upload a file or enter a URL",
        variant: "destructive"
      });
      return;
    }
    try {
      let fileUrl = externalUrl;
      let metadata = {
        creativeType: "Other",
        fileSizeMB: 0,
        mimeType: ""
      };
      if (file) {
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: "Error",
            description: "File size must be less than 50MB",
            variant: "destructive"
          });
          return;
        }
        fileUrl = await uploadFile(file);
        metadata = detectFileMetadata(file);
      }
      const { data, error } = await supabase.from("creatives").insert({
        user_id: user?.id,
        creative_name: creativeName || file?.name || "Untitled",
        creative_type: metadata.creativeType,
        file_url: fileUrl,
        thumbnail_url: fileUrl,
        file_size_mb: metadata.fileSizeMB,
        mime_type: metadata.mimeType,
        tags: [],
        notes,
        status: "Unassigned"
      }).select().single();

      if (error) throw error;

      // Link to campaign if selected
      if (selectedCampaign && data) {
        const { data: messagingRecords } = await supabase
          .from("messaging_matrix")
          .select("id")
          .eq("user_id", user?.id)
          .eq("campaign", selectedCampaign);

        if (messagingRecords && messagingRecords.length > 0) {
          for (const messagingRecord of messagingRecords) {
            await supabase.from("messaging_creatives").insert({
              messaging_id: messagingRecord.id,
              creative_id: data.id
            });
          }

          // Update creative status
          await supabase.from("creatives")
            .update({ status: "Assigned" })
            .eq("id", data.id);
        }
      }

      toast({
        title: "Success",
        description: "Creative created successfully"
      });
      setIsNewCreativeOpen(false);
      resetForm();
      fetchCreatives();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleCreateCarousel = async () => {
    if (!carouselName || carouselFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please provide a carousel name and at least one file",
        variant: "destructive"
      });
      return;
    }
    try {
      // Create parent carousel creative
      const {
        data: parentData,
        error: parentError
      } = await supabase.from("creatives").insert({
        user_id: user?.id,
        creative_name: carouselName,
        creative_group_type: "Carousel",
        creative_type: "Single Image",
        status: "Unassigned"
      }).select().single();
      if (parentError) throw parentError;

      // Upload and create child creatives
      for (const file of carouselFiles) {
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: "Warning",
            description: `${file.name} exceeds 50MB and was skipped`
          });
          continue;
        }
        const fileUrl = await uploadFile(file);
        const metadata = detectFileMetadata(file);
        await supabase.from("creatives").insert({
          user_id: user?.id,
          creative_name: file.name,
          status: "Unassigned",
          creative_group_type: "Single",
          parent_creative_id: parentData.id,
          creative_type: metadata.creativeType,
          file_url: fileUrl,
          thumbnail_url: fileUrl,
          file_size_mb: metadata.fileSizeMB,
          mime_type: metadata.mimeType
        });
      }

      // Link to campaign if selected
      if (carouselCampaign && parentData) {
        const { data: messagingRecords } = await supabase
          .from("messaging_matrix")
          .select("id")
          .eq("user_id", user?.id)
          .eq("campaign", carouselCampaign);

        if (messagingRecords && messagingRecords.length > 0) {
          for (const messagingRecord of messagingRecords) {
            await supabase.from("messaging_creatives").insert({
              messaging_id: messagingRecord.id,
              creative_id: parentData.id
            });
          }

          // Update creative status
          await supabase.from("creatives")
            .update({ status: "Assigned" })
            .eq("id", parentData.id);
        }
      }

      toast({
        title: "Success",
        description: `Carousel created with ${carouselFiles.length} items`
      });
      setIsNewCarouselOpen(false);
      resetCarouselForm();
      fetchCreatives();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleEdit = (creative: Creative) => {
    setEditingCreative(creative);
    setIsEditDrawerOpen(true);
  };

  const handleUpdateCreativeSuccess = () => {
    setEditingCreative(null);
    fetchCreatives();
  };

  const handleDownload = async (creative: Creative) => {
    try {
      if (!creative.file_url) {
        toast({
          title: "Error",
          description: "No file available to download",
          variant: "destructive"
        });
        return;
      }

      // Fetch the file as a blob to prevent browser from displaying it
      const response = await fetch(creative.file_url);
      const blob = await response.blob();
      
      // Create a blob URL and trigger download
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = creative.creative_name || 'creative';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);

      toast({
        title: "Success",
        description: "Download complete"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    setCreativeToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!creativeToDelete) return;

    try {
      const {
        error
      } = await supabase.from("creatives").delete().eq("id", creativeToDelete.id);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Creative deleted successfully"
      });
      fetchCreatives();
      setDeleteDialogOpen(false);
      setCreativeToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const resetForm = () => {
    setCreativeName("");
    setSelectedCampaign("");
    setNotes("");
    setFile(null);
    setExternalUrl("");
  };
  const resetCarouselForm = () => {
    setCarouselName("");
    setCarouselCampaign("");
    setCarouselFiles([]);
  };

  const handleViewAssociatedAds = async (creativeId: string, creativeName: string) => {
    try {
      // Fetch ads associated with this creative
      const { data: adCreatives, error } = await supabase
        .from("ad_creatives")
        .select("ad_id")
        .eq("creative_id", creativeId);

      if (error) throw error;

      // Always set the creative name and open dialog
      setSelectedCreativeName(creativeName);
      
      if (adCreatives && adCreatives.length > 0) {
        const adIds = adCreatives.map((ac) => ac.ad_id);
        const { data: ads, error: adsError } = await supabase
          .from("ads")
          .select(`
            id,
            ad_name,
            campaign_id,
            status,
            creative_type,
            version,
            audience_type,
            campaigns!inner(name)
          `)
          .in("id", adIds);

        if (adsError) throw adsError;

        const adsWithCampaignName = (ads || []).map((ad: any) => ({
          ...ad,
          campaign: ad.campaigns?.name || ''
        }));

        setAssociatedAdsData(adsWithCampaignName);
      } else {
        setAssociatedAdsData([]);
      }
      
      setAssociatedAdsDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  // Get unique campaigns and types for filters (must be before early returns)
  const uniqueCampaigns = Array.from(new Set(creatives.map(c => c.campaign).filter(Boolean))) as string[];
  const uniqueTypes = Array.from(new Set(creatives.map(c => c.creative_type)));

  // Filter creatives based on selected filters
  const filteredCreatives = creatives.filter(creative => {
    const matchesCampaign = filterCampaigns.length === 0 || filterCampaigns.includes(creative.campaign || '');
    const matchesType = filterTypes.length === 0 || filterTypes.includes(creative.creative_type);
    return matchesCampaign && matchesType;
  });

  // Apply sorting (hook must be called before any conditional returns)
  const { items: sortedCreatives, requestSort, sortConfig } = useSort(filteredCreatives);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <PageLayout
      title="Creative Library"
      actions={
        <>
          <Button onClick={() => setIsNewCreativeOpen(true)} className="inline-flex items-center justify-center gap-1 px-4 py-2">
            <Plus className="h-4 w-4" />
            Creative
          </Button>

          <NewCreativeDrawer
            open={isNewCreativeOpen}
            onClose={() => setIsNewCreativeOpen(false)}
            onSuccess={fetchCreatives}
          />

          <NewCreativeDrawer
            open={isNewCarouselOpen}
            onOpenChange={setIsNewCarouselOpen}
            onSuccess={fetchCreatives}
          />
        </>
      }
    >
      {/* Filter Controls and View Mode Toggle */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-2">
          <FilterDropdown
            label="Campaign"
            options={uniqueCampaigns}
            value={filterCampaigns}
            onChange={(val) => setFilterCampaigns(Array.isArray(val) ? val : [])}
            multiSelect={true}
            searchable={true}
          />
          <FilterDropdown
            label="Type"
            options={uniqueTypes}
            value={filterTypes}
            onChange={(val) => setFilterTypes(Array.isArray(val) ? val : [])}
            multiSelect={true}
          />
          
          {(filterCampaigns.length > 0 || filterTypes.length > 0) && (
            <Button
              variant="ghost"
              onClick={() => {
                setFilterCampaigns([]);
                setFilterTypes([]);
              }}
              className="ml-auto text-sm text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>
        
        {/* View Mode Toggle */}
        <ToggleGroup type="single" value={viewMode} onValueChange={handleViewModeChange} className="border border-border rounded-md">
          <ToggleGroupItem value="card" aria-label="Card view" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="animate-fade-in">
          <CreativeGrid
            creatives={sortedCreatives}
            onEdit={handleEdit}
            onDownload={handleDownload}
            onDelete={(id, name) => handleDelete(id, name)}
            onViewAds={handleViewAssociatedAds}
          />
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="animate-fade-in border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table style={{ minWidth: "1200px" }}>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Preview</TableHead>
              <TableHead 
                className={`font-semibold cursor-pointer hover:text-foreground transition-colors select-none ${
                  sortConfig?.key === 'creative_name' ? 'text-foreground' : 'text-muted-foreground'
                }`}
                onClick={() => requestSort('creative_name')}
              >
                <div className="flex items-center gap-1">
                  Name
                  {sortConfig?.key === 'creative_name' ? (
                    sortConfig.direction === 'asc' ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )
                  ) : (
                    <ChevronUp className="h-3 w-3 opacity-30" />
                  )}
                </div>
              </TableHead>
              <TableHead className="font-semibold">Campaign</TableHead>
              <TableHead className="font-semibold">Ad Format</TableHead>
              <TableHead className="font-semibold">Group</TableHead>
              <TableHead className="font-semibold">Ads</TableHead>
              <TableHead 
                className={`font-semibold cursor-pointer hover:text-foreground transition-colors select-none ${
                  sortConfig?.key === 'updated_at' ? 'text-foreground' : 'text-muted-foreground'
                }`}
                onClick={() => requestSort('updated_at')}
              >
                <div className="flex items-center gap-1">
                  Updated
                  {sortConfig?.key === 'updated_at' ? (
                    sortConfig.direction === 'asc' ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )
                  ) : (
                    <ChevronUp className="h-3 w-3 opacity-30" />
                  )}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCreatives.length === 0 ? <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {creatives.length === 0 ? "No creatives yet. Create your first one!" : "No creatives match the selected filters."}
                </TableCell>
              </TableRow> : sortedCreatives.map(creative => <TableRow key={creative.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="align-middle px-4 py-2">
                    {creative.file_url ? creative.creative_type === "Video" ? <div className="w-32 h-24 bg-muted rounded-[5px] flex items-center justify-center">
                          <Film className="h-6 w-6" />
                        </div> : <img src={creative.thumbnail_url || ""} alt={creative.creative_name} className="w-32 h-24 object-contain rounded-[5px] bg-gray-50 border border-gray-200" /> : <div className="w-32 h-24 bg-muted rounded-[5px] flex items-center justify-center">
                        <ImageIcon className="h-6 w-6" />
                      </div>}
                  </TableCell>
                  <TableCell className="font-medium align-middle px-4 py-2">
                    {creative.creative_name}
                  </TableCell>
                  <TableCell className="align-middle px-4 py-2">
                    {creative.campaign ? (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-[5px] bg-muted inline-block">
                        {creative.campaign}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="align-middle px-4 py-2">
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${
                      creative.creative_type === 'Single Image' 
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
                        : creative.creative_type === 'Video'
                        ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
                        : 'bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
                    }`}>
                      {creative.creative_type}
                    </span>
                  </TableCell>
                  <TableCell className="align-middle px-4 py-2">
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${
                      creative.creative_group_type === 'Carousel'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                        : 'bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
                    }`}>
                      {creative.creative_group_type}
                    </span>
                  </TableCell>
                  <TableCell className="align-middle px-4 py-2">
                    <button
                      onClick={() => creative.ad_count > 0 && handleViewAssociatedAds(creative.id, creative.creative_name)}
                      disabled={creative.ad_count === 0}
                      className={`${
                        creative.ad_count > 0
                          ? 'bg-muted cursor-pointer hover:bg-muted/80'
                          : 'bg-muted/50 cursor-not-allowed opacity-60'
                      } inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-[5px] border transition-colors`}
                      title={creative.ad_count > 0 ? "View associated ads" : "No associated ads"}
                    >
                      <Megaphone className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                      {creative.ad_count} {creative.ad_count === 1 ? 'ad' : 'ads'}
                    </button>
                  </TableCell>
                  <TableCell className="align-middle px-4 py-2">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(creative.updated_at), 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell className="align-middle px-4 py-2">
                    <div className="flex items-center justify-end">
                      <AssetActions
                        onEdit={() => handleEdit(creative)}
                        onDownload={() => handleDownload(creative)}
                        onDelete={() => handleDelete(creative.id, creative.creative_name)}
                      />
                    </div>
                  </TableCell>
                </TableRow>)}
          </TableBody>
        </Table>
          </div>
        </div>
      )}

      {/* Edit Creative Drawer */}
      <EditCreativeDrawer
        open={isEditDrawerOpen}
        onClose={() => {
          setIsEditDrawerOpen(false);
          setEditingCreative(null);
        }}
        onSuccess={handleUpdateCreativeSuccess}
        creative={editingCreative}
      />

      {/* Preview Dialog */}
      <Dialog open={!!previewCreative} onOpenChange={() => setPreviewCreative(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewCreative?.creative_name}</DialogTitle>
          </DialogHeader>
          {previewCreative && <div className="space-y-4">
              {previewCreative.file_url && <div className="w-full flex items-center justify-center bg-black rounded overflow-hidden" style={{ maxHeight: '500px' }}>
                  {previewCreative.creative_type === "Video" ? <video src={previewCreative.file_url} controls className="w-full h-full object-contain bg-black" style={{ maxHeight: '500px' }} /> : <img src={previewCreative.file_url} alt={previewCreative.creative_name} className="w-full h-full object-contain" style={{ maxHeight: '500px' }} />}
                </div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Campaign</Label>
                  <p className="text-sm">{previewCreative.campaign || "None"}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <p className="text-sm">{previewCreative.creative_type}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p className="text-sm">{previewCreative.status}</p>
                </div>
                <div>
                  <Label>File Size</Label>
                  <p className="text-sm">
                    {previewCreative.file_size_mb?.toFixed(2)} MB
                  </p>
                </div>
                <div>
                  <Label>Dimensions</Label>
                  <p className="text-sm">
                    {previewCreative.format_dimensions || "N/A"}
                  </p>
                </div>
                <div>
                  <Label>Group Type</Label>
                  <p className="text-sm">{previewCreative.creative_group_type}</p>
                </div>
              </div>
              {previewCreative.notes && <div>
                  <Label>Notes</Label>
                  <p className="text-sm">{previewCreative.notes}</p>
                </div>}
            </div>}
        </DialogContent>
      </Dialog>

      {/* Associated Ads Dialog */}
      <Dialog open={associatedAdsDialogOpen} onOpenChange={setAssociatedAdsDialogOpen}>
        <DialogContent className="w-[500px] max-w-[500px] bg-card p-6 shadow-lg">
          <DialogHeader className="mb-4">
            <DialogTitle className="flex items-center gap-2">
              <span>{selectedCreativeName} - Associated Ads</span>
              <Badge variant="outline" className="text-xs">
                {associatedAdsData.length} {associatedAdsData.length === 1 ? 'ad' : 'ads'}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-2">
            {associatedAdsData.map((ad: Ad) => (
              <div 
                key={ad.id} 
                className="p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors border border-border"
                onClick={() => {
                  // Navigate to ads page
                  window.location.href = "/ads";
                  setAssociatedAdsDialogOpen(false);
                }}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm mb-1.5 truncate">
                      {ad.ad_name || 'Untitled Ad'}
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <span className="px-2 py-0.5 bg-muted rounded-[5px] font-medium">
                        {ad.campaign}
                      </span>
                      <span className="px-2 py-0.5 bg-muted rounded-[5px]">
                        {ad.audience_type}
                      </span>
                      <span className="px-2 py-0.5 bg-muted rounded-[5px]">
                        v{ad.version}
                      </span>
                      <Badge 
                        variant={ad.status === "Active" ? "default" : "secondary"}
                        className="text-xs rounded-[5px]"
                      >
                        {ad.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {associatedAdsData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No associated ads found
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Creative"
        description="This will permanently delete this creative and remove it from all associated campaigns and ads."
        itemName={creativeToDelete?.name}
      />
    </PageLayout>
  );
}