import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ListingsGenerator = () => {
  const [product, setProduct] = useState("");
  const [platform, setPlatform] = useState("");
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!product || !platform || !niche) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: { tool: "listings-generator", inputs: { product, platform, niche } },
      });
      if (error) throw error;
      setResult(data?.result);
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <ToolPageWrapper title="Listings Generator" description="Generate optimized product listings for any platform.">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input placeholder="e.g., Budget Planner Template" value={product} onChange={(e) => setProduct(e.target.value)} />
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
                <div className="space-y-2">
                  <Label>Niche</Label>
                  <Input placeholder="e.g., Personal Finance" value={niche} onChange={(e) => setNiche(e.target.value)} />
                </div>
              </div>
              <Button className="w-full gradient-primary text-primary-foreground btn-animate" onClick={handleGenerate} disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Listing</>}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-4 h-4" /> Title</CardTitle></CardHeader>
                <CardContent><p className="font-semibold">{result.title}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent><p className="text-sm whitespace-pre-wrap">{result.description}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.tags?.split(",").map((tag: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-muted rounded-md text-xs">{tag.trim()}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ToolPageWrapper>
    </DashboardLayout>
  );
};

export default ListingsGenerator;
