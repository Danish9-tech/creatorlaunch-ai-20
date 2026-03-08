import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Copy, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import type { ToolConfig } from "@/config/tools";

interface GenericToolPageProps {
  tool: ToolConfig;
}

export function GenericToolPage({ tool }: GenericToolPageProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = () => {
    const allFilled = tool.fields.every((f) => values[f.name]?.trim());
    if (!allFilled) {
      toast({ title: "Missing fields", description: "Please fill in all fields before generating.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setOutput("");
    setTimeout(() => {
      setOutput(tool.mockOutput);
      setLoading(false);
      toast({ title: "Generated!", description: `${tool.title} results are ready.` });
    }, 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast({ title: "Copied!", description: "Content copied to clipboard." });
  };

  const handleExport = (format: string) => {
    toast({ title: `Export as ${format}`, description: "Export feature coming soon." });
  };

  return (
    <DashboardLayout>
      <ToolPageWrapper title={tool.title} description={tool.description} output={output}>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Panel */}
          <Card className="card-animate">
            <CardContent className="p-6 space-y-4">
              {tool.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label>{field.label}</Label>
                  {field.type === "text" && (
                    <Input
                      placeholder={field.placeholder}
                      value={values[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                  )}
                  {field.type === "textarea" && (
                    <Textarea
                      className="min-h-[100px]"
                      placeholder={field.placeholder}
                      value={values[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                  )}
                  {field.type === "select" && (
                    <Select value={values[field.name] || ""} onValueChange={(v) => handleChange(field.name, v)}>
                      <SelectTrigger><SelectValue placeholder={`Select ${field.label.toLowerCase()}`} /></SelectTrigger>
                      <SelectContent>
                        {field.options?.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
              <Button
                className="w-full gradient-primary text-primary-foreground btn-animate"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Generate</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Panel */}
          <AnimatePresence>
            {(loading || output) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="card-animate h-full">
                  <CardContent className="p-6">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full gradient-primary animate-pulse" />
                          <Sparkles className="w-5 h-5 text-primary-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <p className="text-sm text-muted-foreground animate-pulse">AI is generating results...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display font-semibold text-lg">Results</h3>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleCopy} className="btn-animate">
                              <Copy className="h-3 w-3 mr-1" /> Copy
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleExport("PDF")} className="btn-animate">
                              <Download className="h-3 w-3 mr-1" /> PDF
                            </Button>
                          </div>
                        </div>
                        <div className="bg-muted rounded-lg p-4 text-sm whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                          {output}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ToolPageWrapper>
    </DashboardLayout>
  );
}
