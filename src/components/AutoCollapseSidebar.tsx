import { useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

const COLLAPSE_BREAKPOINT = 1150;

export function AutoCollapseSidebar() {
  const { setOpen, state } = useSidebar();

  useEffect(() => {
    const handleResize = () => {
      const shouldCollapse = window.innerWidth < COLLAPSE_BREAKPOINT;
      
      // Only auto-collapse, don't auto-expand
      if (shouldCollapse && state !== 'collapsed') {
        setOpen(false);
      }
    };

    // Check on mount
    handleResize();

    // Check on resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setOpen, state]);

  return null;
}
