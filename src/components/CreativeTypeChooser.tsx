import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Film } from "lucide-react";

interface CreativeTypeChooserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: "single" | "carousel") => void;
}

export default function CreativeTypeChooser({ open, onOpenChange, onSelectType }: CreativeTypeChooserProps) {
  const handleSelectType = (type: "single" | "carousel") => {
    onSelectType(type);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>What type of creative would you like to add?</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button
            variant="outline"
            className="h-32 flex flex-col gap-3 hover:bg-accent"
            onClick={() => handleSelectType("single")}
          >
            <ImageIcon className="h-8 w-8" />
            <div className="text-center">
              <div className="font-semibold">Single</div>
              <div className="text-xs text-muted-foreground mt-1 px-[5px]" style={{ whiteSpace: 'normal' }}>
                Upload one image or video asset
              </div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-32 flex flex-col gap-3 hover:bg-accent"
            onClick={() => handleSelectType("carousel")}
          >
            <Film className="h-8 w-8" />
            <div className="text-center">
              <div className="font-semibold">Carousel</div>
              <div className="text-xs text-muted-foreground mt-1 px-[5px]" style={{ whiteSpace: 'normal' }}>
                Add multiple images or videos in a sequence
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
