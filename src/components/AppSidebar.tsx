import {
  LayoutDashboard, Package, Lightbulb, TrendingUp, FileText, Megaphone,
  Image, Search, BarChart3, DollarSign, Layers, Shield, Users, Languages,
  CheckSquare, Download, User, Settings, LogOut, Rocket
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Product Creator", url: "/product-creator", icon: Package },
  { title: "Idea Generator", url: "/idea-generator", icon: Lightbulb },
  { title: "Trend Finder", url: "/trend-finder", icon: TrendingUp },
  { title: "Listings Generator", url: "/listings-generator", icon: FileText },
  { title: "Marketing Generator", url: "/marketing-generator", icon: Megaphone },
  { title: "Mockups & Videos", url: "/mockups-videos", icon: Image },
  { title: "SEO Tools", url: "/seo-tools", icon: Search },
  { title: "Competitor Analyzer", url: "/competitor-analyzer", icon: BarChart3 },
  { title: "Pricing Optimizer", url: "/pricing-optimizer", icon: DollarSign },
  { title: "Bundle Builder", url: "/bundle-builder", icon: Layers },
  { title: "License Generator", url: "/license-generator", icon: Shield },
  { title: "Affiliate Builder", url: "/affiliate-builder", icon: Users },
  { title: "Listing Translator", url: "/listing-translator", icon: Languages },
  { title: "Launch Checklist", url: "/launch-checklist", icon: CheckSquare },
  { title: "Export Tools", url: "/export-tools", icon: Download },
];

const bottomItems = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Rocket className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-lg text-sidebar-primary-foreground">
              CreatorLaunch
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-xs tracking-wider">
            {!collapsed && "Tools"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="text-sidebar-foreground/70 hover:text-sidebar-primary-foreground hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {bottomItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end
                  className="text-sidebar-foreground/70 hover:text-sidebar-primary-foreground hover:bg-sidebar-accent transition-colors"
                  activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                >
                  <item.icon className="mr-2 h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70 hover:text-primary hover:bg-sidebar-accent cursor-pointer">
              <LogOut className="mr-2 h-4 w-4 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
