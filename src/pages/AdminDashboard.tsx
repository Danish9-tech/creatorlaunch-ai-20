import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Users, Zap, Settings, BarChart3, Search, Shield, RefreshCw, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  plan: string;
  plan_type: string;
  credits: number;
  credits_used: number;
  role: string;
  is_active: boolean;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    proUsers: 0,
    freeUsers: 0,
    businessUsers: 0,
  });

  // Check admin access
  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.from("profiles").select("role").single();
      if (!data || (data.role !== "admin" && data.role !== "super_admin")) {
        toast({ title: "Access denied", description: "Admin only area.", variant: "destructive" });
        navigate("/dashboard");
      }
    };
    checkAdmin();
  }, [navigate]);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading users", description: error.message, variant: "destructive" });
    } else {
      setUsers(data || []);
      const total = data?.length || 0;
      const pro = data?.filter(u => u.plan === "pro").length || 0;
      const business = data?.filter(u => u.plan === "business").length || 0;
      setStats({ totalUsers: total, proUsers: pro, freeUsers: total - pro - business, businessUsers: business });
    }
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleUpdatePlan = async (userId: string, newPlan: string) => {
    setUpdatingUser(userId);
    const credits = newPlan === "business" ? 99999 : newPlan === "pro" ? 999 : 25;
    const { error } = await supabase
      .from("profiles")
      .update({ plan: newPlan, plan_type: newPlan, credits })
      .eq("id", userId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Plan updated!", description: `User plan changed to ${newPlan}` });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan, plan_type: newPlan, credits } : u));
    }
    setUpdatingUser(null);
  };

  const handleToggleActive = async (userId: string, current: boolean) => {
    setUpdatingUser(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: !current })
      .eq("id", userId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `User ${!current ? "activated" : "deactivated"}` });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !current } : u));
    }
    setUpdatingUser(null);
  };

  const handleSetAdmin = async (userId: string) => {
    setUpdatingUser(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", userId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Admin role granted" });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: "admin" } : u));
    }
    setUpdatingUser(null);
  };

  const planColor = (plan: string) => {
    if (plan === "business") return "bg-purple-100 text-purple-700";
    if (plan === "pro") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" /> Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">Manage your CreatorWand SaaS</p>
          </div>
          <Button variant="outline" onClick={loadUsers} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500" },
            { label: "Free Users", value: stats.freeUsers, icon: Users, color: "text-gray-500" },
            { label: "Pro Users", value: stats.proUsers, icon: Zap, color: "text-blue-600" },
            { label: "Business Users", value: stats.businessUsers, icon: BarChart3, color: "text-purple-600" },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" /> User Management
              </CardTitle>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-48"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map(user => (
                  <div key={user.id} className="flex flex-wrap items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                    {/* User info */}
                    <div className="flex-1 min-w-[200px]">
                      <p className="font-medium text-sm">{user.full_name || "No name"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${planColor(user.plan)}`}>
                        {user.plan || "free"}
                      </span>
                      {user.role === "admin" || user.role === "super_admin" ? (
                        <Badge variant="destructive" className="text-xs">Admin</Badge>
                      ) : null}
                      <span className={`text-xs px-2 py-1 rounded-full ${user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {user.credits} credits
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Select
                        value={user.plan || "free"}
                        onValueChange={val => handleUpdatePlan(user.id, val)}
                        disabled={updatingUser === user.id}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => handleToggleActive(user.id, user.is_active)}
                        disabled={updatingUser === user.id}
                      >
                        {updatingUser === user.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : user.is_active ? "Deactivate" : "Activate"}
                      </Button>

                      {user.role !== "admin" && user.role !== "super_admin" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => handleSetAdmin(user.id)}
                          disabled={updatingUser === user.id}
                        >
                          Make Admin
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No users found</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" /> Plan Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: "Free", price: "$0/mo", tools: "5 tools", generations: "25/month", color: "border-gray-200" },
                { name: "Pro", price: "$29/mo", tools: "All 50+ tools", generations: "500/month", color: "border-blue-300" },
                { name: "Business", price: "$79/mo", tools: "All tools + bulk", generations: "Unlimited", color: "border-purple-300" },
              ].map((plan, i) => (
                <div key={i} className={`p-4 rounded-lg border-2 ${plan.color}`}>
                  <p className="font-bold text-lg">{plan.name}</p>
                  <p className="text-2xl font-bold text-primary">{plan.price}</p>
                  <p className="text-sm text-muted-foreground mt-2">{plan.tools}</p>
                  <p className="text-sm text-muted-foreground">{plan.generations}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate("/settings")}>
              <Settings className="w-4 h-4 mr-2" /> App Settings
            </Button>
            <Button variant="outline" onClick={() => window.open("https://supabase.com/dashboard/project/lpuoggdzqmlehclbhjfe", "_blank")}>
              <BarChart3 className="w-4 h-4 mr-2" /> Supabase Dashboard
            </Button>
            <Button variant="outline" onClick={() => window.open("https://vercel.com/danish9-techs-projects/creatorlaunch-ai-2026", "_blank")}>
              <Zap className="w-4 h-4 mr-2" /> Vercel Dashboard
            </Button>
            <Button variant="outline" onClick={() => window.open("https://console.groq.com", "_blank")}>
              <Zap className="w-4 h-4 mr-2" /> Groq Console
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
