import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const steps = ["Basics", "Format & License", "Audience", "Description"];

const ProductCreator = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    name: "", type: "", category: "", format: "", license: "",
    audience: "", features: "", benefits: "", description: "",
  });

  const update = (key: string, val: string) => setData((d) => ({ ...d, [key]: val }));

  const handleCreate = async () => {
    setSaving(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({ title: "Not logged in", description: "Please sign in to save your product.", variant: "destructive" });
        setSaving(false);
        return;
      }

      const { error } = await supabase.from("products").insert({
        title: data.name,
        description: data.description,
        niche: data.category,
        product_type: data.type,
        price: 0,
        status: "draft",
        user_id: user.id,
      });

      if (error) {
        toast({ title: "Save failed", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }

      toast({ title: "Product saved!", description: "Your product has been saved as a draft." });
      navigate("/products");
    } catch (err) {
      toast({ title: "Unexpected error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <ToolPageWrapper title="Product Creator" description="Create your digital product step by step.">
        <div className="flex gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s} className={`flex-1 h-2 rounded-full ${i <= step ? "gradient-primary" : "bg-muted"} transition-all`} />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mb-4">Step {step + 1} of 4: {steps[step]}</p>

        <Card>
          <CardContent className="p-6 space-y-4">
            {step === 0 && (<>
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input placeholder="My Awesome Product" value={data.name} onChange={(e) => update("name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Product Type</Label>
                <Select value={data.type} onValueChange={(v) => update("type", v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {["eBook", "Template", "Course", "Printable", "Software", "Graphics"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input placeholder="e.g., Business, Design" value={data.category} onChange={(e) => update("category", e.target.value)} />
              </div>
            </>)}

            {step === 1 && (<>
              <div className="space-y-2">
                <Label>File Format</Label>
                <Input placeholder="PDF, DOCX, PSD..." value={data.format} onChange={(e) => update("format", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>License Type</Label>
                <Select value={data.license} onValueChange={(v) => update("license", v)}>
                  <SelectTrigger><SelectValue placeholder="Select license" /></SelectTrigger>
                  <SelectContent>
                    {["PLR", "MRR", "Personal License"].map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>)}

            {step === 2 && (<>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Input placeholder="Small business owners..." value={data.audience} onChange={(e) => update("audience", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Features</Label>
                <Textarea placeholder="List key features..." value={data.features} onChange={(e) => update("features", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Benefits</Label>
                <Textarea placeholder="List key benefits..." value={data.benefits} onChange={(e) => update("benefits", e.target.value)} />
              </div>
            </>)}

            {step === 3 && (<>
              <div className="space-y-2">
                <Label>Product Description</Label>
                <Textarea className="min-h-[200px]" placeholder="Write a compelling description..." value={data.description} onChange={(e) => update("description", e.target.value)} />
              </div>
            </>)}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="btn-animate">Back</Button>
              <div className="flex gap-2">
                {step < 3 ? (
                  <Button className="gradient-primary text-primary-foreground btn-animate" onClick={() => setStep(step + 1)}>Next</Button>
                ) : (
                  <Button className="gradient-primary text-primary-foreground btn-animate" onClick={handleCreate} disabled={saving}>
                    {saving ? "Saving..." : "Create Product"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </ToolPageWrapper>
    </DashboardLayout>
  );
};

export default ProductCreator;
