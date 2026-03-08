import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Search } from "lucide-react";

const SeoTools = () => {
  const [keyword, setKeyword] = useState("");
  const [analyzed, setAnalyzed] = useState(false);

  return (
    <DashboardLayout>
      <ToolPageWrapper title="SEO Tools" description="Optimize your listings with keyword analysis and scoring.">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2"><Label>Enter keyword or product title</Label><Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g., digital planner template" /></div>
            <Button className="w-full gradient-primary text-primary-foreground btn-animate" onClick={() => setAnalyzed(true)}>
              <Search className="w-4 h-4 mr-2" /> Analyze SEO
            </Button>
          </CardContent>
        </Card>

        {analyzed && (
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <Card className="card-animate">
              <CardHeader><CardTitle className="text-base">SEO Score</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full border-4 border-highlight flex items-center justify-center">
                    <span className="text-2xl font-display font-bold">85</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm">Title length: <Badge>Good</Badge></p>
                    <p className="text-sm">Keyword density: <Badge variant="secondary">Optimal</Badge></p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="card-animate">
              <CardHeader><CardTitle className="text-base">Suggested Keywords</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[`${keyword}`, `best ${keyword}`, `${keyword} 2026`, `printable ${keyword}`, `${keyword} bundle`].map((k) => (
                    <Badge key={k} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">{k}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </ToolPageWrapper>
    </DashboardLayout>
  );
};

export default SeoTools;
