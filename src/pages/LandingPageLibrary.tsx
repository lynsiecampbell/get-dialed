import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DrawerPanel } from '@/components/ui/DrawerPanel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, ExternalLink, Megaphone } from 'lucide-react';
import { AssetActions } from '@/components/AssetActions';
import { z } from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageLayout } from '@/components/PageLayout';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { NewLandingPageDrawer } from '@/components/NewLandingPageDrawer';

const landingPageSchema = z.object({
  name: z.string().min(1, 'Landing page name is required'),
  url: z.string().url('Must be a valid URL'),
  campaigns: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

interface LandingPage {
  id: string;
  name: string | null;
  url: string;
  campaigns: string[];
  notes?: string | null;
  created_at: string;
  updated_at: string;
  adCount?: number;
}

export default function LandingPageLibrary() {
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [isNewDrawerOpen, setIsNewDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<LandingPage | null>(null);
  const [availableCampaigns, setAvailableCampaigns] = useState<string[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [campaignFilter, setCampaignFilter] = useState<string[]>([]);
  const [isAdsDrawerOpen, setIsAdsDrawerOpen] = useState(false);
  const [selectedPageForAds, setSelectedPageForAds] = useState<LandingPage | null>(null);
  const [adsForPage, setAdsForPage] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    campaigns: [] as string[],
    notes: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchLandingPages();
    fetchAvailableCampaigns();
  }, [user]);

  const fetchLandingPages = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch landing pages');
      return;
    }

    // Fetch ad count for each landing page
    const pagesWithAdCounts = await Promise.all(
      (data || []).map(async (page) => {
        const { count } = await supabase
          .from('ads')
          .select('*', { count: 'exact', head: true })
          .eq('landing_page_id', page.id)
          .eq('user_id', user.id);
        
        return {
          ...page,
          campaigns: page.campaigns || [],
          adCount: count || 0
        };
      })
    );

    setLandingPages(pagesWithAdCounts);
  };

  const fetchAvailableCampaigns = async () => {
    if (!user) return;

    // Fetch distinct campaign names from campaigns table
    const { data, error } = await supabase
      .from('campaigns')
      .select('name')
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to fetch campaigns:', error);
      return;
    }

    // Get unique campaign names
    const uniqueCampaigns = Array.from(new Set(data?.map(c => c.name) || [])).sort();
    setAvailableCampaigns(uniqueCampaigns);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = landingPageSchema.parse(formData);

      if (editingPage) {
        // Update landing page with campaigns array directly
        const { error } = await supabase
          .from('landing_pages')
          .update({
            name: validatedData.name,
            url: validatedData.url,
            campaigns: validatedData.campaigns,
            notes: validatedData.notes || null,
          })
          .eq('id', editingPage.id)
          .eq('user_id', user!.id);

        if (error) throw error;

        toast.success('✅ Landing page updated successfully');
        setTimeout(() => {
          setEditDrawerOpen(false);
          resetForm();
        }, 2000);
        fetchLandingPages();
        return;
      } else {
        // Insert new landing page with campaigns array
        const { error } = await supabase
          .from('landing_pages')
          .insert([
            {
              user_id: user!.id,
              name: validatedData.name,
              url: validatedData.url,
              campaigns: validatedData.campaigns,
              notes: validatedData.notes || null,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        toast.success('Landing page created successfully');
      }

      fetchLandingPages();
      setEditDrawerOpen(false);
      resetForm();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('Failed to save landing page');
      }
    }
  };

  const handleEdit = (page: LandingPage) => {
    setEditingPage(page);
    setFormData({
      name: page.name || '',
      url: page.url,
      campaigns: page.campaigns || [],
      notes: page.notes || '',
    });
    setEditDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this landing page?')) return;

    const { error } = await supabase
      .from('landing_pages')
      .delete()
      .eq('id', id)
      .eq('user_id', user!.id);

    if (error) {
      toast.error('Failed to delete landing page');
      return;
    }

    toast.success('Landing page deleted successfully');
    fetchLandingPages();
  };

  const handleFieldUpdate = async (id: string, field: string, value: any) => {
    const { error } = await supabase
      .from('landing_pages')
      .update({ [field]: value })
      .eq('id', id)
      .eq('user_id', user!.id);

    if (error) {
      toast.error(`Failed to update ${field}`);
      return;
    }

    fetchLandingPages();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      campaigns: [],
      notes: '',
    });
    setEditingPage(null);
  };

  const toggleCampaign = (campaign: string) => {
    setFormData((prev) => ({
      ...prev,
      campaigns: prev.campaigns.includes(campaign)
        ? prev.campaigns.filter((c) => c !== campaign)
        : [...prev.campaigns, campaign],
    }));
  };

  const filteredPages = landingPages.filter((page) => {
    const matchesSearch =
      !searchFilter ||
      page.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      page.url.toLowerCase().includes(searchFilter.toLowerCase()) ||
      page.notes?.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesCampaign =
      campaignFilter.length === 0 || 
      page.campaigns?.some(campaign => campaignFilter.includes(campaign));

    return matchesSearch && matchesCampaign;
  });
