import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DrawerPanel } from "@/components/ui/DrawerPanel";
import { showSuccess, showError } from "@/lib/toast-helpers";

interface NewEmailMessagingDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  campaignId: string;
}

export function NewEmailMessagingDrawer({
  open,
  onClose,
  onSuccess,
  campaignId,
}: NewEmailMessagingDrawerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [subjectLines, setSubjectLines] = useState([""]);
  const [bodyCopy, setBodyCopy] = useState([""]);

  const handleClose = () => {
    // Reset form
    setName("");
    setNotes("");
    setSubjectLines([""]);
    setBodyCopy([""]);
    onClose();
  };

  // Subject Lines handlers
  const addSubjectLine = () => setSubjectLines([...subjectLines, ""]);
  const removeSubjectLine = (index: number) => {
    setSubjectLines(subjectLines.filter((_, i) => i !== index));
  };
  const updateSubjectLine = (index: number, value: string) => {
    const updated = [...subjectLines];
    updated[index] = value;
    setSubjectLines(updated);
  };

  // Body Copy handlers
  const addBody = () => setBodyCopy([...bodyCopy, ""]);
  const removeBody = (index: number) => {
    setBodyCopy(bodyCopy.filter((_, i) => i !== index));
  };
  const updateBody = (index: number, value: string) => {
    const updated = [...bodyCopy];
    updated[index] = value;
    setBodyCopy(updated);
  };

  const handleSave = async () => {
    if (!user) return;

    // Validation
    if (!name.trim()) {
      showError("Please provide a name for this email messaging");
      return;
    }

    const validSubjectLines = subjectLines.filter((s) => s.trim());
    if (validSubjectLines.length === 0) {
      showError("Please add at least one subject line");
      return;
    }

    const validBodyCopy = bodyCopy.filter((b) => b.trim());
    if (validBodyCopy.length === 0) {
      showError("Please add at least one body copy");
      return;
    }

    setLoading(true);

    try {
      // Insert into messaging table
      const { data: messagingData, error: messagingError } = await supabase
        .from("messaging")
        .insert({
          user_id: user.id,
          messaging_type: "Email",
          name: name.trim(),
          notes: notes.trim() || null,
          subject_lines: validSubjectLines,
          body_copy: validBodyCopy,
        })
        .select()
        .single();

      if (messagingError) throw messagingError;

      // Link to campaign
      const { error: junctionError } = await supabase
        .from("campaign_messaging")
        .insert({
          campaign_id: campaignId,
          messaging_id: messagingData.id,
        });

      if (junctionError) throw junctionError;

      showSuccess("Email messaging created successfully!");
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating email messaging:", error);
      showError(error.message || "Failed to create email messaging");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DrawerPanel
      open={open}
      onOpenChange={(isOpen) => !isOpen && handleClose()}
      title="New Email Messaging"
      size="lg"
    >
      <div className="space-y-6 p-6">
        {/* Name */}
        <div className="space-y-2">
          <Label>Email Name *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Nurture Email #1, Welcome Series Email 2"
          />
          <p className="text-xs text-muted-foreground">
            Give this email a descriptive name to help you find it later
          </p>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label>Notes (Optional)</Label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Follow-up for pricing calculator downloads"
          />
        </div>

        {/* Subject Lines */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Subject Lines *</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addSubjectLine}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Subject Line
            </Button>
          </div>
          {subjectLines.map((subject, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={subject}
                onChange={(e) => updateSubjectLine(index, e.target.value)}
                placeholder="Enter subject line..."
                className="flex-1"
              />
              {subjectLines.length > 1 && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => removeSubjectLine(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Body Copy */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Body Copy *</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addBody}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Body Copy
            </Button>
          </div>
          {bodyCopy.map((body, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={body}
                onChange={(e) => updateBody(index, e.target.value)}
                placeholder="Enter body copy..."
                className="flex-1 min-h-[120px]"
              />
              {bodyCopy.length > 1 && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => removeBody(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Email Messaging"}
          </Button>
        </div>
      </div>
    </DrawerPanel>
  );
}
