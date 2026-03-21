import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Trend {
  trend: string;
  description: string;
  potential: string;
}

const TrendFinder = () => {
  const [niche, setNiche] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState<Trend[]>([]);

  const handleGenerate = async () => {
    if (!niche || !timeframe) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTrends([]);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: { tool: "trend-finder", inputs: { niche, timeframe } },
      });
      if (error) throw error;
      const result = data?.result;
      if (Array.isArray(result)) setTrends(result);
      else if (result?.text) toast({ title: "Results", description: result.text });
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const potentialColor = (p: string) => {
    if (p?.toLowerCase() === "high") return "text-green-600";
    if (p?.toLowerCase() === "medium") return "text-yellow-600";
    return "text-red-500";
  };

  return (
    <DashboardLayout>
      <ToolPageWrapper title="Trend Finder" description="Discover trending product opportunities in your niche.">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Niche</Label>
                  <Input placeholder="e.g., Digital Art, Productivity" value={niche} onChange={(e) => setNiche(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Timeframe</Label>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger><SelectValue placeholder="Select timeframe" /></SelectTrigger>
                    <SelectContent>
                      {["This Week", "This Month", "This Quarter", "This Year"].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full gradient-primary text-primary-foreground btn-animate" onClick={handleGenerate} disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Finding Trends...</> : <><Sparkles className="w-4 h-4 mr-2" /> Find Trends</>}
              </Button>
            </CardContent>
          </Card>

          {trends.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trends.map((trend, i) => (
                <Card key={i} className="card-animate">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="w-4 h-4 text-primary" />{trend.trend}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{trend.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Potential:</span>
                      <span className={`text-sm font-bold ${potentialColor(trend.potential)}`}>{trend.potential}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ToolPageWrapper>
    </DashboardLayout>
  );
};

export default TrendFinder;
