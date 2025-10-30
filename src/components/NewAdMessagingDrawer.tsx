
  const handleSave = async () => {
    // Validate at least one of each
    const validHeadlines = headlines.filter(h => h.trim());
    const validBody = bodyCopy.filter(b => b.trim());
    const validCtas = ctas.filter(c => c.trim());

    if (validHeadlines.length === 0) {
      showError("Please add at least one headline");
      return;
    }

    if (validBody.length === 0) {
      showError("Please add at least one body copy");
      return;
    }

    if (validCtas.length === 0) {
      showError("Please add at least one call-to-action");
      return;
    }

    setLoading(true);
    try {
      // Insert messaging record
      const { data: messagingData, error: messagingError } = await supabase
        .from("messaging")
        .insert({
          user_id: user!.id,
          messaging_type: "Ad",
          headlines: validHeadlines,
          body_copy: validBody,
          ctas: validCtas,
          notes: notes.trim() || null
        })
        .select()
        .single();

      if (messagingError) throw messagingError;

      // Link to campaign
      const { error: linkError } = await supabase
        .from("campaign_messaging")
        .insert({
          campaign_id: campaignId,
          messaging_id: messagingData.id
        });

      if (linkError) throw linkError;

      showSuccess("Ad messaging created successfully");
      resetForm();
      onClose();
      onSuccess?.();
    } catch (error: any) {
      showError(error.message || "Failed to create ad messaging");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNotes("");
    setHeadlines([""]);
    setBodyCopy([""]);
    setCtas([""]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <DrawerPanel
      open={open}
      onOpenChange={(isOpen) => !isOpen && handleClose()}
      title="New Ad Messaging"
      size="lg"
    >
      <div className="space-y-6 p-6">
        {/* Notes */}
        <div className="space-y-2">
          <Label>Notes (Optional)</Label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Pricing Calculator - Q4 2024"
          />
          <p className="text-xs text-muted-foreground">
            Give this messaging a name or description to help you find it later
          </p>
        </div>

        {/* Headlines */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Headlines *</Label>
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
                placeholder="Enter headline..."
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
            <Label>Body Copy *</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addBody}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Body
            </Button>
          </div>
          {bodyCopy.map((body, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={body}
                onChange={(e) => updateBody(index, e.target.value)}
                placeholder="Enter body copy..."
                className="flex-1 min-h-[80px]"
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
            <Label>Call-to-Actions *</Label>
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
                placeholder="e.g., Learn More, Sign Up, Get Started"
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
            {loading ? "Saving..." : "Save Messaging"}
          </Button>
        </div>
      </div>
    </DrawerPanel>
  );
}
