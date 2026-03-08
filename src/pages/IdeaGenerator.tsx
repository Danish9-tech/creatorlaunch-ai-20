import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lightbulb, Sparkles } from "lucide-react";

const IdeaGenerator = () => {
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [type, setType] = useState("");
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => setGenerated(true);

  return (
    <DashboardLayout>
      <ToolPageWrapper title="Product Idea Generator" description="Get AI-powered product ideas for your niche.">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><Label>Niche</Label><Input placeholder="e.g., Fitness, Finance" value={niche} onChange={(e) => setNiche(e.target.value)} /></div>
              <div className="space-y-2"><Label>Target Audience</Label><Input placeholder="e.g., Beginners, Entrepreneurs" value={audience} onChange={(e) => setAudience(e.target.value)} /></div>
              <div className="space-y-2"><Label>Product Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {["eBook", "Template", "Course", "Printable", "Software"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full gradient-primary text-primary-foreground btn-animate" onClick={handleGenerate}>
                <Sparkles className="w-4 h-4 mr-2" /> Generate Ideas
              </Button>
            </CardContent>
          </Card>

          {generated && (
            <Card className="card-animate">
              <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-secondary" /> Generated Idea</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><p className="text-sm text-muted-foreground">Product Idea</p><p className="font-semibold">{niche} Mastery {type} for {audience}</p></div>
                <div><p className="text-sm text-muted-foreground">Suggested Structure</p><p>5 chapters with worksheets and templates</p></div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-muted rounded-lg text-center"><p className="text-xs text-muted-foreground">Price</p><p className="font-bold text-primary">$27</p></div>
                  <div className="p-3 bg-muted rounded-lg text-center"><p className="text-xs text-muted-foreground">Demand</p><p className="font-bold text-highlight">High</p></div>
                  <div className="p-3 bg-muted rounded-lg text-center"><p className="text-xs text-muted-foreground">Competition</p><p className="font-bold text-secondary">Medium</p></div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ToolPageWrapper>
    </DashboardLayout>
  );
};

export default IdeaGenerator;
