import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

const trends = [
  { niche: "AI Prompt Templates", demand: 95, competition: "Low", price: "$15-$45" },
  { niche: "Notion Dashboards", demand: 88, competition: "Medium", price: "$19-$39" },
  { niche: "PLR Digital Planners", demand: 82, competition: "Low", price: "$12-$27" },
  { niche: "Social Media Templates", demand: 90, competition: "High", price: "$9-$29" },
  { niche: "Online Course Workbooks", demand: 78, competition: "Low", price: "$17-$47" },
  { niche: "Resume Templates", demand: 85, competition: "Medium", price: "$10-$25" },
];

const TrendFinder = () => (
  <DashboardLayout>
    <ToolPageWrapper title="Trend Finder" description="Discover trending digital product opportunities.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trends.map((t, i) => (
          <Card key={i} className="card-animate">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-sm">{t.niche}</h3>
                <TrendingUp className="w-4 h-4 text-highlight" />
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="h-2 rounded-full gradient-primary" style={{ width: `${t.demand}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Demand: {t.demand}%</span>
                <Badge variant={t.competition === "Low" ? "default" : "secondary"} className="text-xs">{t.competition}</Badge>
              </div>
              <p className="text-sm font-medium">Price: {t.price}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </ToolPageWrapper>
  </DashboardLayout>
);

export default TrendFinder;
