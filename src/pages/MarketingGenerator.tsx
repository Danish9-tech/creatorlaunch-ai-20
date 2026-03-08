import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Mail, MessageSquare } from "lucide-react";

const MarketingGenerator = () => {
  const [productName, setProductName] = useState("");
  const [generated, setGenerated] = useState(false);
  const [output, setOutput] = useState("");

  const handleGenerate = () => {
    setOutput(`🚀 ${productName} is LIVE!\n\nTransform your workflow with ${productName}. Get it now at a special launch price!\n\n#digitalproducts #launch`);
    setGenerated(true);
  };

  return (
    <DashboardLayout>
      <ToolPageWrapper title="Marketing Generator" description="Generate marketing content for all channels." output={output}>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2"><Label>Product Name</Label><Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Your product name" /></div>
            <Button className="w-full gradient-primary text-primary-foreground btn-animate" onClick={handleGenerate}>
              <Sparkles className="w-4 h-4 mr-2" /> Generate Content
            </Button>
          </CardContent>
        </Card>

        {generated && (
          <Card className="mt-6 card-animate">
            <CardHeader><CardTitle>Marketing Content</CardTitle></CardHeader>
            <CardContent>
              <Tabs defaultValue="social">
                <TabsList>
                  <TabsTrigger value="social"><MessageSquare className="w-4 h-4 mr-1" /> Social</TabsTrigger>
                  <TabsTrigger value="email"><Mail className="w-4 h-4 mr-1" /> Email</TabsTrigger>
                  <TabsTrigger value="dm">DM Scripts</TabsTrigger>
                </TabsList>
                <TabsContent value="social" className="space-y-3 mt-4">
                  {["Facebook", "Instagram", "TikTok", "Pinterest", "Twitter/X"].map((p) => (
                    <div key={p} className="p-3 bg-muted rounded-lg">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">{p}</p>
                      <p className="text-sm">{output}</p>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="email" className="space-y-3 mt-4">
                  {["Launch Email", "Follow-up", "Discount", "Abandoned Cart"].map((e) => (
                    <div key={e} className="p-3 bg-muted rounded-lg">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">{e}</p>
                      <p className="text-sm">Subject: {productName} — {e}!</p>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="dm" className="mt-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">Hey! I just launched {productName} and I think it'd be perfect for you...</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </ToolPageWrapper>
    </DashboardLayout>
  );
};

export default MarketingGenerator;
