import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles } from "lucide-react";

const platforms = ["Etsy", "Gumroad", "Shopify", "WooCommerce", "Creative Market", "Payhip", "Sellfy"];

const ListingsGenerator = () => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [generated, setGenerated] = useState(false);
  const [output, setOutput] = useState("");

  const handleGenerate = () => {
    const result = `Title: ${productName} - Premium Digital Product\n\nDescription: ${description}\n\nSEO Title: Buy ${productName} | Best Digital Product\nMeta Description: Get ${productName} - the ultimate digital product for your needs.\nSlug: ${productName.toLowerCase().replace(/\s+/g, "-")}\nTags: digital product, ${productName.toLowerCase()}, premium\nFAQ: Q: What's included? A: Full product with all files.`;
    setOutput(result);
    setGenerated(true);
  };

  return (
    <DashboardLayout>
      <ToolPageWrapper title="Listings Generator" description="Generate optimized listings for any marketplace." output={output}>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><Label>Product Name</Label><Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Enter product name" /></div>
              <div className="space-y-2"><Label>Product Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your product..." /></div>
              <Button className="w-full gradient-primary text-primary-foreground btn-animate" onClick={handleGenerate}>
                <Sparkles className="w-4 h-4 mr-2" /> Generate Listings
              </Button>
            </CardContent>
          </Card>

          {generated && (
            <Card className="card-animate">
              <CardHeader><CardTitle>Generated Listings</CardTitle></CardHeader>
              <CardContent>
                <Tabs defaultValue="Etsy">
                  <TabsList className="flex-wrap h-auto gap-1">
                    {platforms.map((p) => <TabsTrigger key={p} value={p} className="text-xs">{p}</TabsTrigger>)}
                  </TabsList>
                  {platforms.map((p) => (
                    <TabsContent key={p} value={p}>
                      <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">{output.replace("Best Digital Product", `Best ${p} Product`)}</pre>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </ToolPageWrapper>
    </DashboardLayout>
  );
};

export default ListingsGenerator;
