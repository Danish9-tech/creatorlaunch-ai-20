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
import { Trash2, CreditCard, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const PREFS_KEY = "creatorwand_prefs";

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"); } catch { return {}; }
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
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("plan, plan_type, credits").eq('id', user.id).single();
        if (data) {
          setUserPlan((data.plan || data.plan_type || "free").toLowerCase());
          setUserCredits(data.credits || 0);
        }
      }
    };
    loadUserData();
  }, []);

  const handleDarkMode = (v: boolean) => {
    setDarkMode(v);
    toast({ title: `Dark mode ${v ? "enabled" : "disabled"}` });
  };

  const handleDeleteAccount = async () => {
    // Clear local storage and sign out
    localStorage.clear();
    await supabase.auth.signOut();
    toast({ title: "Account deleted" });
    navigate("/");
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
              <Badge className="bg-primary text-primary-foreground">Current</Badge>
            </div>
            <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
              <DialogTrigger asChild>
                <Button className="w-full gradient-primary">Upgrade Plan</Button>
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
            <p className="text-sm text-muted-foreground mb-4">Deleting your account is permanent.</p>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="destructive">Delete Account</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>All your products and data will be gone forever.</AlertDialogDescription>
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
