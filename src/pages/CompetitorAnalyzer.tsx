import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Sparkles } from "lucide-react";

const CompetitorAnalyzer = () => {
  const [url, setUrl] = useState("");
  const [analyzed, setAnalyzed] = useState(false);

  return (
    <DashboardLayout>
      <ToolPageWrapper title="Competitor Analyzer" description="Analyze competitor listings for insights.">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2"><Label>Competitor Listing URL</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://etsy.com/listing/..." /></div>
            <Button className="w-full gradient-primary text-primary-foreground btn-animate" onClick={() => setAnalyzed(true)}>
              <BarChart3 className="w-4 h-4 mr-2" /> Analyze Listing
            </Button>
          </CardContent>
        </Card>

        {analyzed && (
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            {[
              { title: "Title Structure", content: "Well-optimized, 80 chars. Uses power words." },
              { title: "Keywords Found", content: "12 relevant keywords detected. Missing long-tail variations." },
              { title: "Description Quality", content: "Score: 7/10. Could improve bullet points and formatting." },
              { title: "Optimization Tips", content: "Add more keywords to tags. Improve first paragraph hook. Add FAQ section." },
            ].map((item) => (
              <Card key={item.title} className="card-animate">
                <CardHeader><CardTitle className="text-base">{item.title}</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{item.content}</p></CardContent>
              </Card>
            ))}
          </div>
        )}
      </ToolPageWrapper>
    </DashboardLayout>
  );
};

export default CompetitorAnalyzer;
