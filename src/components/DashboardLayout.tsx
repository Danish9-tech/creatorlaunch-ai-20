import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { tools } from "@/config/tools";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardLayout({ children, loading }: { children: React.ReactNode; loading?: boolean }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return tools.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)).slice(0, 8);
  }, [searchQuery]);

  // Mock recent notifications
  const notifications = [
    { id: 1, text: "Niche Finder generation completed", time: "2 min ago" },
    { id: 2, text: "SEO Description improved", time: "15 min ago" },
    { id: 3, text: "Product Name generated", time: "1 hour ago" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between border-b bg-card px-4 gap-4 sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="shrink-0" />
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tools..."
                  className="pl-9 w-64 bg-muted/50 border-0"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                />
                {searchOpen && filteredTools.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-80 bg-popover border border-border rounded-lg shadow-lg z-50 py-1 max-h-80 overflow-y-auto">
                    {filteredTools.map((tool) => (
                      <button
                        key={tool.slug}
                        className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 transition-colors"
                        onMouseDown={() => { navigate(`/tool/${tool.slug}`); setSearchQuery(""); setSearchOpen(false); }}
                      >
                        <tool.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{tool.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{tool.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {searchOpen && searchQuery.trim() && filteredTools.length === 0 && (
                  <div className="absolute top-full left-0 mt-1 w-80 bg-popover border border-border rounded-lg shadow-lg z-50 p-4 text-center text-sm text-muted-foreground">
                    No tools found for "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full gradient-primary" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72 p-0">
                  <div className="p-3 border-b border-border">
                    <p className="font-display font-semibold text-sm">Notifications</p>
                  </div>
                  <div className="py-1">
                    {notifications.map((n) => (
                      <div key={n.id} className="px-3 py-2.5 hover:bg-muted transition-colors">
                        <p className="text-sm">{n.text}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="gradient-primary text-primary-foreground font-display font-bold text-sm">
                        CL
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/signin")}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 overflow-auto">
            {loading ? (
              <div className="space-y-6 max-w-4xl mx-auto">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
                </div>
                <Skeleton className="h-48 rounded-lg" />
              </div>
            ) : children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
