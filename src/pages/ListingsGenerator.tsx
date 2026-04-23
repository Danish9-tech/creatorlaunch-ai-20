import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Sparkles, Loader2, Tag, Search, Shield, Upload, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ListingsGenerator = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [product, setProduct] = useState("");
  const [platform, setPlatform] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [connections, setConnections] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase
        .from("marketplace_connections")
        .select("marketplace_id")
        .eq("user_id", user.id)
        .eq("is_active", true);
      setConnections((data || []).map((c: any) => c.marketplace_id));
    };
    init();
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

  const platformId = platform.toLowerCase();
  const isPlatformConnected = connections.includes(platformId);
  const supportsDirectPublish = ["gumroad", "etsy", "shopify"].includes(platformId);

  const publishToMarketplace = async () => {
    if (!result || !userId) {
      toast({ title: "Generate a listing first", variant: "destructive" });
      return;
    }
    if (!supportsDirectPublish) {
      toast({
        title: `${platform} doesn't support direct publishing`,
        description: "Use Copy buttons to paste your listing manually.",
      });
      return;
    }
    if (!isPlatformConnected) {
      toast({
        title: "Connection Required",
        description: `Connect your ${platform} account in Marketplace Connect first.`,
        variant: "destructive",
      });
      return;
    }
    setIsPublishing(true);
    try {
      const tags =
        typeof result.tags === "string"
          ? result.tags.split(",").map((t: string) => t.trim())
          : Array.isArray(result.tags)
          ? result.tags
          : [];
      const { data, error } = await supabase.functions.invoke("publish-to-marketplace", {
        body: {
          platform: platformId,
          title: result.title,
          description: result.description,
          price: result.price ?? 0,
          tags,
        },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);

      toast({
        title: `Published draft to ${platform}!`,
        description: "Opening the product editor in a new tab.",
      });
      if ((data as any)?.url) window.open((data as any).url, "_blank");
    } catch (err: any) {
      console.error("Publish error:", err);
      toast({ title: "Publish failed", description: err.message, variant: "destructive" });
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

                {result && platform && (
                  <Button
                    onClick={publishToMarketplace}
                    disabled={isPublishing || !supportsDirectPublish}
                    className="w-full gradient-primary text-primary-foreground btn-animate"
                  >
                    {isPublishing ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing to {platform}...</>
                    ) : supportsDirectPublish ? (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        {isPlatformConnected
                          ? `Publish Draft to ${platform}`
                          : `Connect ${platform} to Publish`}
                      </>
                    ) : (
                      <><ExternalLink className="mr-2 h-4 w-4" /> {platform} doesn't support direct publish</>
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
