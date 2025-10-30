import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DrawerPanel } from "@/components/ui/DrawerPanel";
import { showSuccess, showError } from "@/lib/toast-helpers";

interface NewCampaignDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (campaignId: string) => void;
}

const CAMPAIGN_STATUSES = ["Planning", "Active", "Paused", "Completed", "Archived"];
const CAMPAIGN_TYPES = ["Evergreen", "Content", "Product", "Promotional", "Event"];

export function NewCampaignDrawer({
  open,
  onClose,
  onSuccess,
}: NewCampaignDrawerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Planning");
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState("");

  const handleClose = () => {
    setName("");
    setStatus("Planning");
    setType("");
    setStartDate(undefined);
    setEndDate(undefined);
    setNotes("");
    onClose();
  };

  const handleCreate = async () => {
    if (!user) return;

    if (!name.trim()) {
      showError("Please enter a campaign name");
      return;
    }

    if (!type) {
      showError("Please select a campaign type");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("campaigns")
        .insert({
          user_id: user.id,
          name: name.trim(),
          type: type,
          status: status,
          start_date: startDate ? format(startDate, "yyyy-MM-dd") : null,
          end_date: endDate ? format(endDate, "yyyy-MM-dd") : null,
          notes: notes.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      showSuccess("Campaign created successfully!");
      handleClose();
      
      // Call onSuccess with the new campaign ID to open ManageCampaignDrawer
      onSuccess?.(data.id);
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      showError(error.message || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DrawerPanel
      open={open}
      onOpenChange={(isOpen) => !isOpen && handleClose()}
      title="Create Campaign"
      size="md"
    >
      <div className="space-y-6 p-6">
        <p className="text-sm text-muted-foreground">
          You can add messaging, creatives, and ads after creating your campaign.
        </p>

        {/* Campaign Name */}
        <div className="space-y-2">
          <Label>Campaign Name *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Q4 Email Templates, Pricing Calculator Launch"
            autoFocus
          />
        </div>

        {/* Campaign Status */}
        <div className="space-y-2">
          <Label>Campaign Status *</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CAMPAIGN_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Campaign Type */}
        <div className="space-y-2">
          <Label>Campaign Type *</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Select campaign type" />
            </SelectTrigger>
            <SelectContent>
              {CAMPAIGN_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Campaign objectives, target audience, or other notes..."
            className="min-h-[100px]"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create Campaign"}
          </Button>
        </div>
      </div>
    </DrawerPanel>
  );
}
