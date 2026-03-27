import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { Key, Globe, Trash2, CreditCard, Check, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const PREFS_KEY = "creatorlaunch_prefs";

type Provider = "grok" | "openai" | "anthropic" | "gemini";

type ProviderState = {
  apiKey: string;
  modelPreference: string;
  hasKey: boolean;
  maskedKey: string;
  isActive: boolean;
};

const providerLabels: Record<Provider, string> = {
  grok: "Grok / xAI",
  openai: "OpenAI",
  anthropic: "Anthropic",
  gemini: "Google Gemini",
};

const providerPlaceholders: Record<Provider, string> = {
  grok: "xai-...",
  openai: "sk-...",
  anthropic: "sk-ant-...",
  gemini: "AIza...",
};

const modelPlaceholders: Record<Provider, string> = {
  grok: "grok-3-mini",
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-latest",
  gemini: "gemini-1.5-flash",
};

const providers: Provider[] = ["grok", "openai", "anthropic", "gemini"];

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"); } catch { return {}; }
}

function createInitialProviderState(): Record<Provider, ProviderState> {
  return {
    grok: { apiKey: "", modelPreference: "", hasKey: false, maskedKey: "", isActive: false },
    openai: { apiKey: "", modelPreference: "", hasKey: false, maskedKey: "", isActive: false },
    anthropic: { apiKey: "", modelPreference: "", hasKey: false, maskedKey: "", isActive: false },
    gemini: { apiKey: "", modelPreference: "", hasKey: false, maskedKey: "", isActive: false },
  };
}

const plans = [
  { name: "Free", price: "$0/mo", current: true },
  { name: "Pro", price: "$19/mo", current: false },
  { name: "Business", price: "$49/mo", current: false },
];

const platformConnections = [
  { name: "Etsy", connected: false },
  { name: "Gumroad", connected: false },
  { name: "Shopify", connected: false },
  { name: "Creative Market", connected: false },
];

