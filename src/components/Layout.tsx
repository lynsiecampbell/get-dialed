import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { MinimumWidthOverlay } from './MinimumWidthOverlay';
import { AutoCollapseSidebar } from './AutoCollapseSidebar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <MinimumWidthOverlay />
      <AutoCollapseSidebar />
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-3">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
