import { Home, FileText, Flag, Link2, DollarSign, User, LogOut, Images, Link, Megaphone, Globe } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
const menuItems = [{
  title: 'Dashboard',
  url: '/',
  icon: Home
}, {
  title: 'Campaigns',
  url: '/campaigns',
  icon: Flag
}, {
  title: 'Creative',
  url: '/creative-library',
  icon: Images
}, {
  title: 'Ads',
  url: '/ads',
  icon: Megaphone
}, {
  title: 'Landing Pages',
  url: '/landing-pages',
  icon: Globe
}, {
  title: 'Links',
  url: '/links',
  icon: Link
}, {
  title: 'Billing',
  url: '/billing',
  icon: DollarSign
}, {
  title: 'Profile',
  url: '/profile',
  icon: User
}];
export function AppSidebar() {
  const {
    state
  } = useSidebar();
  const {
    signOut
  } = useAuth();
  const collapsed = state === 'collapsed';
  return <Sidebar className={collapsed ? 'w-14' : 'w-48'} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        {!collapsed && <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              D
            </div>
            <span className="font-semibold text-foreground">Dialed</span>
            <SidebarTrigger className="ml-auto" />
          </div>}
        {collapsed && <div className="flex items-center justify-center gap-2">
            <SidebarTrigger />
          </div>}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={({
                  isActive
                }) => isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'hover:bg-sidebar-accent/50'}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button variant="ghost" className="w-full justify-start hover:bg-sidebar-accent/50" onClick={signOut}>
                    <LogOut className="h-4 w-4" />
                    {!collapsed && <span>Sign Out</span>}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>;
}