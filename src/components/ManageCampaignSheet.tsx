import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Plus, Film, Globe, Megaphone, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  campaign: string;
  campaign_type: "evergreen" | "product" | "content" | "promo";
  headline: string | null;
  primary_text: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Creative {
  id: string;
  creative_name: string;
  campaign: string | null;
  creative_group_type: string;
  parent_creative_id: string | null;
  creative_type: string;
  file_url: string | null;
  thumbnail_url: string | null;
  format_dimensions: string | null;
  file_size_mb: number | null;
  notes: string | null;
}

interface LandingPage {
  id: string;
  name: string | null;
  url: string;
  campaigns: string[] | null;
}

interface Ad {
  id: string;
  ad_name: string | null;
  campaign: string;
  status: string;
  ad_format: string;
  creative_type: string;
  version: string;
  audience_type: string;
}

interface AssociatedAssets {
  creatives: Creative[];
  landingPages: LandingPage[];
  ads: Ad[];
}

interface ManageCampaignSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: string | null;
  messages: Record<string, Message[]>;
  associatedAssets: AssociatedAssets;
  onUpdate: () => void;
  onEditMessage: (message: Message) => void;
  onAddAsset: (type: 'creative' | 'landing' | 'ad', mode: 'existing' | 'new', campaign: string) => void;
}

export function ManageCampaignSheet({
  open,
  onOpenChange,
  campaign,
  messages,
  associatedAssets,
  onUpdate,
  onEditMessage,
  onAddAsset
}: ManageCampaignSheetProps) {
  const [newCampaignName, setNewCampaignName] = useState(campaign || "");
  const [newCampaignType, setNewCampaignType] = useState<"evergreen" | "product" | "content" | "promo">(
    campaign && messages[campaign]?.[0]?.campaign_type || "content"
  );

  useEffect(() => {
    if (open && campaign) {
      setNewCampaignName(campaign);
      setNewCampaignType(messages[campaign]?.[0]?.campaign_type || "content");
    }
  }, [open, campaign, messages]);

  const handleSave = async () => {
    if (!campaign || !newCampaignName.trim()) return;

    const nameChanged = newCampaignName !== campaign;
    const typeChanged = newCampaignType !== messages[campaign]?.[0]?.campaign_type;

    if (!nameChanged && !typeChanged) {
      onOpenChange(false);
      return;
    }

    try {
      const campaignMessageIds = messages[campaign].map(m => m.id);
      
      if (typeChanged) {
        const { error } = await supabase
          .from("messaging_matrix")
          .update({ campaign_type: newCampaignType })
          .in("id", campaignMessageIds);
        if (error) throw error;
      }
      
      if (nameChanged) {
        const { error } = await supabase
          .from("messaging_matrix")
          .update({ campaign: newCampaignName })
          .eq("campaign", campaign);
        if (error) throw error;
      }

      toast.success("Campaign updated successfully");
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Failed to update campaign: " + error.message);
    }
  };

  const handleClose = () => {
    setNewCampaignName(campaign || "");
    setNewCampaignType(campaign && messages[campaign]?.[0]?.campaign_type || "content");
    onOpenChange(false);
  };

  if (!campaign) return null;

  const headlines = messages[campaign]?.filter(m => m.headline) || [];
  const primaryTexts = messages[campaign]?.filter(m => m.primary_text) || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[450px] sm:w-[450px] flex flex-col">
        {/* Header */}
        <SheetHeader className="space-y-4 pb-4 border-b">
          <SheetTitle className="text-xl font-semibold">Edit Campaign</SheetTitle>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-6 px-1 space-y-6">
          {/* Campaign Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-campaign-name">Campaign Name</Label>
              <Input
                id="edit-campaign-name"
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-campaign-type">Campaign Type</Label>
              <Select value={newCampaignType} onValueChange={(value: any) => setNewCampaignType(value)}>
                <SelectTrigger id="edit-campaign-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="content">Content</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="promo">Promo</SelectItem>
                  <SelectItem value="evergreen">Evergreen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Headlines */}
          <div className="space-y-3">
            <div>
              <Label className="text-base font-semibold">Headlines</Label>
            </div>
            <div className="space-y-2">
              {headlines.length === 0 ? (
                <p className="text-sm text-muted-foreground">No headlines added</p>
              ) : (
                headlines.map(message => (
                  <div key={message.id} className="flex items-center gap-2">
                    <Input
                      value={message.headline || ""}
                      onChange={async (e) => {
                        const newValue = e.target.value;
                        try {
                          await supabase
                            .from("messaging_matrix")
                            .update({ headline: newValue })
                            .eq("id", message.id);
                          onUpdate();
                        } catch (error: any) {
                          toast.error("Failed to update headline");
                        }
                      }}
                      className="text-sm flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 flex-shrink-0"
                      onClick={async () => {
                        try {
                          await supabase
                            .from("messaging_matrix")
                            .delete()
                            .eq("id", message.id);
                          toast.success("Headline deleted");
                          onUpdate();
                        } catch (error: any) {
                          toast.error("Failed to delete headline");
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Primary Text */}
          <div className="space-y-3">
            <div>
              <Label className="text-base font-semibold">Primary Text</Label>
            </div>
            <div className="space-y-2">
              {primaryTexts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No primary text added</p>
              ) : (
                primaryTexts.map(message => (
                  <div key={message.id} className="flex items-center gap-2">
                    <Input
                      value={message.primary_text || ""}
                      onChange={async (e) => {
                        const newValue = e.target.value;
                        try {
                          await supabase
                            .from("messaging_matrix")
                            .update({ primary_text: newValue })
                            .eq("id", message.id);
                          onUpdate();
                        } catch (error: any) {
                          toast.error("Failed to update primary text");
                        }
                      }}
                      className="text-sm flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 flex-shrink-0"
                      onClick={async () => {
                        try {
                          await supabase
                            .from("messaging_matrix")
                            .delete()
                            .eq("id", message.id);
                          toast.success("Primary text deleted");
                          onUpdate();
                        } catch (error: any) {
                          toast.error("Failed to delete primary text");
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <SheetFooter className="flex-shrink-0 pt-4 border-t">
          <div className="flex w-full gap-3 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
