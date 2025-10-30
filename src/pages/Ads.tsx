import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { showSuccess, showError } from '@/lib/toast-helpers';
import { toast } from 'sonner';
import { Plus, Copy, Image as ImageIcon, X, LayoutGrid, List, Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { z } from 'zod';
import { format } from 'date-fns';
import { PageLayout } from '@/components/PageLayout';
import { AdDetailsDrawer } from '@/components/AdDetailsDrawer';
import { AdGrid } from '@/components/AdGrid';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { useSort } from '@/hooks/useSort';
import { NewAdDrawer } from '@/components/NewAdDrawer';
import { EditAdDrawer } from '@/components/EditAdDrawer';
import { DeleteConfirmationDialog } from '@/components/shared/DeleteConfirmationDialog';
import { CampaignGroup } from '@/components/CampaignGroup';
import { CampaignSettingsDrawer } from '@/components/CampaignSettingsDrawer';
import { Skeleton } from '@/components/ui/skeleton';

const adSchema = z.object({
  campaign_id: z.string().min(1, 'Campaign is required'),
  audience_type: z.string().min(1, 'Audience type is required'),
  creative_id: z.string().optional(),
  ad_format: z.string().min(1, 'Ad format is required'),
  creative_type: z.string().optional(),
  version: z.string().min(1, 'Version is required'),
  headline: z.string().optional(),
  primary_text: z.string().optional(),
  landing_page_url: z.string().url('Must be a valid URL'),
  status: z.string().default('Draft'),
  medium: z.string().optional(),
  source: z.string().optional(),
});

interface Creative {
  id: string;
  creative_name: string;
  ad_format: string;
  creative_type: string;
  campaign: string | null;
  thumbnail_url: string | null;
  file_url: string | null;
  parent_creative_id: string | null;
  creative_group_type: string;
}

interface Ad {
  id: string;
  campaign_id: string;
  campaign?: string; // campaign name (from join)
  audience_type: string;
  ad_format: string;
  creative_type: string;
  version: string;
  headline: string | null;
  body: string | null; // renamed from primary_text
  cta_label: string | null;
  landing_page_url: string;
  status: "Active" | "Draft" | "Paused" | "Archived";
  creative_id: string | null;
  medium: string | null;
  source: string | null;
  creative_group_id: string | null;
  meta_creative_id: string | null;
  objective: string | null;
  caption: string | null;
  updated_at: string;
  created_at?: string;
  user_id?: string;
  ad_name?: string | null;
  ad_set_name?: string | null;
  landing_page_id?: string | null;
  landing_page_url_with_utm?: string | null;
  utm_link?: string | null;
  attached_creatives?: Creative[];
  landing_page_name?: string | null;
  display_link?: string | null;
}

interface Message {
  id: string;
  campaign: string;
  headline: string | null;
  primary_text: string | null;
}

interface LandingPage {
  id: string;
  url: string;
  name: string | null;
}

export default function Ads() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [uniqueAudiences, setUniqueAudiences] = useState<string[]>([]);
  const [uniqueHeadlines, setUniqueHeadlines] = useState<string[]>([]);
  const [uniquePrimaryTexts, setUniquePrimaryTexts] = useState<string[]>([]);
  const [uniqueLandingPages, setUniqueLandingPages] = useState<string[]>([]);
  const [uniqueCampaigns, setUniqueCampaigns] = useState<string[]>([]);
  const [uniqueMediums, setUniqueMediums] = useState<string[]>([]);
  const [uniqueSources, setUniqueSources] = useState<string[]>([]);
  const [previewAd, setPreviewAd] = useState<Ad | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const saved = sessionStorage.getItem('adsViewMode');
    // Explicitly check for 'list', otherwise default to 'grid'
    return saved === 'list' ? 'list' : 'grid';
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<Ad | null>(null);
  const [selectedCampaignForNewAd, setSelectedCampaignForNewAd] = useState<string | null>(null);
  const [campaignSettingsOpen, setCampaignSettingsOpen] = useState(false);
  const [selectedCampaignForSettings, setSelectedCampaignForSettings] = useState<{ id: string; name: string } | null>(null);
  
  // Filter states
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedCreativeTypes, setSelectedCreativeTypes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const { user } = useAuth();

  // Filter and sort ads
  const filteredAds = ads.filter((ad) => {
    if (selectedCampaigns.length > 0 && !selectedCampaigns.includes(ad.campaign)) return false;
    if (selectedAudiences.length > 0 && !selectedAudiences.includes(ad.audience_type)) return false;
    if (selectedSources.length > 0 && ad.source && !selectedSources.includes(ad.source)) return false;
    if (selectedCreativeTypes.length > 0 && !selectedCreativeTypes.includes(ad.ad_format)) return false;
    if (selectedStatus && ad.status !== selectedStatus) return false;
    return true;
  });

  const { items: sortedAds, requestSort, sortConfig } = useSort(filteredAds, 'updated_at' as keyof Ad, 'desc');

  // Group ads by campaign with campaign ID
  const groupedAds = sortedAds.reduce((acc, ad) => {
    if (!acc[ad.campaign]) {
      acc[ad.campaign] = {
        campaignId: ad.campaign_id,
        ads: []
      };
    }
    acc[ad.campaign].ads.push(ad);
    return acc;
  }, {} as Record<string, { campaignId: string; ads: Ad[] }>);

  // Toggle view mode and persist to sessionStorage
  const toggleViewMode = () => {
    const newMode = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(newMode);
    sessionStorage.setItem('adsViewMode', newMode);
  };

  // Handle duplicate campaign
  const handleDuplicateCampaign = async (campaignName: string) => {
    const campaignData = groupedAds[campaignName];
    if (!campaignData) return;
    
    for (const ad of campaignData.ads) {
      await handleDuplicateAd(ad.id);
    }
    showSuccess(`Campaign "${campaignName}" duplicated`);
  };

  // Handle campaign settings
  const handleCampaignSettings = (campaignName: string) => {
    const campaignData = groupedAds[campaignName];
    if (!campaignData) return;
    
    setSelectedCampaignForSettings({
      id: campaignData.campaignId,
      name: campaignName
    });
    setCampaignSettingsOpen(true);
  };

  // Handle export ads for Meta Ads Manager
  const handleExportAds = async (campaignName?: string) => {
    const adsToExport = campaignName 
      ? sortedAds.filter(ad => ad.campaign === campaignName)
      : sortedAds;

    if (adsToExport.length === 0) {
      showError('No ads found for export');
      return;
    }

    // Fetch campaign-level data for the campaigns being exported
    const campaignNames = Array.from(new Set(adsToExport.map(ad => ad.campaign)));
    const { data: campaignsData } = await supabase
      .from('campaigns')
      .select('*')
      .in('name', campaignNames)
      .eq('user_id', user!.id);

    const campaignsMap = new Map(campaignsData?.map(c => [c.name, c]) || []);

    // Check for missing campaign settings
    const campaignsWithMissingSettings = campaignNames.filter(name => {
      const campaign = campaignsMap.get(name);
      return !campaign?.objective || !campaign?.status;
    });

    if (campaignsWithMissingSettings.length > 0) {
      showError(`Please complete Campaign Settings for: ${campaignsWithMissingSettings.join(', ')}. Click the settings icon (⚙️) next to the campaign name.`);
      return;
    }

    // Validate required ad-level fields
    const missingFieldsAds = adsToExport.filter(ad => 
      !ad.campaign ||
      !ad.audience_type ||
      !ad.headline ||
      !ad.body ||
      !ad.cta_label
    );

    if (missingFieldsAds.length > 0) {
      showError('Some ads are missing headlines, body text, or CTAs. Please review before exporting.');
      return;
    }

    // Validate destination URLs
    const adsWithoutUrls = adsToExport.filter(ad => 
      !ad.landing_page_url_with_utm && !ad.landing_page_url
    );

    if (adsWithoutUrls.length > 0) {
      showError('⚠️ Some ads are missing destination URLs. These will be skipped in the export.');
      return;
    }

    // Helper: Map Dialed Campaign Objectives → Meta-Compatible
    const mapCampaignObjective = (objective: string | undefined | null): string => {
      const mapping: Record<string, string> = {
        "Awareness": "Outcome Awareness",
        "Traffic": "Traffic",
        "Engagement": "Outcome Engagement",
        "Leads": "Outcome Leads",
        "Sales": "Outcome Sales",
        "App Promotion": "App Promotion"
      };
      return objective ? (mapping[objective] || "Outcome Awareness") : "Outcome Awareness";
    };

    // Helper: Map Dialed Status → Meta-Compatible
    const mapStatus = (status: string | undefined | null): string => {
      const statusMapping: Record<string, string> = {
        "Draft": "PAUSED",
        "Active": "ACTIVE",
        "Paused": "PAUSED",
        "Archived": "ARCHIVED"
      };
      return status ? (statusMapping[status] || "ACTIVE") : "ACTIVE";
    };

    // Helper: Map Dialed CTAs → Meta-Compatible
    const mapCTA = (cta: string | undefined | null): string => {
      const ctaMapping: Record<string, string> = {
        "Book Now": "BOOK_NOW",
        "Contact Us": "CONTACT_US",
        "Download": "DOWNLOAD",
        "Get Offer": "GET_OFFER",
        "Learn More": "LEARN_MORE",
        "Shop Now": "SHOP_NOW",
        "Sign Up": "SIGN_UP"
      };
      return cta ? (ctaMapping[cta] || "") : "";
    };

    // Helper: Collect creative filenames to include in ZIP
    const creativeFiles = new Set<string>();

    // Meta Import CSV Headers (matches Meta Ads Manager format exactly)
    const headers = [
      'Campaign Name',
      'Campaign Status',
      'Campaign Objective',
      'Buying Type',
      'Campaign Start Time',
      'Campaign Stop Time',
      'Campaign Daily Budget',
      'Ad Set Name',
      'Ad Set Run Status',
      'Optimization Goal',
      'Billing Event',
      'Ad Name',
      'Ad Status',
      'Creative Type',
      'Title',
      'Body',
      'Call to Action',
      'Link',
      'Display Link',
      'Image File Name',
      'Video ID'
    ];

    const rows = adsToExport.map(ad => {
      const campaign = campaignsMap.get(ad.campaign!);
      
      // Truncate names to 35 characters for Meta
      const truncate = (str: string, maxLen: number = 35) => 
        str.length > maxLen ? str.substring(0, maxLen) : str;

      // Format dates for Meta (YYYY-MM-DD HH:mm:ss)
      const formatMetaDate = (date: string | Date | null | undefined) => {
        if (!date) return '';
        try {
          return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
        } catch {
          return '';
        }
      };

      // Get creative file info and collect for ZIP
      const firstCreative = ad.attached_creatives?.[0];
      const isVideo = ad.ad_format === 'Video';
      // Use actual filename from URL (with extension) for Meta import compatibility
      const imageFileName = !isVideo && firstCreative?.file_url
        ? firstCreative.file_url.split('/').pop() || '' 
        : '';
      const videoId = isVideo && firstCreative?.file_url 
        ? firstCreative.id || '' 
        : '';

      // Collect creative files for ZIP
      if (imageFileName && firstCreative?.file_url) {
        creativeFiles.add(firstCreative.file_url);
      }
      if (videoId && firstCreative?.file_url) {
        creativeFiles.add(firstCreative.file_url);
      }

      // Cleaned Ad Name logic - use stored name with cleanup
      let adName = ad.ad_name || "Untitled Ad";
      
      // Cleanup regex: remove trailing pipes/spaces and collapse multiple spaces
      adName = adName
        .replace(/\s*\|\s*$/g, "")    // remove trailing pipes
        .replace(/\s{2,}/g, " ")      // collapse multiple spaces
        .trim();

      // Map status values for consistent export
      const mappedStatus = mapStatus(ad.status);

      return [
        truncate(ad.campaign || ''),                                    // Campaign Name
        mappedStatus,                                                   // Campaign Status (mapped)
        mapCampaignObjective(campaign?.objective),                      // Campaign Objective (mapped)
        'AUCTION',                                                       // Buying Type (default)
        formatMetaDate(campaign?.start_date),                           // Campaign Start Time
        formatMetaDate(campaign?.end_date),                             // Campaign Stop Time
        campaign?.daily_budget || '',                                    // Campaign Daily Budget (numeric only)
        truncate(ad.ad_set_name || ad.audience_type),                   // Ad Set Name
        mappedStatus,                                                   // Ad Set Run Status (same as Campaign/Ad Status)
        (campaign?.objective === 'Leads' || campaign?.objective === 'Sales') ? 'OFFSITE_CONVERSIONS' : 'LINK_CLICKS', // Optimization Goal
        'IMPRESSIONS',                                                  // Billing Event (Meta default)
        adName,                                                         // Ad Name (cleaned, no truncation)
        mappedStatus,                                                   // Ad Status (same as Campaign/Ad Set Status)
        ad.creative_type || 'Page Post Ad',                             // Creative Type (defaults to Page Post Ad)
        ad.headline || '',                                              // Title
        ad.body || '',                                                  // Body
        mapCTA(ad.cta_label),                                           // Call to Action (mapped to Meta format)
        (ad as any).landing_page_url_with_utm || '',                    // Link (UTM URL)
        ad.display_link || '',                                          // Display Link (vanity domain)
        imageFileName,                                                  // Image File Name
        videoId                                                         // Video ID
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create ZIP file with CSV and creative assets
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    const today = format(new Date(), 'yyyyMMdd');
    const csvFileName = campaignName 
      ? `${campaignName.replace(/\s+/g, '_')}_Meta_Export_${today}.csv`
      : `All_Ads_Meta_Export_${today}.csv`;
    
    // Add CSV to ZIP
    zip.file(csvFileName, csvContent);

    // Add creative files to ZIP
    if (creativeFiles.size > 0) {
      toast.info(`Packaging ${creativeFiles.size} creative file(s)...`);
      
      for (const fileUrl of creativeFiles) {
        try {
          const response = await fetch(fileUrl);
          const blob = await response.blob();
          const fileName = fileUrl.split('/').pop() || 'creative';
          zip.file(`creatives/${fileName}`, blob);
        } catch (error) {
          console.error(`Failed to fetch creative: ${fileUrl}`, error);
        }
      }
    }

    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(zipBlob);
    const zipFileName = campaignName 
      ? `${campaignName.replace(/\s+/g, '_')}_Meta_Import_Package_${today}.zip`
      : `All_Ads_Meta_Import_Package_${today}.zip`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', zipFileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const filesMsg = creativeFiles.size > 0 
      ? ` with ${creativeFiles.size} creative file(s)` 
      : '';
    showSuccess(`✅ Meta export package created successfully${filesMsg}. Downloading now.`);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchAds(),
        fetchMessages(),
        fetchLandingPages()
      ]);
      setIsLoading(false);
    };
    
    if (user) {
      loadData();
    }
  }, [user]);

  const fetchAds = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('ads')
      .select(`
        *,
        campaigns!inner(name),
        messaging (
          headlines,
          body_copy,
          ctas
        )
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      showError('Failed to fetch ads');
      return;
    }

    // Fetch attached creatives and landing page names for each ad
    if (data) {
      const adsWithCreatives = await Promise.all(
        data.map(async (ad: any) => {
          const { data: adCreatives } = await supabase
            .from('ad_creatives')
            .select('creative_id, creatives(*)')
            .eq('ad_id', ad.id)
            .order('position');

          const attached_creatives = adCreatives?.map(ac => ac.creatives).filter(Boolean) || [];
          
          // Fetch landing page name if landing_page_id exists
          let landing_page_name = null;
          console.log('Ad landing_page_id:', ad.landing_page_id, 'URL:', ad.landing_page_url);
          
          if (ad.landing_page_id) {
            const { data: lpData } = await supabase
              .from('landing_pages')
              .select('name')
              .eq('id', ad.landing_page_id)
              .single();
            landing_page_name = lpData?.name || null;
            console.log('Fetched landing page name by ID:', landing_page_name);
          } else if (ad.landing_page_url) {
            // Try to match by URL if no ID is set
            const { data: lpData } = await supabase
              .from('landing_pages')
              .select('name')
              .eq('url', ad.landing_page_url)
              .eq('user_id', user.id)
              .maybeSingle();
            landing_page_name = lpData?.name || null;
            console.log('Fetched landing page name by URL:', landing_page_name);
          }
          
          return { 
            ...ad,
            campaign: ad.campaigns?.name || '', // Extract campaign name from join
            attached_creatives, 
            landing_page_name,
            status: ad.status as "Active" | "Draft" | "Paused" | "Archived" 
          };
        })
      );
      setAds(adsWithCreatives);
    }

    // Extract unique values for dropdowns
    const audiences = [...new Set(data?.map(ad => ad.audience_type).filter(Boolean) || [])];
    const headlines = [...new Set(data?.map(ad => ad.headline).filter(Boolean) || [])];
    const primaryTexts = [...new Set(data?.map((ad: any) => ad.body).filter(Boolean) || [])];
    const landingPages = [...new Set(data?.map((ad: any) => ad.landing_page_url).filter(Boolean) || [])];
    const mediums = [...new Set(data?.map((ad: any) => ad.medium).filter(Boolean) || [])];
    const sources = [...new Set(data?.map((ad: any) => ad.source).filter(Boolean) || [])];
    
    setUniqueAudiences(audiences);
    setUniqueHeadlines(headlines);
    setUniquePrimaryTexts(primaryTexts);
    setUniqueLandingPages(landingPages);
    setUniqueMediums(mediums);
    setUniqueSources(sources);
  };

  const fetchMessages = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('campaigns')
      .select('id, name, messaging')
      .eq('user_id', user.id);

    if (error) {
      showError('Failed to fetch messages');
      return;
    }

    // Transform campaign messaging to message format
    const transformedMessages: typeof messages = [];
    data?.forEach(campaign => {
      const messaging = campaign.messaging as any;
      const adMessaging = messaging?.adMessaging || {};
      
      // Add headlines
      (adMessaging.headlines || []).forEach((headline: string, index: number) => {
        if (headline) {
          transformedMessages.push({
            id: `${campaign.id}-headline-${index}`,
            campaign: campaign.name,
            headline,
            primary_text: null
          });
        }
      });
      
      // Add primary texts
      (adMessaging.primaryTexts || []).forEach((primaryText: string, index: number) => {
        if (primaryText) {
          transformedMessages.push({
            id: `${campaign.id}-primary-${index}`,
            campaign: campaign.name,
            headline: null,
            primary_text: primaryText
          });
        }
      });
    });

    setMessages(transformedMessages);
    
    // Extract unique campaigns from campaigns table
    const { data: campaignData } = await supabase
      .from('campaigns')
      .select('name')
      .eq('user_id', user.id)
      .order('name');
    
    const campaignNames = campaignData?.map(c => c.name) || [];
    setUniqueCampaigns(campaignNames);
  };

  const fetchLandingPages = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      showError('Failed to fetch landing pages');
      return;
    }

    setLandingPages(data || []);
  };

  const generateUTM = (
    landingPage: string,
    source: string,
    medium: string,
    campaign: string,
    version: string,
    audience: string
  ) => {
    if (!landingPage) return '';
    
    const baseUrl = landingPage.trim();
    const hasQuery = baseUrl.includes('?');
    const separator = hasQuery ? '&' : '?';
    
    const params: string[] = [];
    
    if (source) params.push(`utm_source=${source.replace(/\s+/g, '_')}`);
    if (medium) params.push(`utm_medium=${medium.replace(/\s+/g, '_')}`);
    if (campaign) params.push(`utm_campaign=${campaign.replace(/\s+/g, '_')}`);
    if (version) {
      // Add 'v' prefix if not already present
      const versionValue = version.startsWith('v') ? version : `v${version}`;
      params.push(`utm_version=${versionValue.replace(/\s+/g, '_')}`);
    }
    if (audience) params.push(`utm_audience=${audience.replace(/\s+/g, '_')}`);
    
    if (params.length === 0) return baseUrl;
    
    return `${baseUrl}${separator}${params.join('&')}`.toLowerCase();
  };


  const handleEdit = async (ad: Ad) => {
    setEditingAd(ad);
  };

  const handleStatusChange = async (adId: string, newStatus: string) => {
    const { error } = await supabase
      .from('ads')
      .update({ status: newStatus })
      .eq('id', adId)
      .eq('user_id', user!.id);

    if (error) {
      showError('Failed to update status');
      return;
    }

    showSuccess('Status updated');
    fetchAds();
  };

  const handleFieldUpdate = async (adId: string, field: string, value: string) => {
    // Get the current ad to have all its data
    const currentAd = ads.find(a => a.id === adId);
    if (!currentAd) return;

    // Prepare updated ad data
    const updatedData: any = { [field]: value };

    // If any UTM-related field is updated, regenerate the UTM link
    const utmFields = ['landing_page_url', 'source', 'medium', 'campaign_id', 'version', 'audience_type'];
    if (utmFields.includes(field)) {
      const newValues = {
        landing_page_url: field === 'landing_page_url' ? value : currentAd.landing_page_url,
        source: field === 'source' ? value : (currentAd.source || ''),
        medium: field === 'medium' ? value : (currentAd.medium || ''),
        campaign: field === 'campaign' ? value : (currentAd.campaign || ''),
        version: field === 'version' ? value : currentAd.version,
        audience_type: field === 'audience_type' ? value : currentAd.audience_type,
      };

      // Generate new UTM link
      const utmLink = generateUTM(
        newValues.landing_page_url,
        newValues.source,
        newValues.medium,
        newValues.campaign,
        newValues.version,
        newValues.audience_type
      );
      
      updatedData.utm_link = utmLink;
    }

    const { error } = await supabase
      .from('ads')
      .update(updatedData)
      .eq('id', adId)
      .eq('user_id', user!.id);

    if (error) {
      showError(`Couldn't save changes — check required fields.`);
      return;
    }

    showSuccess('Changes saved');
    fetchAds();
  };

  const handleDelete = async (ad: Ad) => {
    setAdToDelete(ad);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!adToDelete) return;

    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('id', adToDelete.id)
      .eq('user_id', user!.id);

    if (error) {
      showError('Something went wrong. Please try again.');
      return;
    }

    showSuccess('Ad deleted');
    setDeleteDialogOpen(false);
    setAdToDelete(null);
    fetchAds();
  };

  const handleDuplicateAd = async (adId: string) => {
    try {
      // 1. Fetch the original ad with campaign name
      const { data: originalAd, error: fetchError } = await supabase
        .from('ads')
        .select(`
          *,
          campaigns!inner(name),
        messaging (
          headlines,
          body_copy,
          ctas
        )
        `)
        .eq('id', adId)
        .single();

      if (fetchError || !originalAd) {
        console.error(fetchError);
        showError('Something went wrong. Please try again.');
        return;
      }

      // Extract campaign name from join
      const campaignName = (originalAd as any).campaigns?.name || '';
      const adWithCampaign = {
        ...originalAd,
        campaign: campaignName
      };

      // 2. Calculate the next version number for this campaign/audience/creative combo
      const { data: existingAds } = await supabase
        .from('ads')
        .select('ad_name, version')
        .eq('campaign_id', (originalAd as any).campaign_id)
        .eq('audience_type', (originalAd as any).audience_type)
        .eq('creative_type', (originalAd as any).creative_type)
        .eq('user_id', user!.id);

      // Find the highest version number
      let maxVersion = 0;
      existingAds?.forEach(ad => {
        const versionMatch = ad.version?.match(/^v?(\d+)$/i);
        if (versionMatch) {
          const versionNum = parseInt(versionMatch[1]);
          if (versionNum > maxVersion) {
            maxVersion = versionNum;
          }
        }
      });

      const nextVersion = `v${maxVersion + 1}`;
      const newAdName = `${campaignName} | ${(originalAd as any).audience_type} | Page Post Ad | ${nextVersion}`;

      // 3. Remove fields that shouldn't be duplicated
      const { id, created_at, updated_at, campaigns, ...adData } = originalAd as any;

      // 4. If landing_page_id is missing but landing_page_url exists, try to find and set it
      let landing_page_id = adData.landing_page_id;
      if (!landing_page_id && adData.landing_page_url && user) {
        const { data: lpData } = await supabase
          .from('landing_pages')
          .select('id')
          .eq('url', adData.landing_page_url)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (lpData) {
          landing_page_id = lpData.id;
        }
      }

      // 5. Create the new ad
      const newAd = {
        ...adData,
        ad_name: newAdName,
        version: nextVersion,
        status: 'Draft',
        landing_page_id,
      };

      // 6. Insert into Supabase
      const { data: insertedAd, error: insertError } = await supabase
        .from('ads')
        .insert([newAd])
        .select()
        .single();

      if (insertError || !insertedAd) {
        console.error(insertError);
        showError('Something went wrong. Please try again.');
        return;
      }

      // 7. Duplicate ad_creatives associations
      const { data: originalAdCreatives } = await supabase
        .from('ad_creatives')
        .select('creative_id, position')
        .eq('ad_id', adId);

      if (originalAdCreatives && originalAdCreatives.length > 0) {
        const newAdCreatives = originalAdCreatives.map(ac => ({
          ad_id: insertedAd.id,
          creative_id: ac.creative_id,
          position: ac.position,
        }));
        
        await supabase.from('ad_creatives').insert(newAdCreatives);
      }

      // 8. Refresh ads and open in edit mode
      await fetchAds();
      setEditingAd(insertedAd as Ad);
      showSuccess(`Ad duplicated as ${nextVersion}`);
    } catch (err) {
      console.error(err);
      showError('Something went wrong. Please try again.');
    }
  };

  const copyUTM = (ad: Ad) => {
    const utm = ad.utm_link || generateUTM(
      ad.landing_page_url,
      ad.source || '',
      ad.medium || '',
      ad.campaign,
      ad.version,
      ad.audience_type
    );
    navigator.clipboard.writeText(utm);
    showSuccess('Link copied to clipboard');
  };

  const handleUtmClick = (ad: Ad, event: React.MouseEvent) => {
    const utm = ad.utm_link || generateUTM(
      ad.landing_page_url,
      ad.source || '',
      ad.medium || '',
      ad.campaign,
      ad.version,
      ad.audience_type
    );
    
    if (event.shiftKey) {
      window.open(utm, '_blank');
    } else {
      navigator.clipboard.writeText(utm);
      showSuccess('Link copied to clipboard');
    }
  };

  const getAdSetName = (campaign: string, audienceType: string) => {
    return `${campaign} - ${audienceType}`;
  };

  const getAdName = (campaign: string, audienceType: string, creativeType: string, version: string) => {
    return `${campaign} - ${audienceType} - ${creativeType} - ${version}`;
  };


  // Get unique campaign and source values from ads
  const campaignsFromAds = uniqueCampaigns; // Use all campaigns from campaigns table
  const audiencesFromAds = [...new Set(ads.map(ad => ad.audience_type))];
  const sourcesFromAds = [...new Set(ads.map(ad => ad.source).filter(Boolean))] as string[];
  const creativeTypesFromAds = [...new Set(ads.map(ad => ad.creative_type))];

  return (
    <>
      <PageLayout
        title="Ads"
        subtitle="Build and manage your ad campaigns"
        actions={
        <>
          <Button onClick={() => {
            setIsDialogOpen(true);
          }} className="inline-flex items-center justify-center gap-1 px-4 py-2">
            <Plus className="h-4 w-4" />
            New Ad
          </Button>
          
        </>
      }
    >

      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-28" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-32 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : ads.length === 0 ? (
        <div className="border border-border rounded-lg bg-card">
          <div className="flex flex-col items-center justify-center py-12">
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Ad
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Filters and View Toggle */}
          <div className="flex items-center justify-between mb-3 gap-4">
            <div className="flex gap-2 items-center flex-wrap">
              <FilterDropdown
                label="Status"
                options={['Draft', 'Active', 'Paused', 'Archived']}
                value={selectedStatus}
                onChange={(val) => setSelectedStatus(typeof val === 'string' ? val : '')}
                multiSelect={false}
              />
              <FilterDropdown
                label="Campaign"
                options={campaignsFromAds}
                value={selectedCampaigns}
                onChange={(val) => setSelectedCampaigns(Array.isArray(val) ? val : [])}
                multiSelect={true}
                searchable={true}
              />
              <FilterDropdown
                label="Platform"
                options={sourcesFromAds}
                value={selectedSources}
                onChange={(val) => setSelectedSources(Array.isArray(val) ? val : [])}
                multiSelect={true}
              />
              <FilterDropdown
                label="Audience Type"
                options={audiencesFromAds}
                value={selectedAudiences}
                onChange={(val) => setSelectedAudiences(Array.isArray(val) ? val : [])}
                multiSelect={true}
              />
              <FilterDropdown
                label="Ad Format"
                options={creativeTypesFromAds}
                value={selectedCreativeTypes}
                onChange={(val) => setSelectedCreativeTypes(Array.isArray(val) ? val : [])}
                multiSelect={true}
              />
              
              {(selectedCampaigns.length > 0 || selectedAudiences.length > 0 || selectedSources.length > 0 || selectedCreativeTypes.length > 0 || selectedStatus) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedCampaigns([]);
                    setSelectedAudiences([]);
                    setSelectedSources([]);
                    setSelectedCreativeTypes([]);
                    setSelectedStatus('');
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <ToggleGroup
                type="single" 
                value={viewMode} 
                onValueChange={(value) => {
                  if (value === 'grid' || value === 'list') {
                    setViewMode(value);
                    sessionStorage.setItem('adsViewMode', value);
                  }
                }}
                className="border border-border rounded-md"
              >
                <ToggleGroupItem 
                  value="grid" 
                  aria-label="Grid view" 
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="list" 
                  aria-label="List view" 
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Grouped View */}
          {viewMode === 'grid' && (
            <div className="animate-fade-in space-y-4">
              {Object.entries(groupedAds).map(([campaignName, campaignData]) => {
                const uniqueAudiences = new Set(campaignData.ads.map(ad => ad.audience_type));
                const uniqueFormats = new Set(campaignData.ads.map(ad => ad.creative_type));
                
                return (
                  <CampaignGroup
                    key={campaignName}
                    campaignName={campaignName}
                    campaignId={campaignData.campaignId}
                    campaignType="content"
                    adCount={campaignData.ads.length}
                    audienceCount={uniqueAudiences.size}
                    formatCount={uniqueFormats.size}
                    defaultOpen={false}
                    onNewAd={() => {
                      setSelectedCampaignForNewAd(campaignName);
                      setIsDialogOpen(true);
                    }}
                    onDuplicateCampaign={() => handleDuplicateCampaign(campaignName)}
                    onExportAds={() => handleExportAds(campaignName)}
                    onCampaignSettings={() => handleCampaignSettings(campaignName)}
                  >
                    <AdGrid
                      ads={campaignData.ads as any}
                      onEdit={handleEdit}
                      onDuplicate={handleDuplicateAd}
                      onDelete={(id) => {
                        const ad = ads.find(a => a.id === id);
                        if (ad) handleDelete(ad);
                      }}
                      onView={(ad) => setPreviewAd(ad as Ad)}
                    />
                  </CampaignGroup>
                );
              })}
            </div>
          )}

          {/* Grouped List View */}
          {viewMode === 'list' && (
            <div className="animate-fade-in space-y-4">
              {Object.entries(groupedAds).map(([campaignName, campaignData]) => {
                const uniqueAudiences = new Set(campaignData.ads.map(ad => ad.audience_type));
                const uniqueFormats = new Set(campaignData.ads.map(ad => ad.creative_type));
                
                return (
                  <CampaignGroup
                    key={campaignName}
                    campaignName={campaignName}
                    campaignId={campaignData.campaignId}
                    campaignType="content"
                    adCount={campaignData.ads.length}
                    audienceCount={uniqueAudiences.size}
                    formatCount={uniqueFormats.size}
                    defaultOpen={false}
                    onNewAd={() => {
                      setSelectedCampaignForNewAd(campaignName);
                      setIsDialogOpen(true);
                    }}
                    onDuplicateCampaign={() => handleDuplicateCampaign(campaignName)}
                    onExportAds={() => handleExportAds(campaignName)}
                    onCampaignSettings={() => handleCampaignSettings(campaignName)}
                  >
                    <div className="border border-border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table style={{ minWidth: "1400px" }}>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="text-sm font-medium text-gray-600">Status</TableHead>
                              <TableHead className="text-sm font-medium text-gray-600">Creative</TableHead>
                              <TableHead className="text-sm font-medium text-gray-600">Ad Name</TableHead>
                              <TableHead className="text-sm font-medium text-gray-600">Source</TableHead>
                              <TableHead className="text-sm font-medium text-gray-600">Medium</TableHead>
                              <TableHead className="text-sm font-medium text-gray-600">Audience</TableHead>
                              <TableHead className="text-sm font-medium text-gray-600">Version</TableHead>
                              <TableHead className="text-sm font-medium text-gray-600">Ad Format</TableHead>
                              <TableHead className="text-sm font-medium text-gray-600">Updated</TableHead>
                              <TableHead className="text-sm font-medium text-gray-600 text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {campaignData.ads.map((ad) => (
                              <TableRow key={ad.id} className="hover:bg-gray-50 transition-colors">
                                <TableCell className="px-4 py-3">
                                  <Badge status={ad.status.toLowerCase() as "active" | "draft" | "paused" | "archived"} dot>{ad.status}</Badge>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  {ad.attached_creatives && ad.attached_creatives.length > 0 ? (
                                    <div className="relative w-32 h-24 group">
                                      {ad.attached_creatives[0].creative_type === 'Video' && (ad.attached_creatives[0].thumbnail_url || ad.attached_creatives[0].file_url) ? (
                                        <>
                                          <video
                                            src={ad.attached_creatives[0].file_url || ''}
                                            poster={ad.attached_creatives[0].thumbnail_url || undefined}
                                            muted
                                            playsInline
                                            loop
                                            preload="metadata"
                                            className="w-full h-full object-contain bg-gray-50 rounded-md border border-gray-200"
                                            onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play().catch(() => {})}
                                            onMouseLeave={(e) => {
                                              const video = e.currentTarget as HTMLVideoElement;
                                              video.pause();
                                              video.currentTime = 0;
                                            }}
                                          />
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                                              <div className="w-0 h-0 border-l-8 border-t-4 border-b-4 border-l-gray-800 border-t-transparent border-b-transparent ml-0.5" />
                                            </div>
                                          </div>
                                        </>
                                      ) : ad.attached_creatives[0].thumbnail_url || ad.attached_creatives[0].file_url ? (
                                        <img
                                          src={ad.attached_creatives[0].thumbnail_url || ad.attached_creatives[0].file_url || ''}
                                          alt={ad.attached_creatives[0].creative_name}
                                          className="w-full h-full object-contain bg-gray-50 rounded-md border border-gray-200"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center">
                                          <ImageIcon className="h-6 w-6 text-gray-400" />
                                        </div>
                                      )}
                                      {ad.attached_creatives.length > 1 && (
                                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                                          +{ad.attached_creatives.length - 1}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 text-sm">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="px-4 py-3 min-w-[250px]">
                                  {ad.ad_name ? (
                                    <div className="text-gray-900 font-medium break-words">
                                      {ad.ad_name}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 text-sm">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  {ad.source ? <Badge platform={ad.source.toLowerCase() as any}>{ad.source}</Badge> : <span className="text-gray-400 text-sm">—</span>}
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  {ad.medium ? <Badge medium={ad.medium.toLowerCase().replace(/ /g, "-") as any}>{ad.medium}</Badge> : <span className="text-gray-400 text-sm">—</span>}
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <Badge audience={ad.audience_type.toLowerCase().replace(/ /g, "-") as any}>{ad.audience_type}</Badge>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <span className="text-sm text-gray-700">
                                    {ad.version.startsWith('v') ? ad.version : `v${ad.version}`}
                                  </span>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <Badge type={ad.creative_type.toLowerCase() as any}>{ad.creative_type}</Badge>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <div className="text-sm text-gray-700 flex items-center gap-1.5 whitespace-nowrap">
                                    <Clock className="h-3.5 w-3.5 text-gray-500" />
                                    {format(new Date(ad.updated_at), "MMM d, yyyy")}
                                  </div>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <div className="flex items-center justify-end">
                                    <ActionButtons
                                      onEdit={() => handleEdit(ad)}
                                      onDuplicate={() => handleDuplicateAd(ad.id)}
                                      onView={() => setPreviewAd(ad)}
                                      onDelete={() => handleDelete(ad)}
                                    />
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CampaignGroup>
                );
              })}
            </div>
          )}
        </>
      )}


      <AdDetailsDrawer
        ad={previewAd}
        open={previewAd !== null}
        onClose={() => setPreviewAd(null)}
        onEdit={() => previewAd && handleEdit(previewAd)}
        onDuplicate={() => previewAd && handleDuplicateAd(previewAd.id)}
        onDelete={() => previewAd && handleDelete(previewAd)}
      />
      </PageLayout>

      <NewAdDrawer
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedCampaignForNewAd(null);
        }}
        onSuccess={() => {
          fetchAds();
          setIsDialogOpen(false);
        }}
      />

      <EditAdDrawer
        open={editingAd !== null}
        onClose={() => setEditingAd(null)}
        ad={editingAd}
        onSuccess={() => {
          setEditingAd(null);
          fetchAds();
        }}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Ad?"
        description="This will permanently delete this ad and remove all associated data."
        itemName={adToDelete?.ad_name || adToDelete?.campaign}
      />

      <CampaignSettingsDrawer
        open={campaignSettingsOpen}
        onClose={() => {
          setCampaignSettingsOpen(false);
          setSelectedCampaignForSettings(null);
        }}
        campaignId={selectedCampaignForSettings?.id || null}
        campaignName={selectedCampaignForSettings?.name || null}
        onSuccess={() => {
          fetchAds();
        }}
      />
    </>
  );
}
