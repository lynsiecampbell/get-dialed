import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface NewCreativeDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  campaigns: Array<{ id: string; name: string }>;
}

export function NewCreativeDrawerV2({ open, onClose, onSuccess, campaigns }: NewCreativeDrawerProps) {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      for (const file of files) {
        const filePath = user?.id + "/" + file.name;
        const { error: uploadError } = await supabase.storage
          .from("creative-images")
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("creative-images")
          .getPublicUrl(filePath);

        const { data: creativeData, error: dbError } = await supabase
          .from("creatives")
          .insert({
            user_id: user?.id,
            name: file.name,
            creative_type: file.type.startsWith("image/") ? "Image" : "Video",
            image_urls: [urlData.publicUrl],
          })
          .select()
          .single();

        if (dbError) throw dbError;

        if (selectedCampaign && creativeData) {
          const { error: linkError } = await supabase
            .from("campaign_creatives")
            .insert({
              campaign_id: selectedCampaign,
              creative_id: creativeData.id,
              is_primary: false,
            });

          if (linkError) throw linkError;
        }
      }

      toast({
        title: "Success",
        description: "Uploaded " + files.length + " file(s)",
      });

      setFiles([]);
      setSelectedCampaign("");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Add New Creatives</SheetTitle>
          <button onClick={onClose} className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </button>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div>
            <Label>Upload Files</Label>
            <Input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {files.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {files.length} file(s) selected
              </p>
            )}
          </div>

          <div>
            <Label>Campaign (Optional)</Label>
            <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
              <SelectTrigger>
                <SelectValue placeholder="Select campaign..." />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleUpload} disabled={uploading} className="w-full">
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