const Settings = () => {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(() => loadPrefs());
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [providerState, setProviderState] = useState<Record<Provider, ProviderState>>(() => createInitialProviderState());
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [savingProvider, setSavingProvider] = useState<Provider | null>(null);
  const [deletingProvider, setDeletingProvider] = useState<Provider | null>(null);
  const [activatingProvider, setActivatingProvider] = useState<Provider | null>(null);

  const toggle = (key: string) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    toast({ title: `${key.replace(/_/g, " ")} ${next[key] ? "enabled" : "disabled"}` });
  };

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const loadApiKeys = async () => {
      setLoadingKeys(true);
      try {
        const { data, error } = await supabase.functions.invoke("manage-api-keys", {
          body: { action: "list" },
        });

        if (error) throw error;

        const next = createInitialProviderState();
        for (const entry of data?.keys || []) {
          const provider = entry.provider as Provider;
          if (!next[provider]) continue;
          next[provider] = {
            ...next[provider],
            hasKey: !!entry.hasKey,
            maskedKey: entry.maskedKey || "",
            isActive: !!entry.isActive,
            modelPreference: entry.modelPreference || "",
          };
        }
        setProviderState(next);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Could not load API keys.";
        toast({ title: "API keys unavailable", description: message, variant: "destructive" });
      } finally {
        setLoadingKeys(false);
      }
    };

    loadApiKeys();
  }, []);

  const handleDarkMode = (v: boolean) => {
    setDarkMode(v);
    toast({ title: `Dark mode ${v ? "enabled" : "disabled"}` });
  };

  const updateProviderField = (provider: Provider, field: keyof ProviderState, value: string | boolean) => {
    setProviderState((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value,
      },
    }));
  };

  const handleSaveProvider = async (provider: Provider) => {
    const state = providerState[provider];
    const apiKey = state.apiKey.trim();
    if (!apiKey) {
      toast({ title: "Missing API key", description: `Enter your ${providerLabels[provider]} key before saving.`, variant: "destructive" });
      return;
    }

    setSavingProvider(provider);
    try {
      const { data, error } = await supabase.functions.invoke("manage-api-keys", {
        body: {
          action: "save",
          provider,
          apiKey,
          modelPreference: state.modelPreference.trim(),
          isActive: true,
        },
      });

      if (error) throw error;

      setProviderState((prev) => {
        const next = { ...prev };
        for (const currentProvider of providers) {
          next[currentProvider] = {
            ...next[currentProvider],
            isActive: currentProvider === provider,
          };
        }
        next[provider] = {
          ...next[provider],
          apiKey: "",
          hasKey: true,
          maskedKey: data?.key?.maskedKey || next[provider].maskedKey,
          modelPreference: state.modelPreference.trim(),
          isActive: true,
        };
        return next;
      });

      toast({
        title: `${providerLabels[provider]} key saved`,
        description: "This provider will now be used for AI tools when available.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not save API key.";
      toast({ title: "Save failed", description: message, variant: "destructive" });
    } finally {
      setSavingProvider(null);
    }
  };

  const handleDeleteProvider = async (provider: Provider) => {
    setDeletingProvider(provider);
    try {
      const { error } = await supabase.functions.invoke("manage-api-keys", {
        body: {
          action: "delete",
          provider,
        },
      });

      if (error) throw error;

      setProviderState((prev) => ({
        ...prev,
        [provider]: { apiKey: "", modelPreference: "", hasKey: false, maskedKey: "", isActive: false },
      }));

      toast({ title: `${providerLabels[provider]} key removed` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not remove API key.";
      toast({ title: "Delete failed", description: message, variant: "destructive" });
    } finally {
      setDeletingProvider(null);
    }
  };

  const handleActivateProvider = async (provider: Provider) => {
    if (!providerState[provider].hasKey) {
      toast({ title: "No saved key", description: `Save a ${providerLabels[provider]} key first.`, variant: "destructive" });
      return;
    }

    setActivatingProvider(provider);
    try {
      const { error } = await supabase.functions.invoke("manage-api-keys", {
        body: {
          action: "set-active",
          provider,
        },
      });

      if (error) throw error;

      setProviderState((prev) => {
        const next = { ...prev };
        for (const currentProvider of providers) {
          next[currentProvider] = {
            ...next[currentProvider],
            isActive: currentProvider === provider,
          };
        }
        return next;
      });

      toast({ title: `${providerLabels[provider]} is now active` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not activate provider.";
      toast({ title: "Activation failed", description: message, variant: "destructive" });
    } finally {
      setActivatingProvider(null);
    }
  };

  const handleDeleteAccount = () => {
    localStorage.clear();
    toast({ title: "Account deleted", description: "All data has been cleared." });
    navigate("/");
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-display font-bold">Settings</h1>

        <Card>
          <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "email_notifications", label: "Email notifications" },
              { key: "product_updates", label: "Product updates" },
              { key: "marketing_tips", label: "Marketing tips" },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <Label>{item.label}</Label>
                <Switch checked={!!prefs[item.key]} onCheckedChange={() => toggle(item.key)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Dark mode</Label>
              <Switch checked={darkMode} onCheckedChange={handleDarkMode} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Auto-save drafts</Label>
              <Switch checked={!!prefs.auto_save} onCheckedChange={() => toggle("auto_save")} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show tooltips</Label>
              <Switch checked={!!prefs.show_tooltips} onCheckedChange={() => toggle("show_tooltips")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Key className="w-4 h-4" /> API Keys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Save your own provider key to use it for AI answers. If you do not save one, the app will fall back to the platform key when available.
            </p>

            {loadingKeys ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading saved provider keys...
              </div>
            ) : (
              <div className="grid gap-4">
                {providers.map((provider) => {
                  const state = providerState[provider];
                  const busy = savingProvider === provider || deletingProvider === provider || activatingProvider === provider;
                  return (
                    <div key={provider} className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{providerLabels[provider]}</p>
                          {state.isActive && <Badge>Active</Badge>}
                          {state.hasKey && !state.isActive && <Badge variant="secondary">Saved</Badge>}
                        </div>
                        {state.hasKey && (
                          <p className="text-xs text-muted-foreground">Saved key: {state.maskedKey || "Available"}</p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>{providerLabels[provider]} API Key</Label>
                          <Input
                            type="password"
                            placeholder={providerPlaceholders[provider]}
                            value={state.apiKey}
                            onChange={(e) => updateProviderField(provider, "apiKey", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Model Preference</Label>
                          <Input
                            placeholder={modelPlaceholders[provider]}
                            value={state.modelPreference}
                            onChange={(e) => updateProviderField(provider, "modelPreference", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button onClick={() => handleSaveProvider(provider)} disabled={busy}>
                          {savingProvider === provider ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Key"}
                        </Button>
                        <Button variant="outline" onClick={() => handleActivateProvider(provider)} disabled={busy || !state.hasKey}>
                          {activatingProvider === provider ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Activating...</> : "Use This Provider"}
                        </Button>
                        <Button variant="outline" onClick={() => handleDeleteProvider(provider)} disabled={busy || !state.hasKey}>
                          {deletingProvider === provider ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Removing...</> : "Remove Key"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Globe className="w-4 h-4" /> Platform Connections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {platformConnections.map(p => (
              <div key={p.name} className="flex items-center justify-between py-1">
                <span className="text-sm font-medium">{p.name}</span>
                <Button variant="outline" size="sm" onClick={() => toast({ title: "Coming soon", description: `${p.name} OAuth integration will be available with Lovable Cloud.` })}>
                  Connect
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4" /> Subscription Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold">Free Plan</p>
                <p className="text-xs text-muted-foreground">3 AI generations per day</p>
              </div>
              <Badge className="gradient-primary text-primary-foreground">Current</Badge>
            </div>
            <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
              <DialogTrigger asChild>
                <Button className="w-full gradient-primary text-primary-foreground btn-animate">Upgrade Plan</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Choose a Plan</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  {plans.map(p => (
                    <div key={p.name} className={`flex items-center justify-between p-4 rounded-lg border ${p.current ? "border-primary bg-primary/5" : "border-border"}`}>
                      <div>
                        <p className="font-display font-semibold">{p.name}</p>
                        <p className="text-sm text-muted-foreground">{p.price}</p>
                      </div>
                      {p.current ? (
                        <Badge variant="secondary"><Check className="w-3 h-3 mr-1" />Current</Badge>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => { setUpgradeOpen(false); toast({ title: "Coming soon", description: "Payment integration requires Lovable Cloud." }); }}>
                          Select
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive flex items-center gap-2"><Trash2 className="w-4 h-4" /> Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. This will remove all your data.</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete your account and all associated data.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount}>Delete Account</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default Settings;
