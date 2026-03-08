import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layers, Sparkles, Plus, X } from "lucide-react";

const BundleBuilder = () => {
  const [products, setProducts] = useState([""]);
  const [generated, setGenerated] = useState(false);

  return (
    <DashboardLayout>
      <ToolPageWrapper title="Bundle Builder" description="Create product bundles with smart pricing.">
        <Card>
          <CardContent className="p-6 space-y-4">
            <Label>Products in Bundle</Label>
            {products.map((p, i) => (
              <div key={i} className="flex gap-2">
                <Input value={p} onChange={(e) => { const n = [...products]; n[i] = e.target.value; setProducts(n); }} placeholder={`Product ${i + 1}`} />
                {products.length > 1 && <Button variant="ghost" size="icon" onClick={() => setProducts(products.filter((_, j) => j !== i))}><X className="w-4 h-4" /></Button>}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setProducts([...products, ""])} className="btn-animate"><Plus className="w-4 h-4 mr-1" /> Add Product</Button>
            <Button className="w-full gradient-primary text-primary-foreground btn-animate" onClick={() => setGenerated(true)}>
              <Layers className="w-4 h-4 mr-2" /> Build Bundle
            </Button>
          </CardContent>
        </Card>

        {generated && (
          <Card className="mt-6 card-animate">
            <CardHeader><CardTitle>Bundle Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><p className="text-sm text-muted-foreground">Bundle Name</p><p className="font-semibold">Ultimate Creator Bundle</p></div>
              <div><p className="text-sm text-muted-foreground">Description</p><p className="text-sm">Get everything you need in one pack. Save 40% compared to buying individually.</p></div>
              <div><p className="text-sm text-muted-foreground">Pricing Strategy</p><p className="text-sm">Individual total: $97 → Bundle price: <span className="text-primary font-bold">$57</span></p></div>
              <div><p className="text-sm text-muted-foreground">Upsell</p><p className="text-sm">Add premium support for +$12</p></div>
            </CardContent>
          </Card>
        )}
      </ToolPageWrapper>
    </DashboardLayout>
  );
};

export default BundleBuilder;
