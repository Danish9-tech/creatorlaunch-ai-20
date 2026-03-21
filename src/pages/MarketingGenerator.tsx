import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const MarketingGenerator = () => {
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [platform, setPlatform] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!product || !audience || !platform) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: { tool: "marketing-generator", inputs: { product, audience, platform } },
      });
      if (error) throw error;
      setResult(data?.result);
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const sections = result ? [
    { title: "Headline", content: result.headline },
    { title: "Email Subject Line", content: result.emailSubject },
    { title: "Instagram Caption", content: result.instagramCaption },
    { title: "Twitter / X Post", content: result.twitterPost },
    { title: "Pinterest Description", content: result.pinterestDescription },
  ] : [];

  return (
    <DashboardLayout>
      <ToolPageWrapper title="Marketing Generator" description="Generate marketing copy for all your channels.">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input placeholder="e.g., Social Media Templates" value={product} onChange={(e) => setProduct(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Input placeholder="e.g., Small business owners" value={audience} onChange={(e) => setAudience(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Primary Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                    <SelectContent>
                      {["Instagram", "Twitter/X", "Pinterest", "Facebook", "TikTok", "Email"].map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full gradient-primary text-primary-foreground btn-animate" onClick={handleGenerate} disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Marketing Copy</>}
              </Button>
            </CardContent>
          </Card>

          {sections.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              {sections.map((s, i) => (
                <Card key={i}>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Megaphone className="w-4 h-4" />{s.title}</CardTitle></CardHeader>
                  <CardContent><p className="text-sm whitespace-pre-wrap">{s.content}</p></CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ToolPageWrapper>
    </DashboardLayout>
  );
};

export default MarketingGenerator;
