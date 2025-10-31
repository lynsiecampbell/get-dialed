import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DrawerPanel } from '@/components/ui/DrawerPanel';
import { toast } from 'sonner';
import { Image as ImageIcon, Video, Grid3x3, Search, Filter } from 'lucide-react';

interface Creative {
  id: string;
  name: string;
  creative_type: string;
  campaign: string | null;
  image_urls: string[] | null;
  parent_creative_id: string | null;
  creative_group_type: string;
}

interface CreativePickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (creatives: Creative[]) => void;
  selectedCampaign?: string;
  allowMultiple?: boolean;
}

export function CreativePickerModal({
  open,
  onOpenChange,
  onSelect,
  selectedCampaign,
  allowMultiple = false,
}: CreativePickerModalProps) {
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [filteredCreatives, setFilteredCreatives] = useState<Creative[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(() => 
    sessionStorage.getItem('creativePickerSearch') || ''
  );
  const [loading, setLoading] = useState(true);
  
  // Filter states - load from sessionStorage
  const [campaignFilter, setCampaignFilter] = useState<string>(() =>
    sessionStorage.getItem('creativePickerCampaign') || "all"
  );
  const [typeFilter, setTypeFilter] = useState<string>(() =>
    sessionStorage.getItem('creativePickerType') || "all"
  );
  const [availableCampaigns, setAvailableCampaigns] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);

  // Save filters to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('creativePickerSearch', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    sessionStorage.setItem('creativePickerCampaign', campaignFilter);
  }, [campaignFilter]);

  useEffect(() => {
    sessionStorage.setItem('creativePickerType', typeFilter);
  }, [typeFilter]);

  useEffect(() => {
    if (open) {
      fetchCreatives();
    }
  }, [open]);

  useEffect(() => {
    // Filter creatives based on all filters
    const filtered = creatives.filter(creative => {
      const matchesSearch = creative.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creative.campaign?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCampaign = campaignFilter === "all" || creative.campaign === campaignFilter;
      const matchesType = typeFilter === "all" || creative.creative_type === typeFilter;
      return matchesSearch && matchesCampaign && matchesType;
    });
    setFilteredCreatives(filtered);
  }, [searchQuery, creatives, campaignFilter, typeFilter]);

  const fetchCreatives = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('creatives')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setCreatives(data || []);
      setFilteredCreatives(data || []);
      
      // Extract unique campaigns and types
      const campaigns = [...new Set((data || []).map(c => c.campaign).filter(Boolean))] as string[];
      const types = [...new Set((data || []).map(c => c.creative_type).filter(Boolean))] as string[];
      setAvailableCampaigns(campaigns);
      setAvailableTypes(types);
      
      // Auto-select campaign filter if provided
      if (selectedCampaign && campaigns.includes(selectedCampaign)) {
        setCampaignFilter(selectedCampaign);
      }
    } catch (error: any) {
      toast.error('Failed to fetch creatives');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (creativeId: string) => {
    if (allowMultiple) {
      setSelectedIds(prev =>
        prev.includes(creativeId)
          ? prev.filter(id => id !== creativeId)
          : [...prev, creativeId]
      );
    } else {
      setSelectedIds([creativeId]);
    }
  };

  const handleAttach = () => {
    const selected = creatives.filter(c => selectedIds.includes(c.id));
    onSelect(selected);
    handleClose();
  };

  const handleClose = () => {
    setSelectedIds([]);
    onOpenChange(false);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setCampaignFilter("all");
    setTypeFilter("all");
    sessionStorage.removeItem('creativePickerSearch');
    sessionStorage.removeItem('creativePickerCampaign');
    sessionStorage.removeItem('creativePickerType');
  };

  const getCreativeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'carousel':
        return <Grid3x3 className="h-4 w-4" />;
      default:
        return <ImageIcon className="h-4 w-4" />;
    }
  };

  return (
    <DrawerPanel
      open={open}
      onClose={handleClose}
      title={allowMultiple ? 'Select Creatives' : 'Select Creative'}
      subtitle="Choose creatives from your library to attach to this ad."
      zIndex={1400}
      footer={
        <div className="flex items-center justify-between w-full">
          <p className="text-sm text-muted-foreground">
            {selectedIds.length} selected
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAttach}
              disabled={selectedIds.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              Attach {selectedIds.length > 0 && `(${selectedIds.length})`}
            </Button>
          </div>
        </div>
      }
    >
      {/* Filters Bar */}
      <div className="space-y-3 mb-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search creatives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex gap-2 items-center">
          <Select value={campaignFilter} onValueChange={setCampaignFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Campaign" />
            </SelectTrigger>
            <SelectContent className="z-[1500]">
              <SelectItem value="all">All Campaigns</SelectItem>
              {availableCampaigns.map((campaign) => (
                <SelectItem key={campaign} value={campaign}>
                  {campaign}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Ad Format" />
            </SelectTrigger>
            <SelectContent className="z-[1500]">
              <SelectItem value="all">All Formats</SelectItem>
              {availableTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(campaignFilter !== "all" || typeFilter !== "all" || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading creatives...</p>
          </div>
        ) : filteredCreatives.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground mb-2">No creatives found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filteredCreatives.map((creative) => (
              <div
                key={creative.id}
                className={`relative border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                  selectedIds.includes(creative.id)
                    ? 'ring-2 ring-primary border-primary'
                    : 'border-border'
                }`}
                onClick={() => handleToggleSelect(creative.id)}
              >
                {/* Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selectedIds.includes(creative.id)}
                    onCheckedChange={() => handleToggleSelect(creative.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-background/80 backdrop-blur-sm"
                  />
                </div>

                {/* Image Preview */}
                <div className="aspect-[4/5] bg-black relative overflow-hidden group">
                  {creative.creative_type?.toLowerCase() === "video" && (creative.image_urls?.[0]) ? (
                    <>
                      <video
                        src={creative.image_urls?.[0] || ""}
                        className="w-full h-full object-contain bg-black"
                        muted
                        playsInline
                        loop
                        preload="metadata"
                        onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play().catch(() => {})}
                        onMouseLeave={(e) => {
                          const video = e.currentTarget as HTMLVideoElement;
                          video.pause();
                          video.currentTime = 0;
                        }}
                      />
                      
                      {/* Play indicator overlay */}
                      <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0 pointer-events-none">
                        <div className="bg-black/50 rounded-full p-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-white opacity-90"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </>
                  ) : (
                    <img
                      src={creative.image_urls?.[0] || "/placeholder.svg"}
                      alt={creative.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  )}
                </div>

                {/* Card Content */}
                <div className="p-3 bg-card space-y-2">
                  <p className="font-medium text-sm line-clamp-2 min-h-[40px]">
                    {creative.name}
                  </p>
                  
                  {creative.campaign && (
                    <Badge variant="outline" className="text-xs">
                      {creative.campaign}
                    </Badge>
                  )}
                  
                  <div className="flex flex-wrap gap-1 text-xs">
                    {creative.creative_type && (
                      <Badge variant="secondary" className="text-xs">
                        {creative.creative_type}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DrawerPanel>
  );
}
