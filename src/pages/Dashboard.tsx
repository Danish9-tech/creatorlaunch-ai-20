import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FileText, DollarSign, Globe, Lightbulb, TrendingUp, Megaphone, BarChart3, Clock, CheckSquare, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface ActivityItem {
  id: string;
  action: string;
  tool: string;
  time: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [productCount, setProductCount] = useState(0);
  const [listingsCount, setListingsCount] = useState(0);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async (userId: string) => {
      const { count: prodCount } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      setProductCount(prodCount ?? 0);

      const { count: listCount } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      setListingsCount(listCount ?? 0);

      const { data: logs } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (logs && logs.length > 0) {
        setActivity(
          logs.map((log) => ({
            id: log.id,
            action: log.action,
            tool: log.entity_type || "Dashboard",
            time: new Date(log.created_at).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }))
        );
      }
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadData(session.user.id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const stats = [
    { label: "Total Products", value: productCount, icon: Package, color: "from-primary to-secondary" },
    { label: "Active Listings", value: listingsCount, icon: FileText, color: "from-accent to-primary" },
    { label: "Revenue This Month", value: "$0", icon: DollarSign, color: "from-highlight to-accent" },
    { label: "Platforms Connected", value: 0, icon: Globe, color: "from-secondary to-highlight" },
  ];

  const quickActions = [
    { label: "Create New Product", icon: Package, url: "/products" },
    { label: "Generate Ideas", icon: Lightbulb, url: "/idea-generator" },
    { label: "View Analytics", icon: BarChart3, url: "/analytics" },
    { label: "Find Trends", icon: TrendingUp, url: "/trend-finder" },
    { label: "Marketing Content", icon: Megaphone, url: "/marketing-generator" },
    { label: "Launch Checklist", icon: CheckSquare, url: "/launch-checklist" },
  ];

  return (
    <DashboardLayout loading={loading}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back! 🚀</h1>
          <p className="text-muted-foreground">Here's what's happening with your products.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                    <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickActions.map((action, i) => (
              <motion.div key={action.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => navigate(action.url)}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-sm">{action.label}</span>
                </Button>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            {activity.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/analytics")}>
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No recent activity yet"
                description="Start using tools to see your activity here"
              />
            ) : (
              <div className="space-y-3">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.tool}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
