import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Sparkles, Loader2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const PricingOptimizer = () => {
  const [product, setProduct] = useState("");
  const [niche, setNiche] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!product || !niche || !currentPrice) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: { tool: "pricing-optimizer", inputs: { product, niche, currentPrice } },
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
      <ToolPageWrapper title="Pricing Optimizer" description="Find the perfect price point for your digital products.">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input placeholder="e.g., Canva Template Pack" value={product} onChange={(e) => setProduct(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Niche</Label>
                  <Input placeholder="e.g., Social Media, Business" value={niche} onChange={(e) => setNiche(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Current Price ($)</Label>
                  <Input type="number" placeholder="e.g., 15" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} />
                </div>
              </div>
              <Button className="w-full gradient-primary text-primary-foreground btn-animate" onClick={handleGenerate} disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Optimizing...</> : <><Sparkles className="w-4 h-4 mr-2" /> Optimize Pricing</>}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="md:col-span-1 border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <DollarSign className="w-4 h-4 text-primary" /> Recommended Price
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-primary">{result.recommendedPrice}</p>
                  {result.priceRange && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Range: {result.priceRange.min} — {result.priceRange.max}
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="w-4 h-4 text-primary" /> Reasoning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{result.reasoning}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ToolPageWrapper>
    </DashboardLayout>
  );
};

export default PricingOptimizer;
