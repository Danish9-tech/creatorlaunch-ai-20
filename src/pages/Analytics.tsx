import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

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
        {/* Header with Demo Data badge */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground text-sm mt-1">Track your product performance across all platforms.</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center rounded-full bg-yellow-100 border border-yellow-400 px-3 py-1 text-xs font-semibold text-yellow-800">
              Demo Data
            </span>
            <span className="text-xs text-muted-foreground">Numbers shown are sample data, not real sales.</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, change: "+14.2%" },
            { label: "Total Sales", value: totalSales.toString(), icon: ShoppingCart, change: "+8.7%" },
            { label: "Avg. Order Value", value: `$${(totalRevenue / totalSales).toFixed(2)}`, icon: BarChart3, change: "+5.1%" },
            { label: "Active Platforms", value: platformData.length.toString(), icon: TrendingUp, change: "" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                    <s.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">{s.value}</div>
                  {s.change && <Badge className="mt-1 bg-green-100 text-green-700 border-green-300 text-xs">{s.change}</Badge>}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader><CardTitle>Revenue — Last 30 Days</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={last30Days}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Performance */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Revenue by Platform</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={platformData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v: number) => [`$${v}`, "Revenue"]} />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                    {platformData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Platform Share</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={platformData} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                    {platformData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`$${v}`, "Revenue"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1">
                {platformData.map((p) => (
                  <div key={p.name} className="flex justify-between text-xs">
                    <span>{p.name}</span>
                    <span className="font-semibold">${p.revenue}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader><CardTitle>Top Performing Products</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b">
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Platform</th>
                    <th className="pb-2">Sales</th>
                    <th className="pb-2">Revenue</th>
                    <th className="pb-2">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 font-medium">{p.name}</td>
                      <td className="py-2 text-muted-foreground">{p.platform}</td>
                      <td className="py-2">{p.sales}</td>
                      <td className="py-2">{p.revenue}</td>
                      <td className="py-2 text-green-600 font-medium">{p.trend}</td>
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
