import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, CreditCard, Zap, Settings } from "lucide-react";

export default function Admin() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    proUsers: 0,
    totalCreditsUsed: 0,
    totalGenerations: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      // Load user statistics
      const { data: profiles } = await supabase
        .from("profiles")
        .select("plan, credits_used");
      
      if (profiles) {
        setStats({
          totalUsers: profiles.length,
          proUsers: profiles.filter(p => p.plan === "pro" || p.plan === "business").length,
          totalCreditsUsed: profiles.reduce((sum, p) => sum + (p.credits_used || 0), 0),
          totalGenerations: profiles.reduce((sum, p) => sum + (p.credits_used || 0), 0)
        });
      }
    };
    loadStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pro Users</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.proUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Generations</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGenerations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCreditsUsed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Add more admin features: user management, system settings, etc. */}
      </div>
    </DashboardLayout>
  );
}
