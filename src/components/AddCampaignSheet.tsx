import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddCampaignSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (
    campaign: string, 
    type: "content" | "product" | "evergreen" | "launch",
    notes?: string
  ) => void;
}

export function AddCampaignSheet({ 
  open, 
  onOpenChange, 
  onSuccess
}: AddCampaignSheetProps) {
  const [campaignName, setCampaignName] = useState("");
  const [campaignType, setCampaignType] = useState<"content" | "product" | "evergreen" | "launch" | "">("");
  const [notes, setNotes] = useState("");

  const handleCreateCampaign = () => {
    if (!campaignName.trim() || !campaignType) {
      return;
    }

    onSuccess(
      campaignName.trim(), 
      campaignType as "content" | "product" | "evergreen" | "launch", 
      notes.trim() || undefined
    );
    
    // Reset form
    setCampaignName("");
    setCampaignType("");
    setNotes("");
  };

  const handleClose = () => {
    setCampaignName("");
    setCampaignType("");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-[45vw] max-w-[600px] min-w-[450px] flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="pb-6">
          <SheetTitle className="text-2xl font-semibold">Create Campaign</SheetTitle>
          <p className="text-sm text-muted-foreground pt-2">
            You can add messaging, creatives, and ads after creating your campaign.
          </p>
        </SheetHeader>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-6 px-1 py-1">
          {/* Campaign Name */}
          <div className="space-y-2">
            <Label htmlFor="campaign-name" className="text-sm font-medium">
              Campaign Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="campaign-name"
              placeholder="Email Templates Launch"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Campaign Type */}
          <div className="space-y-2">
            <Label htmlFor="campaign-type" className="text-sm font-medium">
              Campaign Type <span className="text-destructive">*</span>
            </Label>
            <Select value={campaignType} onValueChange={(value: "content" | "product" | "evergreen" | "launch" | "") => setCampaignType(value)}>
              <SelectTrigger id="campaign-type" className="w-full">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="launch">Launch</SelectItem>
                <SelectItem value="evergreen">Evergreen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="campaign-notes" className="text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id="campaign-notes"
              placeholder="Launching free email template resource for yoga studios."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[100px] resize-none"
              rows={4}
            />
          </div>
        </div>

        {/* Footer with Buttons */}
        <SheetFooter className="flex-shrink-0 pt-6 border-t">
          <div className="flex w-full gap-3 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateCampaign}
              disabled={!campaignName.trim() || !campaignType}
              className="bg-primary hover:bg-primary/90"
            >
              Create Campaign
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
