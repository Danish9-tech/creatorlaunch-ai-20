import {
  LayoutDashboard, Package, Lightbulb, TrendingUp, FileText, Megaphone,
  Image, Search, BarChart3, DollarSign, Layers, Shield, Users, Languages,
  CheckSquare, Download, User, Settings, LogOut, Wand2,
  ChevronDown, Wrench, PieChart,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { toolCategories, getToolsByCategory } from "@/config/tools";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const mainNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Products", url: "/products", icon: Package },
  { title: "Analytics", url: "/analytics", icon: PieChart },
];

const toolItems = [
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
  { title: "Export Tools", url: "/export-tools", icon: Download },
];

const utilNav = [
  { title: "Launch Checklist", url: "/launch-checklist", icon: CheckSquare },
];

const bottomItems = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [microOpen, setMicroOpen] = useState<Record<string, boolean>>({});

  const toggleMicro = (key: string) => setMicroOpen(prev => ({ ...prev, [key]: !prev[key] }));

  const toolsActive = toolItems.some(t => location.pathname === t.url) ||
    location.pathname.startsWith("/tool/");

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    toast({ title: "Logged out", description: "You have been signed out." });
    navigate("/signin");
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
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
        {/* Main */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-xs tracking-wider">
            {!collapsed && "Main"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="text-sidebar-foreground/70 hover:text-sidebar-primary-foreground hover:bg-sidebar-accent transition-colors" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools Dropdown */}
        <SidebarGroup>
          <SidebarGroupContent>
            <Collapsible open={toolsOpen || toolsActive} onOpenChange={setToolsOpen}>
              <CollapsibleTrigger className={cn(
                "flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors",
                toolsActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 hover:text-sidebar-primary-foreground"
              )}>
                <span className="flex items-center gap-2"><Wrench className="h-3.5 w-3.5" />{!collapsed && "Tools"}</span>
                {!collapsed && <ChevronDown className={cn("h-3 w-3 transition-transform", (toolsOpen || toolsActive) && "rotate-180")} />}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenu className="ml-2 border-l border-sidebar-border pl-2 mt-1">
                  {toolItems.map(item => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} end className="text-sidebar-foreground/60 hover:text-sidebar-primary-foreground hover:bg-sidebar-accent transition-colors text-xs py-1.5" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                          <item.icon className="mr-2 h-3.5 w-3.5 shrink-0" />
                          {!collapsed && <span className="truncate">{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Micro-Tools */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-xs tracking-wider">
              Micro-Tools
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {toolCategories.map(cat => {
                const catTools = getToolsByCategory(cat.key);
                const isOpen = microOpen[cat.key] ?? false;
                const hasActive = catTools.some(t => location.pathname === `/tool/${t.slug}`);

                return (
                  <Collapsible key={cat.key} open={isOpen || hasActive} onOpenChange={() => toggleMicro(cat.key)}>
                    <CollapsibleTrigger className={cn(
                      "flex items-center justify-between w-full px-3 py-2 text-xs font-medium rounded-md transition-colors",
                      hasActive ? "text-sidebar-primary bg-sidebar-accent/50" : "text-sidebar-foreground/60 hover:text-sidebar-primary-foreground hover:bg-sidebar-accent"
                    )}>
                      <span>{cat.label}</span>
                      <ChevronDown className={cn("h-3 w-3 transition-transform", (isOpen || hasActive) && "rotate-180")} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenu className="ml-2 border-l border-sidebar-border pl-2 mt-1">
                        {catTools.map(tool => (
                          <SidebarMenuItem key={tool.slug}>
                            <SidebarMenuButton asChild>
                              <NavLink to={`/tool/${tool.slug}`} end className="text-sidebar-foreground/60 hover:text-sidebar-primary-foreground hover:bg-sidebar-accent transition-colors text-xs py-1.5" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                                <tool.icon className="mr-2 h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{tool.title}</span>
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Utilities */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {utilNav.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="text-sidebar-foreground/70 hover:text-sidebar-primary-foreground hover:bg-sidebar-accent transition-colors" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
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
          {bottomItems.map(item => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url} end className="text-sidebar-foreground/70 hover:text-sidebar-primary-foreground hover:bg-sidebar-accent transition-colors" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                  <item.icon className="mr-2 h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70 hover:text-primary hover:bg-sidebar-accent cursor-pointer" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
