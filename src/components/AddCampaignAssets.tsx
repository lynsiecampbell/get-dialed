import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Globe, Megaphone, X, ChevronDown, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface AddCampaignAssetsProps {
  selectedCreatives: string[];
  selectedLandingPages: string[];
  selectedAds: string[];
  onSelectExistingCreatives: () => void;
  onSelectExistingLandingPages: () => void;
  onSelectExistingAds: () => void;
  onAddNewCreative?: () => void;
  onAddNewLandingPage?: () => void;
  onAddNewAd?: () => void;
  onRemoveCreative: (id: string) => void;
  onRemoveLandingPage: (id: string) => void;
  onRemoveAd: (id: string) => void;
}

export function AddCampaignAssets({
  selectedCreatives,
  selectedLandingPages,
  selectedAds,
  onSelectExistingCreatives,
  onSelectExistingLandingPages,
  onSelectExistingAds,
  onAddNewCreative,
  onAddNewLandingPage,
  onAddNewAd,
  onRemoveCreative,
  onRemoveLandingPage,
  onRemoveAd
}: AddCampaignAssetsProps) {
  const [viewingAssets, setViewingAssets] = useState<"creatives" | "landingPages" | "ads" | null>(null);

  return (
    <>
      <div className="space-y-6">
        {/* Creatives */}
        <div className="py-3 border-b space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ImageIcon className="h-5 w-5 text-primary" />
              <Label className="text-base font-medium">Creatives</Label>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  + Add
                  <ChevronDown className="h-3.5 w-3.5 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-[1400]">
                <DropdownMenuItem onClick={onSelectExistingCreatives}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Select Existing
                </DropdownMenuItem>
                {onAddNewCreative && (
                  <DropdownMenuItem onClick={onAddNewCreative}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {selectedCreatives.length > 0 && (
            <Badge 
              variant="secondary" 
              className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
              onClick={() => setViewingAssets("creatives")}
            >
              {selectedCreatives.length} attached
            </Badge>
          )}
        </div>

        {/* Landing Pages */}
        <div className="py-3 border-b space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <Label className="text-base font-medium">Landing Pages</Label>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  + Add
                  <ChevronDown className="h-3.5 w-3.5 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-[1400]">
                <DropdownMenuItem onClick={onSelectExistingLandingPages}>
                  <Globe className="h-4 w-4 mr-2" />
                  Select Existing
                </DropdownMenuItem>
                {onAddNewLandingPage && (
                  <DropdownMenuItem onClick={onAddNewLandingPage}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {selectedLandingPages.length > 0 && (
            <Badge 
              variant="secondary" 
              className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
              onClick={() => setViewingAssets("landingPages")}
            >
              {selectedLandingPages.length} attached
            </Badge>
          )}
        </div>

        {/* Ads */}
        <div className="py-3 border-b space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-primary" />
              <Label className="text-base font-medium">Ads</Label>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  + Add
                  <ChevronDown className="h-3.5 w-3.5 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-[1400]">
                <DropdownMenuItem onClick={onSelectExistingAds}>
                  <Megaphone className="h-4 w-4 mr-2" />
                  Select Existing
                </DropdownMenuItem>
                {onAddNewAd && (
                  <DropdownMenuItem onClick={onAddNewAd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {selectedAds.length > 0 && (
            <Badge 
              variant="secondary" 
              className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
              onClick={() => setViewingAssets("ads")}
            >
              {selectedAds.length} attached
            </Badge>
          )}
        </div>
      </div>

      {/* View Attached Assets Dialog */}
      <Dialog open={viewingAssets !== null} onOpenChange={(open) => !open && setViewingAssets(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Attached {viewingAssets === "creatives" ? "Creatives" : viewingAssets === "landingPages" ? "Landing Pages" : "Ads"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {viewingAssets === "creatives" && selectedCreatives.map((id) => (
              <div key={id} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm truncate flex-1">{id}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onRemoveCreative(id)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {viewingAssets === "landingPages" && selectedLandingPages.map((id) => (
              <div key={id} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm truncate flex-1">{id}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onRemoveLandingPage(id)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {viewingAssets === "ads" && selectedAds.map((id) => (
              <div key={id} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm truncate flex-1">{id}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onRemoveAd(id)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
