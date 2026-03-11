import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

// Mock realistic data
const last30Days = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - 29 + i);
  const base = 40 + Math.sin(i * 0.3) * 20 + Math.random() * 30;
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    revenue: Math.round(base * 100) / 100,
    sales: Math.floor(base / 8),
  };
});

const platformData = [
  { name: "Etsy", revenue: 2340, sales: 156, color: "hsl(25, 100%, 62%)" },
  { name: "Gumroad", revenue: 1890, sales: 98, color: "hsl(348, 100%, 65%)" },
  { name: "Shopify", revenue: 1450, sales: 72, color: "hsl(244, 95%, 60%)" },
  { name: "Creative Market", revenue: 980, sales: 45, color: "hsl(166, 100%, 48%)" },
  { name: "Amazon KDP", revenue: 670, sales: 34, color: "hsl(230, 25%, 50%)" },
];

const topProducts = [
  { name: "Social Media Template Bundle", platform: "Etsy", sales: 89, revenue: "$1,245", trend: "+12%" },
  { name: "Digital Planner 2026", platform: "Gumroad", sales: 67, revenue: "$938", trend: "+8%" },
  { name: "Brand Kit Templates", platform: "Creative Market", sales: 45, revenue: "$675", trend: "+23%" },
  { name: "Content Calendar Spreadsheet", platform: "Etsy", sales: 34, revenue: "$510", trend: "+5%" },
  { name: "Instagram Story Templates", platform: "Shopify", sales: 28, revenue: "$420", trend: "+18%" },
];

const totalRevenue = platformData.reduce((a, b) => a + b.revenue, 0);
const totalSales = platformData.reduce((a, b) => a + b.sales, 0);

const Analytics = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-display font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm">Track your product performance across all platforms.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, change: "+14.2%" },
            { label: "Total Sales", value: totalSales.toString(), icon: ShoppingCart, change: "+8.7%" },
            { label: "Avg. Order Value", value: `$${(totalRevenue / totalSales).toFixed(2)}`, icon: BarChart3, change: "+5.1%" },
            { label: "Active Platforms", value: platformData.length.toString(), icon: TrendingUp, change: "" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="text-2xl font-display font-bold mt-1">{s.value}</p>
                      {s.change && <span className="text-xs text-highlight font-medium">{s.change}</span>}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <s.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue — Last 30 Days</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={last30Days}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(348, 100%, 65%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(348, 100%, 65%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 20%, 90%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(348, 100%, 65%)" fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Platform Performance */}
          <Card>
            <CardHeader><CardTitle className="text-base">Revenue by Platform</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={platformData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 20%, 90%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(v: number) => [`$${v}`, "Revenue"]} />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {platformData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Platform Breakdown Pie */}
          <Card>
            <CardHeader><CardTitle className="text-base">Platform Share</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={platformData} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                      {platformData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`$${v}`, "Revenue"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 shrink-0">
                  {platformData.map(p => (
                    <div key={p.name} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                      <span>{p.name}</span>
                      <span className="font-semibold ml-auto">${p.revenue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader><CardTitle className="text-base">Top Performing Products</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-muted-foreground">Product</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Platform</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Sales</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Revenue</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="p-3"><Badge variant="secondary" className="text-xs">{p.platform}</Badge></td>
                      <td className="p-3 text-right">{p.sales}</td>
                      <td className="p-3 text-right font-semibold">{p.revenue}</td>
                      <td className="p-3 text-right text-highlight font-medium">{p.trend}</td>
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
};

export default Analytics;
