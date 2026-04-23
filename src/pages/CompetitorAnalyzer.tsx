import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Sparkles, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Competitor {
  name: string;
  strength: string;
  weakness: string;
  price: string;
}

const CompetitorAnalyzer = () => {
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("");
  const [loading, setLoading] = useState(false);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);

  const handleGenerate = async () => {
    if (!niche || !platform) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    setCompetitors([]);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: { tool: "competitor-analyzer", inputs: { niche, platform } },
      });
      if (error) throw error;
      const result = data?.result;
      if (Array.isArray(result)) {
        setCompetitors(result);
      } else if (typeof result === "string") {
        toast({ title: "Results", description: result.slice(0, 200) });
      } else {
        toast({ title: "No results returned", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <ToolPageWrapper title="Competitor Analyzer" description="Analyze your competition and find your edge.">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Niche</Label>
                  <Input placeholder="e.g., Notion Templates, Digital Art" value={niche} onChange={(e) => setNiche(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                    <SelectContent>
                      {["Etsy", "Gumroad", "Shopify", "Creative Market", "Amazon KDP"].map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full gradient-primary text-primary-foreground btn-animate" onClick={handleGenerate} disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : <><BarChart3 className="w-4 h-4 mr-2" /> Analyze Competitors</>}
              </Button>
            </CardContent>
          </Card>
          {competitors.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              {competitors.map((c, i) => (
                <Card key={i} className="card-animate">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>{c.name}</span>
                      <span className="text-sm font-normal text-muted-foreground">{c.price}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-green-600 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Strength</p>
                      <p className="text-sm text-muted-foreground">{c.strength}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-500 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Weakness</p>
                      <p className="text-sm text-muted-foreground">{c.weakness}</p>
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

export default CompetitorAnalyzer;
