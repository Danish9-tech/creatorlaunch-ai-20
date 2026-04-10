import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Users, CreditCard, Shield, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, businessUsers: 0, proUsers: 0, freeUsers: 0 });

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/signin");
        return;
      }

      // Use RPC to bypass RLS and check admin
      try {
        const { data: adminCheck } = await supabase.rpc("is_admin", { check_user_id: user.id });
        if (!adminCheck) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
      } catch (rpcErr) {
        // Fallback: direct query
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        if (!roleData) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
      }

      setIsAdmin(true);

      // Load users
      try {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email, full_name, plan, credits")
          .order("created_at", { ascending: false })
          .limit(50);

        if (profiles) {
          setUsers(profiles);
          setStats({
            totalUsers: profiles.length,
            businessUsers: profiles.filter(p => p.plan === "business").length,
            proUsers: profiles.filter(p => p.plan === "pro").length,
            freeUsers: profiles.filter(p => !p.plan || p.plan === "free").length,
          });
        }
      } catch (err) {
        console.error("Error loading users:", err);
      }

      setLoading(false);
    };

    checkAdminAndLoad();
  }, [navigate]);

  const updateUserPlan = async (userId: string, newPlan: string) => {
    try {
      const newCredits = newPlan === "business" ? 999999 : newPlan === "pro" ? 500 : 10;
      await supabase.from("profiles").update({ plan: newPlan, credits: newCredits }).eq("id", userId);
      await supabase.from("user_subscriptions").update({
        plan_slug: newPlan,
        credits_remaining: newPlan === "business" ? -1 : newPlan === "pro" ? 500 : 10,
        status: newPlan === "free" ? "inactive" : "active",
      }).eq("user_id", userId);
      toast({ title: "Success", description: `Updated user to ${newPlan} plan` });
      window.location.reload();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update plan", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Shield className="w-16 h-16 text-destructive" />
          <h2 className="text-xl font-display font-bold">Access Denied</h2>
          <p className="text-muted-foreground">You do not have admin privileges.</p>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Admin</Badge>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Total Users</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.totalUsers}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Business</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-purple-600">{stats.businessUsers}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Pro</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-blue-600">{stats.proUsers}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Free</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-gray-500">{stats.freeUsers}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>User Management</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Plan</th>
                    <th className="text-left p-2">Credits</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-mono text-xs">{u.email}</td>
                      <td className="p-2">{u.full_name || "-"}</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          u.plan === "business" ? "bg-purple-100 text-purple-800" :
                          u.plan === "pro" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"
                        }`}>
                          {u.plan || "free"}
                        </span>
                      </td>
                      <td className="p-2">{u.credits === -1 ? "∞" : u.credits ?? 0}</td>
                      <td className="p-2">
                        <select
                          value={u.plan || "free"}
                          onChange={(e) => updateUserPlan(u.id, e.target.value)}
                          className="text-xs border rounded px-2 py-1"
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                          <option value="business">Business</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
