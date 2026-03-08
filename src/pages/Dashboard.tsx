import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Package, FileText, Search, TrendingUp, Lightbulb, Megaphone, BarChart3, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const stats = [
  { label: "Products Created", value: 12, icon: Package, color: "from-primary to-secondary" },
  { label: "Listings Generated", value: 34, icon: FileText, color: "from-accent to-primary" },
  { label: "SEO Score Avg", value: 87, icon: Search, color: "from-highlight to-accent", suffix: "%" },
  { label: "Trending Niches", value: 5, icon: TrendingUp, color: "from-secondary to-highlight" },
];

const quickActions = [
  { label: "Create Product", icon: Package, url: "/product-creator" },
  { label: "Generate Ideas", icon: Lightbulb, url: "/idea-generator" },
  { label: "Find Trends", icon: TrendingUp, url: "/trend-finder" },
  { label: "Generate Listing", icon: FileText, url: "/listings-generator" },
  { label: "Marketing Content", icon: Megaphone, url: "/marketing-generator" },
  { label: "Analyze Competitors", icon: BarChart3, url: "/competitor-analyzer" },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold">
            Welcome back! <span className="text-gradient">🚀</span>
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your products.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="card-animate overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-display font-bold mt-1">
                        {stat.value}{stat.suffix || ""}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-primary-foreground" />
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
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <Card
                  className="card-animate cursor-pointer group"
                  onClick={() => navigate(action.url)}
                >
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
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
