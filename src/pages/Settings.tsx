import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { Trash2, CreditCard, Check, Globe, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

const PREFS_KEY = "creatorwand_prefs";

type Platform = "gumroad" | "etsy" | "shopify" | "creative_market" | "payhip" | "teachable";
type PlatformState = {
  platformName: string;
  accessToken: string;
  maskedToken: string;
  hasAccessToken: boolean;
  storeUrl: string;
  isActive: boolean;
  productsSynced: number;
  lastSyncedAt: string | null;
};

const sellingPlatforms: Platform[] = ["gumroad", "etsy", "shopify", "creative_market", "payhip", "teachable"];
const platformLabels: Record<Platform, string> = {
  gumroad: "Gumroad", etsy: "Etsy", shopify: "Shopify",
  creative_market: "Creative Market", payhip: "Payhip", teachable: "Teachable",
};

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"); } catch { return {}; }
}

function createInitialPlatformState(): Record<Platform, PlatformState> {
  return {
    gumroad: { platformName: "Gumroad", accessToken: "", maskedToken: "", hasAccessToken: false, storeUrl: "", isActive: true, productsSynced: 0, lastSyncedAt: null },
    etsy: { platformName: "Etsy", accessToken: "", maskedToken: "", hasAccessToken: false, storeUrl: "", isActive: true, productsSynced: 0, lastSyncedAt: null },
    shopify: { platformName: "Shopify", accessToken: "", maskedToken: "", hasAccessToken: false, storeUrl: "", isActive: true, productsSynced: 0, lastSyncedAt: null },
    creative_market: { platformName: "Creative Market", accessToken: "", maskedToken: "", hasAccessToken: false, storeUrl: "", isActive: true, productsSynced: 0, lastSyncedAt: null },
    payhip: { platformName: "Payhip", accessToken: "", maskedToken: "", hasAccessToken: false, storeUrl: "", isActive: true, productsSynced: 0, lastSyncedAt: null },
    teachable: { platformName: "Teachable", accessToken: "", maskedToken: "", hasAccessToken: false, storeUrl: "", isActive: true, productsSynced: 0, lastSyncedAt: null },
  };
}

const plans = [
  { name: "Free", price: "$0/mo" },
  { name: "Pro", price: "$19/mo" },
  { name: "Business", price: "$49/mo" },
];

