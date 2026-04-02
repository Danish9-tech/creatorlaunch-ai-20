import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, ArrowRight, Check, Sparkles, Globe, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const niches = ["Digital Planners", "Social Media Templates", "Ebooks", "Online Courses", "Printable Art", "Canva Templates", "Notion Templates", "Spreadsheets", "Fonts & Graphics", "Photography Presets"];
const platformOptions = ["Etsy", "Gumroad", "Shopify", "Creative Market", "Amazon KDP", "Payhip", "Teachable"];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [productName, setProductName] = useState("");

  const toggleNiche = (n: string) => setSelectedNiches(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);
  const togglePlatform = (p: string) => setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const handleFinish = () => {
    localStorage.setItem("creatorwand_onboarding", JSON.stringify({ niches: selectedNiches, platforms: selectedPlatforms, firstProduct: productName }));
    localStorage.setItem("creatorwand_onboarded", "true");
    toast({ title: "🚀 Welcome aboard!", description: "Your workspace is ready. Let's create!" });
    navigate("/dashboard");
  };

  const steps = [
    {
      icon: Sparkles,
      title: "Pick Your Niche",
      subtitle: "What kind of digital products do you want to create?",
      content: (
        <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
          {niches.map(n => (
            <Badge
              key={n}
              variant={selectedNiches.includes(n) ? "default" : "outline"}
              className={`cursor-pointer text-sm py-1.5 px-3 transition-all ${selectedNiches.includes(n) ? "gradient-primary text-primary-foreground scale-105" : "hover:bg-muted"}`}
              onClick={() => toggleNiche(n)}
            >
              {selectedNiches.includes(n) && <Check className="w-3 h-3 mr-1" />}
              {n}
            </Badge>
          ))}
        </div>
      ),
      canContinue: selectedNiches.length > 0,
    },
    {
      icon: Globe,
      title: "Connect Platforms",
      subtitle: "Where do you sell your digital products?",
      content: (
        <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
          {platformOptions.map(p => (
            <Badge
              key={p}
              variant={selectedPlatforms.includes(p) ? "default" : "outline"}
              className={`cursor-pointer text-sm py-1.5 px-3 transition-all ${selectedPlatforms.includes(p) ? "gradient-primary text-primary-foreground scale-105" : "hover:bg-muted"}`}
              onClick={() => togglePlatform(p)}
            >
              {selectedPlatforms.includes(p) && <Check className="w-3 h-3 mr-1" />}
              {p}
            </Badge>
          ))}
        </div>
      ),
      canContinue: selectedPlatforms.length > 0,
    },
    {
      icon: Package,
      title: "Name Your First Product",
      subtitle: "What's the first product you want to create?",
      content: (
        <div className="max-w-sm mx-auto space-y-3">
          <Label>Product Name</Label>
          <Input
            value={productName}
            onChange={e => setProductName(e.target.value)}
            placeholder="e.g. Ultimate Social Media Template Kit"
            className="text-center"
          />
          <p className="text-xs text-muted-foreground text-center">Don't worry, you can change this later!</p>
        </div>
      ),
      canContinue: productName.trim().length > 0,
    },
  ];

  const current = steps[step];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i <= step ? "w-12 gradient-primary" : "w-8 bg-muted"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto glow-primary">
                  <current.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold mb-2">{current.title}</h1>
                  <p className="text-muted-foreground text-sm">{current.subtitle}</p>
                </div>
                {current.content}
                <div className="flex gap-3 justify-center pt-2">
                  {step > 0 && (
                    <Button variant="outline" onClick={() => setStep(s => s - 1)}>Back</Button>
                  )}
                  {step < steps.length - 1 ? (
                    <Button className="gradient-primary text-primary-foreground btn-animate" disabled={!current.canContinue} onClick={() => setStep(s => s + 1)}>
                      Continue <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button className="gradient-primary text-primary-foreground btn-animate" disabled={!current.canContinue} onClick={handleFinish}>
                      <Rocket className="w-4 h-4 mr-1" /> Launch My Workspace
                    </Button>
                  )}
                </div>
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors" onClick={() => { localStorage.setItem("creatorlaunch_onboarded", "true"); navigate("/dashboard"); }}>
                  Skip for now
                </button>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
