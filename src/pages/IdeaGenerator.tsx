import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lightbulb, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { ResultDisplay } from "@/components/ResultDisplay";

interface Idea {
  name: string;
  description: string;
  price: string;
  demand: string;
  competition: string;
}

const IdeaGenerator = () => {
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);

  const handleGenerate = async () => {
    if (!niche || !audience || !type) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    setIdeas([]);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: { tool: "idea-generator", inputs: { niche, audience, type } },
      });
      if (error) throw error;
      const result = data?.result;
      if (Array.isArray(result)) {
        setIdeas(result);
      } else if (typeof result === "string") {
        toast({ title: "Generated!", description: result.slice(0, 200) });
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
      <ToolPageWrapper title="Product Idea Generator" description="Get AI-powered product ideas for your niche.">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Niche</Label>
                  <Input placeholder="e.g., Fitness, Finance" value={niche} onChange={(e) => setNiche(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Input placeholder="e.g., Beginners, Entrepreneurs" value={audience} onChange={(e) => setAudience(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Product Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {["eBook", "Template", "Course", "Printable", "Software"].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full gradient-primary text-primary-foreground btn-animate" onClick={handleGenerate} disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Ideas</>}
              </Button>
            </CardContent>
          </Card>
          {ideas.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ideas.map((idea, i) => (
                <Card key={i} className="card-animate">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Lightbulb className="w-4 h-4 text-secondary" /> {idea.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{idea.description}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 bg-muted rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="font-bold text-primary text-sm">{idea.price}</p>
                      </div>
                      <div className="p-2 bg-muted rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Demand</p>
                        <p className="font-bold text-highlight text-sm">{idea.demand}</p>
                      </div>
                      <div className="p-2 bg-muted rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Competition</p>
                        <p className="font-bold text-secondary text-sm">{idea.competition}</p>
                      </div>
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

export default IdeaGenerator;
