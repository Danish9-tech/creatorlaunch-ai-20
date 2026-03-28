// src/components/GenericToolPage.tsx
// Updated: integrates PlanGate HOC to enforce plan/credit gating
// for all 40+ tool pages without duplicating hook logic.
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { PlanGate } from "@/components/PlanGate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Sparkles, Loader2, Copy, Download, Save, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import type { ToolConfig } from "@/config/tools";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/EmptyState";

const ACTIVITY_KEY = "creatorlaunch_activity";
const HISTORY_KEY = "creatorlaunch_tool_history";

function addActivity(tool: string) {
  try {
    const activity = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]");
    activity.unshift({
      id: crypto.randomUUID(),
      action: "Generated content",
      tool,
      time: new Date().toLocaleString(),
    });
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity.slice(0, 50)));
  } catch {}
}

function getToolHistory(slug: string): { output: string; time: string }[] {
  try {
    const all = JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}");
    return (all[slug] || []).slice(0, 3);
  } catch {
    return [];
  }
}

function saveToolHistory(slug: string, output: string) {
  try {
    const all = JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}");
    const entries = all[slug] || [];
    entries.unshift({ output, time: new Date().toLocaleString() });
    all[slug] = entries.slice(0, 10);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(all));
  } catch {}
}

function stripHtml(str: string): string {
  return String(str)
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function formatOutput(result: any): string {
  if (!result) return "";

  // Plain string
  if (typeof result === "string") return stripHtml(result);

  // Single text/output field
  if (result.output) return stripHtml(result.output);
  if (result.text) return stripHtml(result.text);

  // Array of items (e.g. idea-generator, trend-finder, competitor-analyzer)
  if (Array.isArray(result)) {
    return result.map((item: any, i: number) => {
      const divider = "━".repeat(50);
      const header = `\n${divider}\n  RESULT ${i + 1}\n${divider}`;
      const fields = Object.entries(item)
        .map(([k, v]) => {
          const label = k
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, s => s.toUpperCase())
            .toUpperCase();
          return `\n▸ ${label}:\n  ${stripHtml(String(v)).replace(/\n/g, "\n  ")}`;
        })
        .join("\n");
      return header + fields;
    }).join("\n\n");
  }

  // Object with multiple fields (most tools)
  const divider = "━".repeat(50);
  return Object.entries(result)
    .map(([k, v]) => {
      if (v === null || v === undefined || v === "") return "";
      const label = k
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, s => s.toUpperCase())
        .toUpperCase();
      const value = typeof v === "object"
        ? Object.entries(v).map(([sk, sv]) => `  • ${sk}: ${sv}`).join("\n")
        : stripHtml(String(v));
      return `\n${divider}\n  ${label}\n${divider}\n${value}`;
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

interface GenericToolPageProps {
  tool: ToolConfig;
}

// ================================================================
// Inner component - only rendered when PlanGate allows access
// ================================================================
function ToolContent({ tool }: GenericToolPageProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [history] = useState(() => getToolHistory(tool.slug));

  const handleChange = (name: string, value: string) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const handleGenerate = async () => {
    const allFilled = tool.fields.every((f) => values[f.name]?.trim());
    if (!allFilled) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setOutput("");

    try {
      // Get the current session JWT to pass to the edge function
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        toast({ title: "Not signed in", description: "Please sign in to use tools.", variant: "destructive" });
        return;
      }

      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: {
          tool: tool.slug,
          toolTitle: tool.title,
          toolDescription: tool.description,
          category: tool.category,
          fields: values,
        },
      });

      if (error) throw error;

      const formatted = formatOutput(data?.result ?? data);
      setOutput(formatted);
      addActivity(tool.title);
      saveToolHistory(tool.slug, formatted);
      toast({ title: "Generated!", description: `${tool.title} results are ready.` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to generate.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast({ title: "Copied!" });
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tool.slug}-output.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!" });
  };

  const handleSave = () => {
    saveToolHistory(tool.slug, output);
    toast({ title: "Saved!" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Card */}
      <Card className="card-animate">
        <CardContent className="p-6 space-y-4">
          {tool.fields.map((field) => (
            <div key={field.name} className="space-y-1.5">
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
                <Select
                  value={values[field.name] || ""}
                  onValueChange={(v) => handleChange(field.name, v)}
                >
                  <SelectTrigger>
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
          <Button
            className="w-full gradient-primary text-primary-foreground btn-animate"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Generate with AI</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Output Card */}
      <AnimatePresence>
        {loading || output ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Card className="card-animate h-full">
              <CardContent className="p-6">
                {loading && !output ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full gradient-primary animate-pulse" />
                      <Sparkles className="w-5 h-5 text-primary-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-sm text-muted-foreground animate-pulse">AI is generating...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="font-display font-semibold text-lg">Results</h3>
                      <div className="flex gap-1.5 flex-wrap">
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                          <Copy className="h-3 w-3 mr-1" /> Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                          <Download className="h-3 w-3 mr-1" /> TXT
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleSave}>
                          <Save className="h-3 w-3 mr-1" /> Save
                        </Button>
                      </div>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-sm whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto font-mono">
                      {output}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="flex items-center">
            <EmptyState
              icon={Sparkles}
              title="No results yet"
              description="Fill in the fields and click Generate to see AI-powered results."
            />
          </div>
        )}
      </AnimatePresence>

      {/* History */}
      {history.length > 0 && (
        <div className="lg:col-span-2 mt-4">
          <h3 className="font-display font-semibold text-base mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Recent Generations
          </h3>
          <div className="space-y-3">
            {history.map((h, i) => (
              <Card key={i} className="card-animate">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{h.time}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(h.output);
                        toast({ title: "Copied!" });
                      }}
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                    {h.output}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ================================================================
// GenericToolPage - public entry point
// PlanGate wraps ToolContent so no per-tool gating needed
// ================================================================
export function GenericToolPage({ tool }: GenericToolPageProps) {
  return (
    <DashboardLayout>
      <ToolPageWrapper title={tool.title} description={tool.description}>
        {/* PlanGate checks plan + credits for this tool slug.
            If denied, it renders the upgrade UI instead of ToolContent.
            All 40+ tool pages get this for free - zero duplication. */}
        <PlanGate toolId={tool.slug}>
          <ToolContent tool={tool} />
        </PlanGate>
      </ToolPageWrapper>
    </DashboardLayout>
  );
}
