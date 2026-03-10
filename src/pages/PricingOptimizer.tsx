import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, Percent, Calculator } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const platformFees: Record<string, number> = {
  "Etsy": 6.5,
  "Gumroad": 10,
  "Shopify": 2.9,
  "Creative Market": 30,
};

const PricingOptimizer = () => {
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [marketplace, setMarketplace] = useState("");
  const [comp1, setComp1] = useState("");
  const [comp2, setComp2] = useState("");
  const [comp3, setComp3] = useState("");
  const [optimized, setOptimized] = useState(false);

  const compPrices = [comp1, comp2, comp3].map(Number).filter((n) => n > 0);
  const avgComp = compPrices.length ? compPrices.reduce((a, b) => a + b, 0) / compPrices.length : 25;
  const minComp = compPrices.length ? Math.min(...compPrices) : 15;
  const maxComp = compPrices.length ? Math.max(...compPrices) : 45;
  const suggested = Math.round(avgComp * 1.05 * 100) / 100;
  const feePercent = platformFees[marketplace] || 5;
  const fee = Math.round(suggested * feePercent) / 100;
  const net = Math.round((suggested - fee) * 100) / 100;
  const roi = compPrices.length ? Math.round(((suggested - minComp) / minComp) * 100) : 35;

  return (
    <DashboardLayout>
      <ToolPageWrapper title="Pricing Optimizer" description="Get optimal pricing recommendations.">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Product Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["eBook", "Template", "Course", "Printable", "Plugin", "Graphics"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Business, Design" />
            </div>
            <div className="space-y-2">
              <Label>Marketplace</Label>
              <Select value={marketplace} onValueChange={setMarketplace}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{Object.keys(platformFees).map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="border-t border-border pt-4">
              <Label className="text-base font-display font-semibold mb-3 block">Competitor Prices</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Competitor 1</Label>
                  <Input type="number" placeholder="$0" value={comp1} onChange={(e) => setComp1(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Competitor 2</Label>
                  <Input type="number" placeholder="$0" value={comp2} onChange={(e) => setComp2(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Competitor 3</Label>
                  <Input type="number" placeholder="$0" value={comp3} onChange={(e) => setComp3(e.target.value)} />
                </div>
              </div>
            </div>

            <Button className="w-full gradient-primary text-primary-foreground btn-animate" onClick={() => setOptimized(true)}>
              <DollarSign className="w-4 h-4 mr-2" /> Optimize Pricing
            </Button>
          </CardContent>
        </Card>

        <AnimatePresence>
          {optimized && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
            >
              <Card className="card-animate border-primary border-2">
                <CardContent className="p-5 text-center">
                  <DollarSign className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-xs text-muted-foreground">Suggested Price</p>
                  <p className="text-3xl font-display font-bold text-primary mt-1">${suggested}</p>
                </CardContent>
              </Card>
              <Card className="card-animate">
                <CardContent className="p-5 text-center">
                  <Percent className="w-5 h-5 mx-auto text-secondary mb-1" />
                  <p className="text-xs text-muted-foreground">Platform Fee ({feePercent}%)</p>
                  <p className="text-2xl font-display font-bold mt-1">-${fee}</p>
                </CardContent>
              </Card>
              <Card className="card-animate">
                <CardContent className="p-5 text-center">
                  <Calculator className="w-5 h-5 mx-auto text-highlight mb-1" />
                  <p className="text-xs text-muted-foreground">Net Earnings</p>
                  <p className="text-2xl font-display font-bold text-highlight mt-1">${net}</p>
                </CardContent>
              </Card>
              <Card className="card-animate">
                <CardContent className="p-5 text-center">
                  <TrendingUp className="w-5 h-5 mx-auto text-accent mb-1" />
                  <p className="text-xs text-muted-foreground">ROI Estimate</p>
                  <p className="text-2xl font-display font-bold text-accent mt-1">+{roi}%</p>
                </CardContent>
              </Card>
              <Card className="sm:col-span-2 lg:col-span-4 card-animate">
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">
                    <strong>Competitor Range:</strong> ${minComp} – ${maxComp} &nbsp;|&nbsp;
                    <strong>Average:</strong> ${avgComp.toFixed(2)} &nbsp;|&nbsp;
                    <strong>Position:</strong> {suggested > avgComp ? "Premium" : suggested < avgComp ? "Value" : "Mid-Range"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </ToolPageWrapper>
    </DashboardLayout>
  );
};

export default PricingOptimizer;
