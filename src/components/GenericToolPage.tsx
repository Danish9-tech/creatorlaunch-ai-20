import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { PlanGate } from "@/components/PlanGate";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Clock, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import type { ToolConfig } from "@/config/tools";
import { EmptyState } from "@/components/EmptyState";
import { AIGenerator } from "@/components/ai/AIGenerator"; // Import your new streaming component
import { Button } from "@/components/ui/button";

const HISTORY_KEY = "creatorlaunch_tool_history";

function getToolHistory(slug: string): { output: string; time: string }[] {
  try {
    const all = JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}");
    return (all[slug] || []).slice(0, 3);
  } catch {
    return [];
  }
}

interface GenericToolPageProps {
  tool: ToolConfig;
}

function ToolContent({ tool }: GenericToolPageProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [history, setHistory] = useState(() => getToolHistory(tool.slug));
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync history when a generation completes (triggered by a custom event or localstorage watch)
  useEffect(() => {
    const handleStorageChange = () => setHistory(getToolHistory(tool.slug));
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [tool.slug]);

  const handleChange = (name: string, value: string) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* LEFT COLUMN: INPUT FORM */}
      <Card className="border-primary/10 shadow-sm h-fit">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            {tool.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label className="text-sm font-medium">{field.label}</Label>
                {field.type === "text" && (
                  <Input
                    placeholder={field.placeholder}
                    value={values[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="focus-visible:ring-primary"
                  />
                )}
                {field.type === "textarea" && (
                  <Textarea
                    className="min-h-[120px] resize-none"
                    placeholder={field.placeholder}
                    value={values[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  />
                )}
                {field.type === "select" && (
                  <Select
                    value={values[field.name] || ""}
                    onValueChange={(v) => handleChange(field.name, v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>

          {/* STREAMING GENERATOR COMPONENT */}
          <AIGenerator 
            toolSlug={tool.slug} 
            toolTitle={tool.title} 
            fields={values} 
          />
        </CardContent>
      </Card>

      {/* RIGHT COLUMN: RECENT HISTORY & TIPS */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {history.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="font-display font-semibold text-base mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Recent Generations
              </h3>
              <div className="grid gap-4">
                {history.map((h, i) => (
                  <Card key={i} className="bg-muted/30 border-none group hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                          {h.time}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            navigator.clipboard.writeText(h.output);
                            toast({ title: "Copied to clipboard" });
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="text-sm text-foreground/80 line-clamp-4 whitespace-pre-wrap leading-relaxed italic">
                        "{h.output}"
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-xl">
              <EmptyState
                icon={Sparkles}
                title="Ready to Create?"
                description="Enter your details on the left and watch the AI work its magic in real-time."
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function GenericToolPage({ tool }: GenericToolPageProps) {
  return (
    <DashboardLayout>
      <ToolPageWrapper title={tool.title} description={tool.description}>
        <PlanGate toolId={tool.slug}>
          <ToolContent tool={tool} />
        </PlanGate>
      </ToolPageWrapper>
    </DashboardLayout>
  );
}
