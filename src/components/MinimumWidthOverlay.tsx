import { useEffect, useState } from 'react';
import { Monitor } from 'lucide-react';

const MINIMUM_WIDTH = 450;

export function MinimumWidthOverlay() {
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setShowOverlay(window.innerWidth < MINIMUM_WIDTH);
    };

    // Check on mount
    checkWidth();

    // Check on resize
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  if (!showOverlay) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="max-w-md p-8 text-center space-y-4">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-primary/10">
            <Monitor className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Screen Size Too Small
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Dialed works best on larger screens. Please resize your window or rotate your device to continue.
        </p>
        <p className="text-sm text-muted-foreground/80">
          Current width: {window.innerWidth}px
        </p>
      </div>
    </div>
  );
}
