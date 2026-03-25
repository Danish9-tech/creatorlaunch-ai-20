import { useState, useEffect } from "react";
import { supabase } from "../lib/client";
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
import { Key, Globe, Trash2, CreditCard, Check, Save, ShoppingBag, Zap, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Types from original SettingsPage
type Profile = {
  user_api_key: string | null;
  plan_type: 'free' | 'pro' | 'business';
  credits: number;
};

type Connection = {
  platform_type: string;
  api_token: string;
  site_url: string;
  store_name: string;
  is_active: boolean;
};

const PLATFORMS = [
  { key: 'etsy', label: 'Etsy', icon: ShoppingBag, color: 'text-orange-400', desc: 'Connect your Etsy store' },
  { key: 'gumroad', label: 'Gumroad', icon: Zap, color: 'text-pink-400', desc: 'Sync products to Gumroad' },
  { key: 'wordpress', label: 'WordPress', icon: Globe, color: 'text-blue-400', desc: 'Publish via App Password' },
];

const PREFS_KEY = "creatorlaunch_prefs";

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"); } catch { return {}; }
}

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [connections, setConnections] = useState<Record<string, Partial<Connection>>>({});
  const [savingPlatform, setSavingPlatform] = useState<string | null>(null);
  
  // Local UI Prefs
  const [prefs, setPrefs] = useState(() => loadPrefs());
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase
        .from('profiles')
        .select('user_api_key, plan_type, credits')
        .eq('id', user.id)
        .single();

      if (prof) {
        setProfile(prof);
        setApiKey(prof.user_api_key || '');
      }

      const { data: conns } = await supabase
        .from('user_connections')
        .select('*')
        .eq('user_id', user.id);

      if (conns) {
        const connMap: Record<string, Partial<Connection>> = {};
        conns.forEach((c) => { connMap[c.platform_type] = c; });
        setConnections(connMap);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  }

  const saveApiKey = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ user_api_key: apiKey.trim() || null })
      .eq('id', user.id);

    if (error) {
      toast({ title: "Error", description: "Failed to save API key.", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "API Key updated successfully." });
      setProfile(prev => prev ? { ...prev, user_api_key: apiKey.trim() || null } : null);
    }
  };

  const savePlatform = async (platformKey: string) => {
    setSavingPlatform(platformKey);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const conn = connections[platformKey] || {};
    const { error } = await supabase
      .from('user_connections')
      .upsert({
        user_id: user.id,
        platform_type: platformKey,
        api_token: conn.api_token || '',
        site_url: conn.site_url || '',
        store_name: conn.store_name || '',
        is_active: true,
      }, { onConflict: 'user_id,platform_type' });

    setSavingPlatform(null);
    if (error) {
      toast({ title: "Error", description: `Failed to connect ${platformKey}`, variant: "destructive" });
    } else {
      toast({ title: "Connected", description: `${platformKey} settings saved.` });
      // Update local state to show "Connected" status
      setConnections(prev => ({
        ...prev,
        [platformKey]: { ...conn, is_active: true }
      }));
    }
  };

  const toggleLocalPref = (key: string) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    toast({ title: `${key.replace(/_/g, " ")} ${next[key] ? "enabled" : "disabled"}` });
  };

  const handleDeleteAccount = async () => {
    const { error } = await supabase.rpc('delete_user_account'); // Assuming you have a delete function
    if (error) {
        toast({ title: "Error", description: "Could not delete account. Contact support.", variant: "destructive" });
    } else {
        localStorage.clear();
        await supabase.auth.signOut();
        navigate("/");
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6 pb-12">
        <h1 className="text-2xl font-display font-bold">Settings</h1>

        {/* Subscription / Credits Status */}
        <Card className="bg-gradient-to-br from-card to-secondary/20">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4" /> Usage & Plan</CardTitle></CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Current Plan</p>
                    <p className="text-2xl font-bold capitalize text-primary">{profile?.plan_type || 'Free'}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Credits Remaining</p>
                    <p className="text-2xl font-bold">
                        {profile?.plan_type === 'business' ? '∞' : profile?.credits ?? 0}
                    </p>
                </div>
            </div>
            <Button className="w-full mt-4 gradient-primary" onClick={() => setUpgradeOpen(true)}>Upgrade Plan</Button>
          </CardContent>
        </Card>

        {/* API Keys (BYOK) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Key className="w-4 h-4" /> AI API Key (BYOK)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-3 rounded-lg text-xs font-medium border ${apiKey ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                {apiKey ? '✓ Using Personal Key — Unlimited usage' : '⚡ Using CreatorWand Credits'}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input 
                    type={showKey ? "text" : "password"} 
                    placeholder="xai-..." 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                />
                <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <Button onClick={saveApiKey} size="sm"><Save className="w-4 h-4 mr-2" /> Save</Button>
            </div>
            <p className="text-xs text-muted-foreground">Add your Grok key to bypass daily credit limits. Stored securely.</p>
          </CardContent>
        </Card>

        {/* Platform Connections */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Globe className="w-4 h-4" /> Platform Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              const conn = connections[platform.key] || {};
              const isConnected = !!(conn.is_active && conn.api_token);

              return (
                <div key={platform.key} className="space-y-3 p-4 border rounded-xl bg-secondary/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={platform.color} size={18} />
                      <div>
                        <p className="text-sm font-semibold">{platform.label}</p>
                        <p className="text-xs text-muted-foreground">{platform.desc}</p>
                      </div>
                    </div>
                    <Badge variant={isConnected ? "default" : "outline"} className={isConnected ? "bg-green-500 hover:bg-green-600" : ""}>
                      {isConnected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>

                  <div className="grid gap-2">
                    {platform.key === 'wordpress' && (
                      <Input 
                        placeholder="https://yoursite.com" 
                        value={conn.site_url || ''} 
                        onChange={e => setConnections(prev => ({ ...prev, [platform.key]: { ...prev[platform.key], site_url: e.target.value } }))}
                      />
                    )}
                    <Input 
                      placeholder={platform.key === 'wordpress' ? "App Password" : "API Token"} 
                      value={conn.api_token || ''}
                      onChange={e => setConnections(prev => ({ ...prev, [platform.key]: { ...prev[platform.key], api_token: e.target.value } }))}
                    />
                    <Input 
                      placeholder="Store Name" 
                      value={conn.store_name || ''}
                      onChange={e => setConnections(prev => ({ ...prev, [platform.key]: { ...prev[platform.key], store_name: e.target.value } }))}
                    />
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-1"
                        disabled={savingPlatform === platform.key}
                        onClick={() => savePlatform(platform.key)}
                    >
                        {savingPlatform === platform.key ? "Saving..." : "Save Connection"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Local App Preferences */}
        <Card>
          <CardHeader><CardTitle className="text-base">App Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Dark mode</Label>
              <Switch checked={darkMode} onCheckedChange={(v) => { setDarkMode(v); toast({ title: `Dark mode ${v ? "on" : "off"}` }); }} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Auto-save drafts</Label>
              <Switch checked={!!prefs.auto_save} onCheckedChange={() => toggleLocalPref("auto_save")} />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/30">
          <CardHeader><CardTitle className="text-base text-destructive flex items-center gap-2"><Trash2 className="w-4 h-4" /> Danger Zone</CardTitle></CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="destructive" size="sm">Delete Account</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone. This will permanently delete your profile and all store connections.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">Delete Everything</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Choose a Plan</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-4">
            {['Free', 'Pro', 'Business'].map(plan => (
              <div key={plan} className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-bold">{plan}</p>
                  <p className="text-xs text-muted-foreground">{plan === 'Free' ? '$0' : plan === 'Pro' ? '$19' : '$49'} / month</p>
                </div>
                {profile?.plan_type === plan.toLowerCase() ? <Badge>Current</Badge> : <Button size="sm" variant="outline" onClick={() => toast({ title: "Coming soon", description: "Payment integration is being finalized." })}>Select</Button>}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Settings;
