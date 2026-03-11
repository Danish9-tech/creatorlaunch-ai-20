import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Copy, Download, Save, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import type { ToolConfig } from "@/config/tools";
import { supabaseUrl, supabaseKey } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/EmptyState";

const STORAGE_KEY = "creatorlaunch_last_output";
const ACTIVITY_KEY = "creatorlaunch_activity";
const HISTORY_KEY = "creatorlaunch_tool_history";

function addActivity(tool: string) {
  try {
    const activity = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]");
    activity.unshift({ id: crypto.randomUUID(), action: "Generated content", tool, time: new Date().toLocaleString() });
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity.slice(0, 50)));
  } catch {}
}

function getToolHistory(slug: string): { output: string; time: string }[] {
  try {
    const all = JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}");
    return (all[slug] || []).slice(0, 3);
  } catch { return []; }
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

interface GenericToolPageProps {
  tool: ToolConfig;
}

async function streamGenerate({ tool, fields, onDelta, onDone, onError }: {
  tool: ToolConfig; fields: Record<string, string>;
  onDelta: (text: string) => void; onDone: () => void; onError: (msg: string) => void;
}) {
  if (!supabaseUrl || !supabaseKey) { onError("Backend not configured."); return; }
  const resp = await fetch(`${supabaseUrl}/functions/v1/generate-tool`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${supabaseKey}` },
    body: JSON.stringify({ toolTitle: tool.title, toolDescription: tool.description, category: tool.category, fields }),
  });
  if (!resp.ok) { const err = await resp.json().catch(() => ({ error: "Request failed" })); onError(err.error || `Error ${resp.status}`); return; }
  if (!resp.body) { onError("No response body"); return; }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let streamDone = false;
  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") { streamDone = true; break; }
      try { const p = JSON.parse(jsonStr); const c = p.choices?.[0]?.delta?.content; if (c) onDelta(c); }
      catch { buffer = line + "\n" + buffer; break; }
    }
  }
  onDone();
}

export function GenericToolPage({ tool }: GenericToolPageProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [history] = useState(() => getToolHistory(tool.slug));

  const handleChange = (name: string, value: string) => setValues(prev => ({ ...prev, [name]: value }));

  const handleGenerate = async () => {
    const allFilled = tool.fields.every(f => values[f.name]?.trim());
    if (!allFilled) { toast({ title: "Missing fields", description: "Please fill in all fields.", variant: "destructive" }); return; }
    setLoading(true);
    setOutput("");

    const runMock = () => {
      const mockText = tool.mockOutput;
      let i = 0;
      const interval = setInterval(() => {
        i += 3;
        if (i >= mockText.length) {
          setOutput(mockText);
          localStorage.setItem(STORAGE_KEY, mockText);
          addActivity(tool.title);
          saveToolHistory(tool.slug, mockText);
          setLoading(false);
          clearInterval(interval);
          toast({ title: "Generated!", description: `${tool.title} results are ready.` });
        } else {
          setOutput(mockText.slice(0, i));
        }
      }, 10);
    };

    if (!supabaseUrl || !supabaseKey) { runMock(); return; }

    let accumulated = "";
    try {
      await streamGenerate({
        tool, fields: values,
        onDelta: chunk => { accumulated += chunk; setOutput(accumulated); },
        onDone: () => {
          setLoading(false);
          localStorage.setItem(STORAGE_KEY, accumulated);
          addActivity(tool.title);
          saveToolHistory(tool.slug, accumulated);
          toast({ title: "Generated!", description: `${tool.title} results are ready.` });
        },
        onError: () => { runMock(); },
      });
    } catch { setLoading(false); toast({ title: "Error", description: "Failed to connect. Please try again.", variant: "destructive" }); }
  };

  const handleCopy = () => { navigator.clipboard.writeText(output); toast({ title: "Copied!" }); };
  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${tool.slug}-output.txt`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!" });
  };
  const handleSave = () => {
    saveToolHistory(tool.slug, output);
    toast({ title: "Saved to history!" });
  };

  return (
    <DashboardLayout>
      <ToolPageWrapper title={tool.title} description={tool.description} output={output}>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="card-animate">
            <CardContent className="p-6 space-y-4">
              {tool.fields.map(field => (
                <div key={field.name} className="space-y-2">
                  <Label>{field.label}</Label>
                  {field.type === "text" && <Input placeholder={field.placeholder} value={values[field.name] || ""} onChange={e => handleChange(field.name, e.target.value)} />}
                  {field.type === "textarea" && <Textarea className="min-h-[100px]" placeholder={field.placeholder} value={values[field.name] || ""} onChange={e => handleChange(field.name, e.target.value)} />}
                  {field.type === "select" && (
                    <Select value={values[field.name] || ""} onValueChange={v => handleChange(field.name, v)}>
                      <SelectTrigger><SelectValue placeholder={`Select ${field.label.toLowerCase()}`} /></SelectTrigger>
                      <SelectContent>{field.options?.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                    </Select>
                  )}
                </div>
              ))}
              <Button className="w-full gradient-primary text-primary-foreground btn-animate" onClick={handleGenerate} disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate with AI</>}
              </Button>
            </CardContent>
          </Card>

          <AnimatePresence>
            {(loading || output) ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
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
                          <h3 className="font-display font-semibold text-lg">
                            Results{loading && <span className="ml-2 text-xs text-muted-foreground animate-pulse">● streaming...</span>}
                          </h3>
                          <div className="flex gap-1.5 flex-wrap">
                            <Button variant="outline" size="sm" onClick={handleCopy} disabled={loading}><Copy className="h-3 w-3 mr-1" /> Copy</Button>
                            <Button variant="outline" size="sm" onClick={handleDownload} disabled={loading}><Download className="h-3 w-3 mr-1" /> TXT</Button>
                            <Button variant="outline" size="sm" onClick={handleSave} disabled={loading}><Save className="h-3 w-3 mr-1" /> Save</Button>
                          </div>
                        </div>
                        <div className="bg-muted rounded-lg p-4 text-sm whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                          {output}
                          {loading && <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 align-text-bottom" />}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="flex items-center">
                <EmptyState icon={Sparkles} title="No results yet" description="Fill in the fields and click Generate to see AI-powered results." />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Recent History */}
        {history.length > 0 && (
          <div className="mt-8">
            <h3 className="font-display font-semibold text-base mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Recent Generations</h3>
            <div className="space-y-3">
              {history.map((h, i) => (
                <Card key={i} className="card-animate">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{h.time}</span>
                      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => { navigator.clipboard.writeText(h.output); toast({ title: "Copied!" }); }}>
                        <Copy className="h-3 w-3 mr-1" /> Copy
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">{h.output}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </ToolPageWrapper>
    </DashboardLayout>
  );
}
