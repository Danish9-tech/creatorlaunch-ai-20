import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FileText, DollarSign, Globe, Lightbulb, TrendingUp, Megaphone, BarChart3, Clock, CheckSquare, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ActivityItem {
  id: string;
  action: string;
  tool: string;
  time: string;
}

function getProductCount(): number {
  try { return JSON.parse(localStorage.getItem("creatorlaunch_products") || "[]").length; } catch { return 0; }
}

function getRecentActivity(): ActivityItem[] {
  try {
    const history = JSON.parse(localStorage.getItem("creatorlaunch_activity") || "[]") as ActivityItem[];
    return history.slice(0, 5);
  } catch { return []; }
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [productCount, setProductCount] = useState(0);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    setProductCount(getProductCount());
    setActivity(getRecentActivity());
  }, []);

  const stats = [
    { label: "Total Products", value: productCount, icon: Package, color: "from-primary to-secondary" },
    { label: "Active Listings", value: 0, icon: FileText, color: "from-accent to-primary" },
    { label: "Revenue This Month", value: "$0", icon: DollarSign, color: "from-highlight to-accent", isString: true },
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
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">
            Welcome back! <span className="text-gradient">🚀</span>
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your products.</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="card-animate overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl sm:text-3xl font-display font-bold mt-1">
                        {stat.isString ? stat.value : stat.value}
                      </p>
                    </div>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-display font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action, i) => (
              <motion.div key={action.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.05 }}>
                <Card className="card-animate cursor-pointer group" onClick={() => navigate(action.url)}>
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:gradient-primary group-hover:text-primary-foreground transition-all">
                      <action.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold">Recent Activity</h2>
            {activity.length > 0 && (
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/analytics")}>
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
          <Card>
            <CardContent className="p-0">
              {activity.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="No recent activity"
                  description="Start using tools to see your activity history here."
                  actionLabel="Try a Tool"
                  actionUrl="/tool/niche-finder"
                />
              ) : (
                <div className="divide-y">
                  {activity.map(item => (
                    <div key={item.id} className="px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.action}</p>
                          <p className="text-xs text-muted-foreground">{item.tool}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{item.time}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
