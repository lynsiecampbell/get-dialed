import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Copy, Image as ImageIcon, X, Calendar } from "lucide-react";
import { CreativePickerModal } from "@/components/CreativePickerModal";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";

interface SocialPost {
  id: string;
  post_id: string;
  status: string;
  platform: string;
  campaign: string | null;
  creative_id: string | null;
  copy: string | null;
  utm_link: string | null;
  scheduled_date: string | null;
  posted_url: string | null;
  notes: string | null;
  creative?: {
    id: string;
    creative_name: string;
    thumbnail_url: string | null;
    file_url: string | null;
    creative_type: string;
  };
}

export default function Social() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [showCreativePicker, setShowCreativePicker] = useState(false);
  const [selectedCreative, setSelectedCreative] = useState<any>(null);
  const [landingPages, setLandingPages] = useState<any[]>([]);
  const [messagingMatrix, setMessagingMatrix] = useState<any[]>([]);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [showNewLandingPage, setShowNewLandingPage] = useState(false);

  const [formData, setFormData] = useState({
    status: "Draft",
    platform: "",
    campaign: "",
    copy: "",
    landing_page_url: "",
    landing_page_id: "",
    scheduled_date: "",
    posted_url: "",
    notes: "",
  });

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchCampaigns();
      fetchLandingPages();
    }
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, name, messaging")
        .order("name");

      if (error) throw error;
      
      // Transform campaign messaging to flat structure for dropdown
      const transformedMessages: typeof messagingMatrix = [];
      data?.forEach(campaign => {
        const messaging = campaign.messaging as any;
        const adMessaging = messaging?.adMessaging || {};
        
        // Add headlines
        (adMessaging.headlines || []).forEach((headline: string, index: number) => {
          if (headline) {
            transformedMessages.push({
              id: `${campaign.id}-headline-${index}`,
              campaign: campaign.name,
              primary_text: null,
              headline
            });
          }
        });
        
        // Add primary texts
        (adMessaging.primaryTexts || []).forEach((primaryText: string, index: number) => {
          if (primaryText) {
            transformedMessages.push({
              id: `${campaign.id}-primary-${index}`,
              campaign: campaign.name,
              primary_text: primaryText,
              headline: null
            });
          }
        });
      });
      
      setMessagingMatrix(transformedMessages);
    } catch (error: any) {
      console.error("Error fetching campaigns:", error);
    }
  };

  const fetchLandingPages = async () => {
    try {
      const { data, error } = await supabase
        .from("landing_pages")
        .select("id, name, url")
        .order("name");

      if (error) throw error;
      setLandingPages(data || []);
    } catch (error: any) {
      console.error("Error fetching landing pages:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("social_posts")
        .select(`
          *,
          creative:creatives(id, creative_name, thumbnail_url, file_url, creative_type)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching posts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateUTMLink = (landingPage: string, platform: string, campaign: string) => {
    if (!landingPage || !platform) return "";

    const hasQuery = landingPage.includes("?");
    const separator = hasQuery ? "&" : "?";
    
    let utm = `${landingPage}${separator}utm_source=${platform.toLowerCase()}&utm_medium=organic_social`;
    
    if (campaign) {
      utm += `&utm_campaign=${campaign.replace(/\s+/g, "_").toLowerCase()}`;
    }
    
    return utm;
  };

  const generatePostId = () => {
    const count = posts.length + 1;
    return `social_${String(count).padStart(3, "0")}`;
  };

  const handleCampaignChange = (value: string) => {
    if (value === "new") {
      setShowNewCampaign(true);
      setFormData({ ...formData, campaign: "", copy: "" });
    } else if (value === "none") {
      setFormData({ ...formData, campaign: "", copy: "" });
      setShowNewCampaign(false);
    } else {
      // value is the messaging matrix ID
      const selectedMessaging = messagingMatrix.find(m => m.id === value);
      setFormData({ 
        ...formData, 
        campaign: selectedMessaging?.campaign || "",
        copy: selectedMessaging?.primary_text || ""
      });
      setShowNewCampaign(false);
    }
  };

  const handleLandingPageChange = (value: string) => {
    if (value === "new") {
      setShowNewLandingPage(true);
      setFormData({ ...formData, landing_page_id: "", landing_page_url: "" });
    } else {
      const selectedPage = landingPages.find(lp => lp.id === value);
      setFormData({ 
        ...formData, 
        landing_page_id: value,
        landing_page_url: selectedPage?.url || ""
      });
      setShowNewLandingPage(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.platform) {
      toast({
        title: "Platform required",
        description: "Please select a platform",
        variant: "destructive",
      });
      return;
    }

    try {
      const utmLink = generateUTMLink(formData.landing_page_url, formData.platform, formData.campaign);
      
      const postData = {
        user_id: user?.id,
        post_id: editingPost?.post_id || generatePostId(),
        status: formData.scheduled_date ? "Scheduled" : formData.status,
        platform: formData.platform,
        campaign: formData.campaign || null,
        creative_id: selectedCreative?.id || null,
        copy: formData.copy || null,
        utm_link: utmLink || null,
        scheduled_date: formData.scheduled_date || null,
        posted_url: formData.posted_url || null,
        notes: formData.notes || null,
      };

      if (editingPost) {
        const { error } = await supabase
          .from("social_posts")
          .update(postData)
          .eq("id", editingPost.id);

        if (error) throw error;

        toast({
          title: "Post updated",
          description: "Social post has been updated successfully",
        });
      } else {
        const { error } = await supabase.from("social_posts").insert([postData]);

        if (error) throw error;

        toast({
          title: "Post created",
          description: "Social post has been created successfully",
        });
      }

      fetchPosts();
      handleCloseDialog();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (post: SocialPost) => {
    setEditingPost(post);
    
    const matchingPage = landingPages.find(lp => post.utm_link?.includes(lp.url));
    
    setFormData({
      status: post.status,
      platform: post.platform,
      campaign: post.campaign || "",
      copy: post.copy || "",
      landing_page_url: post.utm_link?.split("?")[0] || "",
      landing_page_id: matchingPage?.id || "",
      scheduled_date: post.scheduled_date ? format(new Date(post.scheduled_date), "yyyy-MM-dd'T'HH:mm") : "",
      posted_url: post.posted_url || "",
      notes: post.notes || "",
    });
    
    if (post.creative) {
      setSelectedCreative(post.creative);
    }
    
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("social_posts").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Post deleted",
        description: "Social post has been deleted successfully",
      });

      fetchPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPost(null);
    setSelectedCreative(null);
    setShowNewCampaign(false);
    setShowNewLandingPage(false);
    setFormData({
      status: "Draft",
      platform: "",
      campaign: "",
      copy: "",
      landing_page_url: "",
      landing_page_id: "",
      scheduled_date: "",
      posted_url: "",
      notes: "",
    });
  };

  const copyUTM = (utm: string) => {
    navigator.clipboard.writeText(utm);
    toast({
      title: "Copied!",
      description: "UTM link copied to clipboard",
    });
  };

  const handleCreativeSelect = (creatives: any[]) => {
    setSelectedCreative(creatives[0]);
    setShowCreativePicker(false);
  };

  const currentUTM = generateUTMLink(formData.landing_page_url, formData.platform, formData.campaign);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Social Posts</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Creative</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>UTM Link</TableHead>
              <TableHead>Posted URL</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No social posts yet. Create your first post!
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        post.status === "Posted"
                          ? "bg-green-100 text-green-800"
                          : post.status === "Scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {post.status}
                    </span>
                  </TableCell>
                  <TableCell>{post.platform}</TableCell>
                  <TableCell>{post.campaign || "-"}</TableCell>
                  <TableCell>
                    {post.creative ? (
                      <div className="flex items-center gap-2">
                        {post.creative.thumbnail_url && (
                          <img
                            src={post.creative.thumbnail_url}
                            alt={post.creative.creative_name}
                            className="h-8 w-8 object-cover rounded"
                          />
                        )}
                        <span className="text-sm">{post.creative.creative_name}</span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {post.scheduled_date ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(post.scheduled_date), "MMM d, yyyy HH:mm")}
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {post.utm_link ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyUTM(post.utm_link!)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {post.posted_url ? (
                      <a
                        href={post.posted_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
            <DialogDescription>
              {editingPost ? "Update your social post details" : "Create a new organic social post"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Platform *</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => setFormData({ ...formData, platform: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Posted">Posted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Campaign & Messaging</Label>
              {showNewCampaign ? (
                <div className="flex gap-2">
                  <Input
                    value={formData.campaign}
                    onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                    placeholder="Enter new campaign name"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowNewCampaign(false);
                      setFormData({ ...formData, campaign: "" });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Select
                  value={messagingMatrix.find(m => m.campaign === formData.campaign && m.primary_text === formData.copy)?.id || "none"}
                  onValueChange={handleCampaignChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select campaign & messaging" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Campaign</SelectItem>
                    <SelectItem value="new">+ Create New Campaign</SelectItem>
                    {messagingMatrix.map((msg) => (
                      <SelectItem key={msg.id} value={msg.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{msg.campaign}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                            {msg.primary_text?.substring(0, 60)}...
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>Creative</Label>
              {selectedCreative ? (
                <div className="flex items-center gap-2 p-2 border rounded">
                  {selectedCreative.thumbnail_url && (
                    <img
                      src={selectedCreative.thumbnail_url}
                      alt={selectedCreative.creative_name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  )}
                  <span className="flex-1">{selectedCreative.creative_name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCreative(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowCreativePicker(true)}
                  className="w-full"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Choose from Library
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label>Post Copy</Label>
              <Textarea
                value={formData.copy}
                onChange={(e) => setFormData({ ...formData, copy: e.target.value })}
                placeholder="Write your post caption here..."
                rows={4}
              />
              {formData.campaign && messagingMatrix.find(m => m.campaign === formData.campaign)?.primary_text && (
                <p className="text-xs text-muted-foreground">
                  Suggested from campaign: {messagingMatrix.find(m => m.campaign === formData.campaign)?.primary_text.substring(0, 50)}...
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Landing Page</Label>
              {showNewLandingPage ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={formData.landing_page_url}
                      onChange={(e) => setFormData({ ...formData, landing_page_url: e.target.value })}
                      placeholder="https://example.com"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowNewLandingPage(false);
                        setFormData({ ...formData, landing_page_url: "", landing_page_id: "" });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Select
                  value={formData.landing_page_id || "new"}
                  onValueChange={handleLandingPageChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select or add landing page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">+ Add New Landing Page</SelectItem>
                    {landingPages.map((page) => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.name || page.url}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {currentUTM && (
              <div className="space-y-2">
                <Label>Generated UTM Link</Label>
                <div className="flex gap-2">
                  <Input value={currentUTM} readOnly className="flex-1" />
                  <Button variant="outline" size="sm" onClick={() => copyUTM(currentUTM)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Medium is automatically set to "organic_social"
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Scheduled Date</Label>
              <Input
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Posted URL</Label>
              <Input
                value={formData.posted_url}
                onChange={(e) => setFormData({ ...formData, posted_url: e.target.value })}
                placeholder="https://instagram.com/p/..."
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Hashtags, content context, or reminders..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingPost ? "Update" : "Create"} Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CreativePickerModal
        open={showCreativePicker}
        onOpenChange={setShowCreativePicker}
        onSelect={handleCreativeSelect}
        allowMultiple={false}
      />
    </div>
  );
}
