import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Sparkles, Loader2, Tag, DollarSign, Users, Search, Image, Shield, CheckSquare, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ListingsGenerator = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [product, setProduct] = useState("");
  const [platform, setPlatform] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Get user session manually
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

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

  const publishToGumroad = async () => {
    if (!result || !userId) {
      toast({ title: "Please generate a listing first", variant: "destructive" });
      return;
    }

    setIsPublishing(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('gumroad_access_token')
        .eq('id', userId)
        .single();

      if (!profile?.gumroad_access_token) {
        toast({ title: "Connection Required", description: "Please connect your Gumroad account in Settings", variant: "destructive" });
        setIsPublishing(false);
        return;
      }

      const response = await fetch('/api/gumroad/create-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: profile.gumroad_access_token,
          name: result.title,
          description: result.description,
          price: 0,
          published: false,
        }),
      });

      if (!response.ok) throw new Error('Failed to create Gumroad draft');

      const data = await response.json();
      toast({ title: "Success!", description: "Draft created successfully on Gumroad!" });

      if (data.product?.id) {
        window.open(`https://gumroad.com/products/${data.product.id}/edit`, '_blank');
      }
    } catch (error: any) {
      toast({ title: "Publish failed", description: error.message, variant: "destructive" });
    } finally {
      setIsPublishing(false);
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
              <div className="space-y-3">
                <Button className="w-full gradient-primary text-primary-foreground btn-animate" onClick={handleGenerate} disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Complete Listing</>}
                </Button>

                {result && (
                  <Button onClick={publishToGumroad} disabled={isPublishing} className="w-full bg-pink-600 hover:bg-pink-700 text-white">
                    {isPublishing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</> : <><Upload className="mr-2 h-4 w-4" /> Publish to Gumroad (Draft)</>}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {result && (
            <div className="space-y-4">
              <Card className="border-primary">
                <CardHeader><CardTitle className="flex items-center gap-2 text-primary"><FileText className="w-5 h-5" />SEO Title</CardTitle></CardHeader>
                <CardContent><p className="font-bold text-xl">{result.title}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-4 h-4" />Full Description</CardTitle></CardHeader>
                <CardContent><p className="text-sm whitespace-pre-wrap leading-relaxed">{result.description}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Tag className="w-4 h-4" />Tags</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.tags?.split(",").map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">{tag.trim()}</span>
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
