import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Sparkles, Loader2, Tag, DollarSign, Users, Search, Image, Shield, CheckSquare } from "lucide-react";
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
      <ToolPageWrapper title="Listings Generator" description="Generate a complete professional product listing instantly.">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input placeholder="e.g., n8n Automation Templates Bundle" value={product} onChange={(e) => setProduct(e.target.value)} />
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
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Complete Listing...</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Complete Listing</>}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <div className="space-y-4">
              <Card className="border-primary">
                <CardHeader><CardTitle className="flex items-center gap-2 text-primary"><FileText className="w-5 h-5" />SEO Title</CardTitle></CardHeader>
                <CardContent><p className="font-bold text-xl">{result.title}</p></CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-4 h-4" />Category</CardTitle></CardHeader>
                <CardContent><p className="text-sm">{result.category}</p></CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-4 h-4" />Full Description</CardTitle></CardHeader>
                <CardContent><p className="text-sm whitespace-pre-wrap leading-relaxed">{result.description}</p></CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Tag className="w-4 h-4" />Tags (13)</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.tags?.split(",").map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">{tag.trim()}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="w-4 h-4" />Pricing Options</CardTitle></CardHeader>
                <CardContent><p className="text-sm whitespace-pre-wrap">{result.pricingOptions}</p></CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Search className="w-4 h-4" />SEO Keywords</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.seoKeywords?.split(",").map((kw: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-muted rounded-md text-xs">{kw.trim()}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Users className="w-4 h-4" />Target Audience</CardTitle></CardHeader>
                  <CardContent><p className="text-sm">{result.targetAudience}</p></CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Image className="w-4 h-4" />Product Image Ideas (7)</CardTitle></CardHeader>
                <CardContent><p className="text-sm whitespace-pre-wrap">{result.imageIdeas}</p></CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-4 h-4" />Policies</CardTitle></CardHeader>
                <CardContent><p className="text-sm whitespace-pre-wrap">{result.policies}</p></CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="w-4 h-4" />Unique Angle</CardTitle></CardHeader>
                <CardContent><p className="text-sm">{result.uniqueAngle}</p></CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><CheckSquare className="w-4 h-4" />Publishing Checklist</CardTitle></CardHeader>
                <CardContent><p className="text-sm whitespace-pre-wrap">{result.publishingChecklist}</p></CardContent>
              </Card>
            </div>
          )}
        </div>
      </ToolPageWrapper>
    </DashboardLayout>
  );
};

export default ListingsGenerator;
