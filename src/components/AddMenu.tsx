import { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Image as ImageIcon,
  Globe,
  Megaphone,
  Library,
  Upload,
  FilePlus,
  ChevronRight,
} from "lucide-react";

interface AddMenuProps {
  campaignId: string;
  trigger: ReactNode;
  side?: "right" | "left";
  onAddHeadline: (campaignId: string) => void;
  onAddPrimaryText: (campaignId: string) => void;
  onSelectExistingCreative: (campaignId: string) => void;
  onAddNewCreative: (campaignId: string) => void;
  onSelectExistingLandingPage: (campaignId: string) => void;
  onAddNewLandingPage: (campaignId: string) => void;
  onSelectExistingAd: (campaignId: string) => void;
  onAddNewAd: (campaignId: string) => void;
}

export function AddMenu({
  campaignId,
  trigger,
  side = "right",
  onAddHeadline,
  onAddPrimaryText,
  onSelectExistingCreative,
  onAddNewCreative,
  onSelectExistingLandingPage,
  onAddNewLandingPage,
  onSelectExistingAd,
  onAddNewAd,
}: AddMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent 
        align={side === "left" ? "end" : "start"}
        className="w-52 bg-background border shadow-md"
        sideOffset={4}
      >
        {/* Headline */}
        <DropdownMenuItem
          onClick={() => onAddHeadline(campaignId)}
          className="py-2.5 px-3 gap-2 cursor-pointer hover:bg-muted focus:bg-muted transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span className="text-sm">Headline</span>
        </DropdownMenuItem>

        {/* Primary Text */}
        <DropdownMenuItem
          onClick={() => onAddPrimaryText(campaignId)}
          className="py-2.5 px-3 gap-2 cursor-pointer hover:bg-muted focus:bg-muted transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span className="text-sm">Primary Text</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Creative Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="py-2.5 px-3 gap-2 cursor-pointer hover:bg-muted focus:bg-muted transition-colors">
            <ImageIcon className="h-5 w-5" />
            <span className="text-sm">Creative</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-background border shadow-md">
            <DropdownMenuItem
              onClick={() => onSelectExistingCreative(campaignId)}
              className="py-2.5 px-3 gap-2 cursor-pointer hover:bg-muted focus:bg-muted transition-colors"
            >
              <Library className="h-5 w-5" />
              <span className="text-sm">Select existing</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAddNewCreative(campaignId)}
              className="py-2.5 px-3 gap-2 cursor-pointer hover:bg-muted focus:bg-muted transition-colors"
            >
              <Upload className="h-5 w-5" />
              <span className="text-sm">Add new</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Landing Page Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="py-2.5 px-3 gap-2 cursor-pointer hover:bg-muted focus:bg-muted transition-colors">
            <Globe className="h-5 w-5" />
            <span className="text-sm">Landing Page</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-background border shadow-md">
            <DropdownMenuItem
              onClick={() => onSelectExistingLandingPage(campaignId)}
              className="py-2.5 px-3 gap-2 cursor-pointer hover:bg-muted focus:bg-muted transition-colors"
            >
              <Library className="h-5 w-5" />
              <span className="text-sm">Select existing</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAddNewLandingPage(campaignId)}
              className="py-2.5 px-3 gap-2 cursor-pointer hover:bg-muted focus:bg-muted transition-colors"
            >
              <FilePlus className="h-5 w-5" />
              <span className="text-sm">Add new</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Ad Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="py-2.5 px-3 gap-2 cursor-pointer hover:bg-muted focus:bg-muted transition-colors">
            <Megaphone className="h-5 w-5" />
            <span className="text-sm">Ad</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-background border shadow-md">
            <DropdownMenuItem
              onClick={() => onSelectExistingAd(campaignId)}
              className="py-2.5 px-3 gap-2 cursor-pointer hover:bg-muted focus:bg-muted transition-colors"
            >
              <Library className="h-5 w-5" />
              <span className="text-sm">Select existing</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAddNewAd(campaignId)}
              className="py-2.5 px-3 gap-2 cursor-pointer hover:bg-muted focus:bg-muted transition-colors"
            >
              <FilePlus className="h-5 w-5" />
              <span className="text-sm">Add new</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
