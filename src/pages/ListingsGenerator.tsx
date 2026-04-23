import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Sparkles, Loader2, Tag, Search, Shield, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ListingsGenerator = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [product, setProduct] = useState("");
  const [platform, setPlatform] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Get user session using the standard client to ensure stability on Vercel
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
      toast({ title: "Operation failed", description: "Please generate a listing first", variant: "destructive" });
      return;
    }

    setIsPublishing(true);
    try {
      // 1. Fetch the token from marketplace_connections saved via Marketplace Connect page
      const { data: connection, error: connError } = await supabase
        .from('marketplace_connections')
        .select('settings')
        .eq('user_id', userId)
        .eq('marketplace_id', 'gumroad')
        .maybeSingle();

      const gumroadKey = connection?.settings?.api_key;

      if (connError || !gumroadKey) {
        toast({ 
          title: "Connection Required", 
          description: "Please connect your Gumroad account in Marketplace Connect", 
          variant: "destructive" 
        });
        setIsPublishing(false);
        return;
      }

      // 2. Call the Edge Function using the name verified in your dashboard
      const { data, error: publishError } = await supabase.functions.invoke("publish-gumroad-product", {
        body: {
          access_token: gumroadKey,
          name: result.title,
          description: result.description,
          price: 0,
        },
      });

      if (publishError) throw new Error(publishError.message);

      toast({ title: "Success!", description: "Draft created successfully on Gumroad!" });

      // 3. Open the product edit page if ID is returned
      if (data?.product?.id) {
        window.open(`https://gumroad.com/products/${data.product.id}/edit`, '_blank');
      }
    } catch (error: any) {
      console.error('Gumroad publish error:', error);
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
                  <Input 
                    placeholder="e.g., n8n Automation Templates Bundle" 
                    value={product} 
                    onChange={(e) => setProduct(e.target.value)} 
                  />
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
                <Button 
                  className="w-full gradient-primary text-primary-foreground btn-animate" 
                  onClick={handleGenerate} 
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" /> Generate Complete Listing</>
                  )}
                </Button>

                {result && (
                  <Button
                    onClick={publishToGumroad}
                    disabled={isPublishing}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white transition-colors"
                  >
                    {isPublishing ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</>
                    ) : (
                      <><Upload className="mr-2 h-4 w-4" /> Publish to Gumroad (Draft)</>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {result && (
            <div className="space-y-4">
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <FileText className="w-5 h-5" />SEO Title
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-bold text-xl">{result.title}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />Full Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{result.description}</p>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Search className="w-4 h-4" />SEO Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.seoKeywords?.split(",").map((kw: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-muted rounded-md text-xs">{kw.trim()}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Tag className="w-4 h-4" />Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.tags?.split(",").map((tag: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />Policies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{result.policies}</p>
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
