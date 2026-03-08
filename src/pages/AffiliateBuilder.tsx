import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Sparkles } from "lucide-react";

const AffiliateBuilder = () => {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [generated, setGenerated] = useState(false);
  const output = generated ? `Affiliate Program for ${productName}\n\nCommission: 40% per sale\nCookie duration: 30 days\n\nPromotion Guide:\n1. Share your unique affiliate link\n2. Create content around ${productName}\n3. Earn $${(Number(price) * 0.4).toFixed(2)} per sale` : "";

  return (
    <DashboardLayout>
      <ToolPageWrapper title="Affiliate Program Builder" description="Create affiliate programs for your products." output={output}>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2"><Label>Product Name</Label><Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Product name" /></div>
            <div className="space-y-2"><Label>Product Price ($)</Label><Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="27" /></div>
            <Button className="w-full gradient-primary text-primary-foreground btn-animate" onClick={() => setGenerated(true)}>
              <Users className="w-4 h-4 mr-2" /> Build Program
            </Button>
          </CardContent>
        </Card>

        {generated && (
          <Card className="mt-6 card-animate">
            <CardHeader><CardTitle>Affiliate Program</CardTitle></CardHeader>
            <CardContent><pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">{output}</pre></CardContent>
          </Card>
        )}
      </ToolPageWrapper>
    </DashboardLayout>
  );
};

export default AffiliateBuilder;
