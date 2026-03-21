import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const SeoTools = () => {
  const [product, setProduct] = useState("");
  const [keywords, setKeywords] = useState("");
  const [platform, setPlatform] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!product || !keywords || !platform) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: { tool: "seo-tools", inputs: { product, keywords, platform } },
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
      <ToolPageWrapper title="SEO Tools" description="Optimize your product listings for search engines.">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input placeholder="e.g., Wedding Invitation Template" value={product} onChange={(e) => setProduct(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Target Keywords</Label>
                  <Input placeholder="e.g., wedding template, printable" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                    <SelectContent>
                      {["Etsy", "Shopify", "Amazon", "Google", "Pinterest"].map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full gradient-primary text-primary-foreground btn-animate" onClick={handleGenerate} disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Optimizing...</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate SEO Content</>}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Search className="w-4 h-4" /> SEO Title</CardTitle></CardHeader>
                <CardContent><p className="font-semibold">{result.title}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Meta Description</CardTitle></CardHeader>
                <CardContent><p className="text-sm">{result.metaDescription}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Keywords</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords?.split(",").map((kw: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-muted rounded-md text-xs">{kw.trim()}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">H1 Tags</CardTitle></CardHeader>
                <CardContent><p className="text-sm">{result.h1Tags}</p></CardContent>
              </Card>
            </div>
          )}
        </div>
      </ToolPageWrapper>
    </DashboardLayout>
  );
};

export default SeoTools;