// 
  return (
    <>
      <NewLandingPageDrawer
        open={isNewDrawerOpen}
        onClose={() => setIsNewDrawerOpen(false)}
        onSuccess={() => {
          fetchLandingPages();
        }}
      />


      <PageLayout
        title="Landing Page Library"
        subtitle="Manage landing pages used across your campaigns and ads"
        actions={
          <>
            <Button
              onClick={() => setIsNewDrawerOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Landing Page
            </Button>

            <DrawerPanel
              open={editDrawerOpen}
              onClose={() => {
                setEditDrawerOpen(false);
                resetForm();
              }}
              title="Edit Landing Page"
              footer={
                <div className="flex justify-end gap-3 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditDrawerOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Save Changes
                  </Button>
                </div>
              }
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Landing Page Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Homepage Q1 2024"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">URL *</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com/landing-page"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Associated Campaigns</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between font-normal"
                        type="button"
                      >
                        {formData.campaigns.length > 0
                          ? `${formData.campaigns.length} campaign${formData.campaigns.length > 1 ? 's' : ''} selected`
                          : 'Select campaigns...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[560px] p-0 pointer-events-auto" 
                      align="start"
                      style={{ zIndex: 1500 }}
                    >
                      <div className="max-h-64 overflow-y-auto p-2">
                        {availableCampaigns.length === 0 ? (
                          <p className="text-sm text-muted-foreground p-2">
                            No campaigns available. Create campaigns in the Messaging Matrix or Ads pages first.
                          </p>
                        ) : (
                          availableCampaigns.map((campaign) => (
                            <button
                              key={campaign}
                              type="button"
                              onClick={() => toggleCampaign(campaign)}
                              className={cn(
                                'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer',
                                formData.campaigns.includes(campaign) && 'bg-accent'
                              )}
                            >
                              <div
                                className={cn(
                                  'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                  formData.campaigns.includes(campaign)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'opacity-50'
                                )}
                              >
                                <Check className={cn('h-4 w-4', !formData.campaigns.includes(campaign) && 'invisible')} />
                              </div>
                              {campaign}
                            </button>
                          ))
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add notes about testing, performance, or creative context..."
                    rows={4}
                  />
                </div>
              </form>
            </DrawerPanel>
          </>
        }
      >

      <div className="flex gap-2 items-center mb-3">
        <FilterDropdown
          label="Campaign"
          options={availableCampaigns}
          value={campaignFilter}
          onChange={(val) => setCampaignFilter(Array.isArray(val) ? val : [])}
          multiSelect={true}
          searchable={true}
        />
        
        {campaignFilter.length > 0 && (
          <Button
            variant="ghost"
            onClick={() => setCampaignFilter([])}
            className="ml-auto text-sm text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {filteredPages.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">
            {searchFilter || campaignFilter
              ? 'No landing pages match your filters'
              : 'No landing pages yet. Create your first landing page to get started.'}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">URL</TableHead>
                <TableHead className="font-semibold">Campaigns</TableHead>
                <TableHead className="font-semibold w-[100px]">Ads</TableHead>
                <TableHead className="font-semibold">Notes</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.map((page) => (
                <TableRow key={page.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium align-middle px-4 py-2">
                    {page.name}
                  </TableCell>
                  <TableCell className="align-middle px-4 py-2">
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline text-sm"
                    >
                      <span className="truncate max-w-xs">{page.url}</span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell className="align-middle px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {page.campaigns && page.campaigns.length > 0 ? (
                        page.campaigns.map((campaign) => (
                          <span key={campaign} className="text-xs font-medium px-2.5 py-1 rounded-[5px] bg-muted inline-block">
                            {campaign}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="align-middle px-4 py-2 w-[100px]">
                    <button
                      onClick={() => handleViewAds(page)}
                      disabled={!page.adCount || page.adCount === 0}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-muted rounded-[5px] whitespace-nowrap transition-colors",
                        page.adCount && page.adCount > 0 
                          ? "hover:bg-muted/80 cursor-pointer" 
                          : "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Megaphone className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                      <span className="text-[11px]">
                        {page.adCount || 0} Ad{(page.adCount || 0) !== 1 ? "s" : ""}
                      </span>
                    </button>
                  </TableCell>
                  <TableCell className="align-middle px-4 py-2">
                    {page.notes ? (
                      <div className="bg-muted rounded-[5px] px-3 py-2 text-sm max-w-[300px]">
                        {page.notes}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="align-middle px-4 py-2">
                    <div className="flex items-center justify-end">
                      <AssetActions
                        onEdit={() => handleEdit(page)}
                        onDelete={() => handleDelete(page.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      </PageLayout>
    </>
  );
}
