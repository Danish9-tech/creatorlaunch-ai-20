import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { Key, Loader2, Brain, Sparkles, Cpu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Provider = "openai" | "anthropic" | "gemini";
type ProviderState = {
  apiKey: string;
  modelPreference: string;
  hasKey: boolean;
  maskedKey: string;
  isActive: boolean;
};

const providerConfig: Record<Provider, { label: string; icon: typeof Brain; color: string; placeholder: string; modelPlaceholder: string; description: string }> = {
  openai: {
    label: "OpenAI",
    icon: Sparkles,
    color: "from-emerald-500 to-teal-500",
    placeholder: "sk-...",
    modelPlaceholder: "gpt-4o-mini",
    description: "GPT-4o, GPT-4o-mini and more",
  },
  anthropic: {
    label: "Anthropic",
    icon: Brain,
    color: "from-orange-500 to-amber-500",
    placeholder: "sk-ant-...",
    modelPlaceholder: "claude-3-5-haiku-latest",
    description: "Claude 3.5 Sonnet, Haiku and more",
  },
  gemini: {
    label: "Google Gemini",
    icon: Cpu,
    color: "from-blue-500 to-indigo-500",
    placeholder: "AIza...",
    modelPlaceholder: "gemini-1.5-flash",
    description: "Gemini 1.5 Flash, Pro and more",
  },
};

const providers: Provider[] = ["openai", "anthropic", "gemini"];

function createInitialState(): Record<Provider, ProviderState> {
  return {
    openai: { apiKey: "", modelPreference: "", hasKey: false, maskedKey: "", isActive: false },
    anthropic: { apiKey: "", modelPreference: "", hasKey: false, maskedKey: "", isActive: false },
    gemini: { apiKey: "", modelPreference: "", hasKey: false, maskedKey: "", isActive: false },
  };
}

const AIProviders = () => {
  const [providerState, setProviderState] = useState<Record<Provider, ProviderState>>(createInitialState);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [savingProvider, setSavingProvider] = useState<Provider | null>(null);
  const [deletingProvider, setDeletingProvider] = useState<Provider | null>(null);
  const [activatingProvider, setActivatingProvider] = useState<Provider | null>(null);

  useEffect(() => {
    const loadApiKeys = async () => {
      setLoadingKeys(true);
      try {
        const { data, error } = await supabase.functions.invoke("manage-api-keys", { body: { action: "list" } });
        if (error) throw error;
        const next = createInitialState();
        for (const entry of data?.keys || []) {
          const provider = entry.provider as Provider;
          if (!next[provider]) continue;
          next[provider] = { ...next[provider], hasKey: !!entry.hasKey, maskedKey: entry.maskedKey || "", isActive: !!entry.isActive, modelPreference: entry.modelPreference || "" };
        }
        setProviderState(next);
      } catch { /* silent */ } finally { setLoadingKeys(false); }
    };
    loadApiKeys();
  }, []);

  const updateField = (provider: Provider, field: keyof ProviderState, value: string | boolean) => {
    setProviderState(prev => ({ ...prev, [provider]: { ...prev[provider], [field]: value } }));
  };

  const handleSave = async (provider: Provider) => {
    const state = providerState[provider];
    if (!state.apiKey.trim()) { toast({ title: "Missing API key", variant: "destructive" }); return; }
    setSavingProvider(provider);
    try {
      const { data, error } = await supabase.functions.invoke("manage-api-keys", {
        body: { action: "save", provider, apiKey: state.apiKey.trim(), modelPreference: state.modelPreference.trim(), isActive: true },
      });
      if (error) throw error;
      setProviderState(prev => {
        const next = { ...prev };
        for (const p of providers) next[p] = { ...next[p], isActive: p === provider };
        next[provider] = { ...next[provider], apiKey: "", hasKey: true, maskedKey: data?.key?.maskedKey || "", isActive: true };
        return next;
      });
      toast({ title: `${providerConfig[provider].label} key saved & activated` });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally { setSavingProvider(null); }
  };

  const handleDelete = async (provider: Provider) => {
    setDeletingProvider(provider);
    try {
      const { error } = await supabase.functions.invoke("manage-api-keys", { body: { action: "delete", provider } });
      if (error) throw error;
      setProviderState(prev => ({ ...prev, [provider]: createInitialState()[provider] }));
      toast({ title: `${providerConfig[provider].label} key removed` });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    } finally { setDeletingProvider(null); }
  };

  const handleActivate = async (provider: Provider) => {
    if (!providerState[provider].hasKey) { toast({ title: "No saved key", variant: "destructive" }); return; }
    setActivatingProvider(provider);
    try {
      const { error } = await supabase.functions.invoke("manage-api-keys", { body: { action: "set-active", provider } });
      if (error) throw error;
      setProviderState(prev => {
        const next = { ...prev };
        for (const p of providers) next[p] = { ...next[p], isActive: p === provider };
        return next;
      });
      toast({ title: `${providerConfig[provider].label} is now active` });
    } catch (err: any) {
      toast({ title: "Activation failed", description: err.message, variant: "destructive" });
    } finally { setActivatingProvider(null); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-display font-bold">AI Providers</h1>
          <p className="text-muted-foreground mt-1">
            Connect your own AI API keys to power CreatorWand AI tools with your preferred provider.
          </p>
        </div>

        {loadingKeys ? (
          <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading providers...
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider, i) => {
              const cfg = providerConfig[provider];
              const state = providerState[provider];
              const busy = savingProvider === provider || deletingProvider === provider || activatingProvider === provider;

              return (
                <motion.div key={provider} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center`}>
                          <cfg.icon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        {state.isActive && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
                        )}
                        {state.hasKey && !state.isActive && (
                          <Badge variant="secondary">Connected</Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{cfg.label}</CardTitle>
                      <CardDescription>{cfg.description}</CardDescription>
                      {state.hasKey && (
                        <p className="text-xs text-muted-foreground font-mono">{state.maskedKey}</p>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-end space-y-3">
                      <Input
                        type="password"
                        placeholder={cfg.placeholder}
                        value={state.apiKey}
                        onChange={e => updateField(provider, "apiKey", e.target.value)}
                      />
                      <Input
                        placeholder={`Model (default: ${cfg.modelPlaceholder})`}
                        value={state.modelPreference}
                        onChange={e => updateField(provider, "modelPreference", e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" onClick={() => handleSave(provider)} disabled={busy || !state.apiKey.trim()}>
                          {savingProvider === provider ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save & Activate"}
                        </Button>
                      </div>
                      {state.hasKey && (
                        <div className="flex gap-2">
                          {!state.isActive && (
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleActivate(provider)} disabled={busy}>
                              Activate
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => handleDelete(provider)} disabled={busy}>
                            Remove
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <Key className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-display font-semibold mb-1">Your Keys, Your Control</h3>
            <p className="text-sm text-muted-foreground">
              API keys are encrypted and stored securely. When no key is configured, CreatorWand AI uses its built-in gateway.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AIProviders;
