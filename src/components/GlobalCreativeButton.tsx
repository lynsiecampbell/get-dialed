import { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NewCreativeDrawer } from "./NewCreativeDrawer";

interface GlobalCreativeButtonProps extends ButtonProps {
  onSuccess?: () => void;
  contextCampaign?: string;
}

export default function GlobalCreativeButton({
  onSuccess,
  contextCampaign,
  children,
  ...buttonProps
}: GlobalCreativeButtonProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setDrawerOpen(true)} {...buttonProps}>
        {children || (
          <>
            <Plus className="h-4 w-4" />
            Creative
          </>
        )}
      </Button>

      <NewCreativeDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={onSuccess}
        contextCampaign={contextCampaign}
      />
    </>
  );
}
