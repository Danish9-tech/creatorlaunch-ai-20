import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages, Sparkles } from "lucide-react";

const ListingTranslator = () => {
  const [text, setText] = useState("");
  const [lang, setLang] = useState("");
  const [translated, setTranslated] = useState(false);

  const mockTranslate: Record<string, string> = {
    Spanish: "¡Tu producto digital premium está aquí! Obtén resultados increíbles...",
    French: "Votre produit numérique premium est ici ! Obtenez des résultats incroyables...",
    German: "Ihr Premium-Digitalprodukt ist da! Erzielen Sie unglaubliche Ergebnisse...",
  };

  return (
    <DashboardLayout>
      <ToolPageWrapper title="Listing Translator" description="Translate your listings into multiple languages." output={translated ? mockTranslate[lang] || text : ""}>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><Label>Original Text (English)</Label><Textarea className="min-h-[150px]" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your listing text..." /></div>
              <div className="space-y-2"><Label>Target Language</Label>
                <Select value={lang} onValueChange={setLang}><SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                  <SelectContent>{["Spanish", "French", "German"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="w-full gradient-primary text-primary-foreground btn-animate" onClick={() => setTranslated(true)}>
                <Languages className="w-4 h-4 mr-2" /> Translate
              </Button>
            </CardContent>
          </Card>

          {translated && (
            <Card className="card-animate">
              <CardHeader><CardTitle>{lang} Translation</CardTitle></CardHeader>
              <CardContent><p className="text-sm bg-muted p-4 rounded-lg">{mockTranslate[lang] || text}</p></CardContent>
            </Card>
          )}
        </div>
      </ToolPageWrapper>
    </DashboardLayout>
  );
};

export default ListingTranslator;
