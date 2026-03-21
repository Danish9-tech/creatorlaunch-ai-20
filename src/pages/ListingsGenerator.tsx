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
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!product || !platform) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: { tool: "listings-generator", inputs: { product, platform } },
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
      <ToolPageWrapper title="Listings Generator" description="Generate a complete high-converting product listing instantly.">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input placeholder="e.g., Budget Planner Spreadsheet" value={product} onChange={(e) => setProduct(e.target.value)} />
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
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Full Listing...</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Complete Listing</>}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />SEO Title</CardTitle></CardHeader>
                <CardContent><p className="font-semibold text-lg">{result.title}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Full Description</CardTitle></CardHeader>
                <CardContent><p className="text-sm whitespace-pre-wrap leading-relaxed">{result.description}</p></CardContent>
              </Card>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">Tags (13)</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.tags?.split(",").map((tag: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-muted rounded-md text-xs">{tag.trim()}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Pricing Strategy</CardTitle></CardHeader>
                  <CardContent><p className="text-sm">{result.pricingStrategy}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Target Audience</CardTitle></CardTitle></CardHeader>
                  <CardContent><p className="text-sm">{result.targetAudience}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">SEO Keywords</CardTitle></CardHeader>
                  <CardContent><p className="text-sm">{result.seoKeywords}</p></CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </ToolPageWrapper>
    </DashboardLayout>
  );
};

export default ListingsGenerator;
