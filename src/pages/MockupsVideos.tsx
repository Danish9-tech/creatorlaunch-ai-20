import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Monitor, Smartphone, Tablet, Video } from "lucide-react";

const MockupsVideos = () => {
  const [productName, setProductName] = useState("");
  const [mockupType, setMockupType] = useState("");
  const [generated, setGenerated] = useState(false);

  return (
    <DashboardLayout>
      <ToolPageWrapper title="Mockups & Video Prompts" description="Generate mockup prompts and video ad scripts.">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><Label>Product Name</Label><Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Product name" /></div>
              <div className="space-y-2"><Label>Mockup Type</Label>
                <Select value={mockupType} onValueChange={setMockupType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laptop">Laptop Mockup</SelectItem>
                    <SelectItem value="phone">Phone Mockup</SelectItem>
                    <SelectItem value="tablet">Tablet Mockup</SelectItem>
                    <SelectItem value="bundle">Bundle Box Mockup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full gradient-primary text-primary-foreground btn-animate" onClick={() => setGenerated(true)}>
                <Sparkles className="w-4 h-4 mr-2" /> Generate Prompts
              </Button>
            </CardContent>
          </Card>

          {generated && (
            <div className="space-y-4">
              <Card className="card-animate">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Monitor className="w-4 h-4" /> Mockup Prompt</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm bg-muted p-3 rounded-lg">A professional {mockupType || "laptop"} mockup displaying "{productName}" product page. Clean, modern workspace. Size: 1280x720.</p>
                </CardContent>
              </Card>
              <Card className="card-animate">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Video className="w-4 h-4" /> Video Ad Prompt</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-sm bg-muted p-3 rounded-lg space-y-2">
                    <p><strong>Scene:</strong> Product showcase on clean background</p>
                    <p><strong>Text Overlay:</strong> "Introducing {productName}"</p>
                    <p><strong>Camera:</strong> Slow zoom in, 10-15 seconds</p>
                    <p><strong>CTA:</strong> "Get it now — Link in bio"</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ToolPageWrapper>
    </DashboardLayout>
  );
};

export default MockupsVideos;
