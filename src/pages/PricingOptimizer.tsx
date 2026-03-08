import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Sparkles } from "lucide-react";

const PricingOptimizer = () => {
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [marketplace, setMarketplace] = useState("");
  const [optimized, setOptimized] = useState(false);

  return (
    <DashboardLayout>
      <ToolPageWrapper title="Pricing Optimizer" description="Get optimal pricing recommendations.">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2"><Label>Product Type</Label>
              <Select value={type} onValueChange={setType}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["eBook", "Template", "Course", "Printable"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Category</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Business" /></div>
            <div className="space-y-2"><Label>Marketplace</Label>
              <Select value={marketplace} onValueChange={setMarketplace}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Etsy", "Gumroad", "Shopify", "Creative Market"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button className="w-full gradient-primary text-primary-foreground btn-animate" onClick={() => setOptimized(true)}>
              <DollarSign className="w-4 h-4 mr-2" /> Optimize Pricing
            </Button>
          </CardContent>
        </Card>

        {optimized && (
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <Card className="card-animate border-primary border-2">
              <CardContent className="p-5 text-center">
                <p className="text-sm text-muted-foreground">Recommended</p>
                <p className="text-4xl font-display font-bold text-primary mt-2">$27</p>
              </CardContent>
            </Card>
            <Card className="card-animate">
              <CardContent className="p-5 text-center">
                <p className="text-sm text-muted-foreground">Competitor Range</p>
                <p className="text-2xl font-display font-bold mt-2">$15 - $45</p>
              </CardContent>
            </Card>
            <Card className="card-animate">
              <CardContent className="p-5 text-center">
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="text-lg font-display font-bold text-highlight mt-2">Mid-Premium</p>
              </CardContent>
            </Card>
          </div>
        )}
      </ToolPageWrapper>
    </DashboardLayout>
  );
};

export default PricingOptimizer;
