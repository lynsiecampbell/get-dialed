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

interface NewBrandMessagingDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  campaignId: string;
}

export function NewBrandMessagingDrawer({
  open,
  onClose,
  onSuccess,
  campaignId,
}: NewBrandMessagingDrawerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [headlines, setHeadlines] = useState([""]);
  const [bodyCopy, setBodyCopy] = useState([""]);
  const [ctas, setCtas] = useState([""]);

  const handleClose = () => {
    // Reset form
    setName("");
    setNotes("");
    setHeadlines([""]);
    setBodyCopy([""]);
    setCtas([""]);
    onClose();
  };

  // Headlines handlers
  const addHeadline = () => setHeadlines([...headlines, ""]);
  const removeHeadline = (index: number) => {
    setHeadlines(headlines.filter((_, i) => i !== index));
  };
  const updateHeadline = (index: number, value: string) => {
    const updated = [...headlines];
    updated[index] = value;
    setHeadlines(updated);
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

  // CTAs handlers
  const addCta = () => setCtas([...ctas, ""]);
  const removeCta = (index: number) => {
    setCtas(ctas.filter((_, i) => i !== index));
  };
  const updateCta = (index: number, value: string) => {
    const updated = [...ctas];
    updated[index] = value;
    setCtas(updated);
  };

  const handleSave = async () => {
    if (!user) return;

    // Validation
    if (!name.trim()) {
      showError("Please provide a name for this brand messaging");
      return;
    }

    const validHeadlines = headlines.filter((h) => h.trim());
    const validBodyCopy = bodyCopy.filter((b) => b.trim());
    const validCtas = ctas.filter((c) => c.trim());

    if (validHeadlines.length === 0 && validBodyCopy.length === 0 && validCtas.length === 0) {
      showError("Please add at least one headline, body copy, or CTA");
      return;
    }

    setLoading(true);

    try {
      // Insert into messaging table
      const { data: messagingData, error: messagingError } = await supabase
        .from("messaging")
        .insert({
          user_id: user.id,
          messaging_type: "Brand",
          name: name.trim(),
          notes: notes.trim() || null,
          headlines: validHeadlines.length > 0 ? validHeadlines : null,
          body_copy: validBodyCopy.length > 0 ? validBodyCopy : null,
          ctas: validCtas.length > 0 ? validCtas : null,
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

      showSuccess("Brand messaging created successfully!");
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating brand messaging:", error);
      showError(error.message || "Failed to create brand messaging");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DrawerPanel
      open={open}
      onOpenChange={(isOpen) => !isOpen && handleClose()}
      title="New Brand Messaging"
      size="lg"
    >
      <div className="space-y-6 p-6">
        {/* Name */}
        <div className="space-y-2">
          <Label>Message Name *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Landing Page Hero, About Section, Value Props"
          />
          <p className="text-xs text-muted-foreground">
            Describe where or how this messaging will be used
          </p>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label>Notes (Optional)</Label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional context or usage notes"
          />
        </div>

        {/* Headlines */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Headlines / Taglines</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addHeadline}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Headline
            </Button>
          </div>
          {headlines.map((headline, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={headline}
                onChange={(e) => updateHeadline(index, e.target.value)}
                placeholder="Enter headline or tagline..."
                className="flex-1"
              />
              {headlines.length > 1 && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => removeHeadline(index)}
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
            <Label>Body Copy / Descriptions</Label>
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
                placeholder="Enter body copy or description..."
                className="flex-1 min-h-[100px]"
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

        {/* CTAs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Call-to-Actions</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addCta}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add CTA
            </Button>
          </div>
          {ctas.map((cta, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={cta}
                onChange={(e) => updateCta(index, e.target.value)}
                placeholder="e.g., Get Started, Learn More, Try Free"
                className="flex-1"
              />
              {ctas.length > 1 && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => removeCta(index)}
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
            {loading ? "Saving..." : "Save Brand Messaging"}
          </Button>
        </div>
      </div>
    </DrawerPanel>
  );
}