const Settings = () => {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(() => loadPrefs());
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [userPlan, setUserPlan] = useState("free");
  const [userCredits, setUserCredits] = useState(0);
  const [platformState, setPlatformState] = useState<Record<Platform, PlatformState>>(() => createInitialPlatformState());
  const [loadingPlatforms, setLoadingPlatforms] = useState(true);
  const [savingPlatform, setSavingPlatform] = useState<Platform | null>(null);
  const [deletingPlatform, setDeletingPlatform] = useState<Platform | null>(null);

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
    const loadUserPlan = async () => {
      const { data } = await supabase.from("profiles").select("plan, plan_type, credits").single();
      if (data) {
        setUserPlan((data.plan || data.plan_type || "free").toLowerCase());
        setUserCredits(data.credits || 0);
      }
    };
    loadUserPlan();
  }, []);

  useEffect(() => {
    const loadPlatformIntegrations = async () => {
      setLoadingPlatforms(true);
      try {
        const { data, error } = await supabase.functions.invoke("manage-platform-integrations", { body: { action: "list" } });
        if (error) throw error;
        const next = createInitialPlatformState();
        for (const entry of data?.integrations || []) {
          const platform = entry.platform as Platform;
          if (!next[platform]) continue;
          next[platform] = { ...next[platform], platformName: entry.platformName || next[platform].platformName, hasAccessToken: !!entry.hasAccessToken, maskedToken: entry.maskedToken || "", storeUrl: entry.settings?.store_url || "", isActive: entry.isActive ?? true, productsSynced: entry.productsSynced ?? 0, lastSyncedAt: entry.lastSyncedAt || null };
        }
        setPlatformState(next);
      } catch { /* silent */ } finally { setLoadingPlatforms(false); }
    };
    loadPlatformIntegrations();
  }, []);

  const handleDarkMode = (v: boolean) => {
    setDarkMode(v);
    toast({ title: `Dark mode ${v ? "enabled" : "disabled"}` });
  };

  const handleDeleteAccount = () => {
    localStorage.clear();
    toast({ title: "Account deleted" });
    navigate("/");
  };

  const updatePlatformField = (platform: Platform, field: keyof PlatformState, value: string | boolean | number | null) => {
    setPlatformState(prev => ({ ...prev, [platform]: { ...prev[platform], [field]: value } }));
  };

  const handleSavePlatform = async (platform: Platform) => {
    const state = platformState[platform];
    setSavingPlatform(platform);
    try {
      const { data, error } = await supabase.functions.invoke("manage-platform-integrations", { body: { action: "save", platform, platformName: state.platformName.trim() || platformLabels[platform], accessToken: state.accessToken.trim(), storeUrl: state.storeUrl.trim(), isActive: state.isActive } });
      if (error) throw error;
      setPlatformState(prev => ({ ...prev, [platform]: { ...prev[platform], accessToken: "", maskedToken: data?.integration?.maskedToken || prev[platform].maskedToken, hasAccessToken: !!data?.integration?.hasAccessToken, storeUrl: data?.integration?.settings?.store_url || prev[platform].storeUrl, isActive: data?.integration?.isActive ?? prev[platform].isActive } }));
      toast({ title: `${platformLabels[platform]} connected` });
    } catch (err: any) {
      toast({ title: "Connection failed", description: err.message, variant: "destructive" });
    } finally { setSavingPlatform(null); }
  };

  const handleDeletePlatform = async (platform: Platform) => {
    setDeletingPlatform(platform);
    try {
      const { error } = await supabase.functions.invoke("manage-platform-integrations", { body: { action: "delete", platform } });
      if (error) throw error;
      setPlatformState(prev => ({ ...prev, [platform]: createInitialPlatformState()[platform] }));
      toast({ title: `${platformLabels[platform]} disconnected` });
    } catch (err: any) {
      toast({ title: "Disconnect failed", description: err.message, variant: "destructive" });
    } finally { setDeletingPlatform(null); }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-display font-bold">Settings</h1>

        {/* Notifications */}
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

        {/* Preferences */}
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

        {/* Platform Connections */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Globe className="w-4 h-4" /> Platform Connections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingPlatforms ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading platforms...
              </div>
            ) : (
              <div className="grid gap-4">
                {sellingPlatforms.map(platform => {
                  const state = platformState[platform];
                  const busy = savingPlatform === platform || deletingPlatform === platform;
                  return (
                    <div key={platform} className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{platformLabels[platform]}</p>
                        {state.hasAccessToken ? <Badge>Connected</Badge> : <Badge variant="secondary">Disconnected</Badge>}
                      </div>
                      <Input type="password" value={state.accessToken} onChange={e => updatePlatformField(platform, "accessToken", e.target.value)} placeholder="Access Token" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSavePlatform(platform)} disabled={busy}>Connect</Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeletePlatform(platform)} disabled={busy || !state.hasAccessToken}>Disconnect</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4" /> Subscription Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold">{userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan</p>
                <p className="text-xs text-muted-foreground">
                  {userPlan === "free" ? "3 AI generations per day" : `${userCredits} credits remaining`}
                </p>
              </div>
              <Badge className="gradient-primary text-primary-foreground">Current</Badge>
            </div>
            <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
              <DialogTrigger asChild>
                <Button className="w-full gradient-primary text-primary-foreground">Upgrade Plan</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Choose a Plan</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  {plans.map(p => (
                    <div key={p.name} className={`flex items-center justify-between p-4 rounded-lg border ${p.name.toLowerCase() === userPlan ? "border-primary bg-primary/5" : "border-border"}`}>
                      <div>
                        <p className="font-display font-semibold">{p.name}</p>
                        <p className="text-sm text-muted-foreground">{p.price}</p>
                      </div>
                      {p.name.toLowerCase() === userPlan ? (
                        <Badge variant="secondary"><Check className="w-3 h-3 mr-1" />Current</Badge>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => { setUpgradeOpen(false); toast({ title: "Coming soon" }); }}>Select</Button>
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

        {/* Danger Zone */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive flex items-center gap-2"><Trash2 className="w-4 h-4" /> Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back.</p>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="destructive">Delete Account</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete your account and all data.</AlertDialogDescription>
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
