import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [productUpdates, setProductUpdates] = useState(true);
  const [marketingTips, setMarketingTips] = useState(true);
  const [autoSave, setAutoSave] = useState(false);
  const [showTooltips, setShowTooltips] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleToggle = (label: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    toast({ title: `${label} ${value ? "enabled" : "disabled"}` });
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-display font-bold">Settings</h1>

        <Card>
          <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Email notifications</Label>
              <Switch checked={emailNotifications} onCheckedChange={(v) => handleToggle("Email notifications", v, setEmailNotifications)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Product updates</Label>
              <Switch checked={productUpdates} onCheckedChange={(v) => handleToggle("Product updates", v, setProductUpdates)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Marketing tips</Label>
              <Switch checked={marketingTips} onCheckedChange={(v) => handleToggle("Marketing tips", v, setMarketingTips)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Dark mode</Label>
              <Switch checked={darkMode} onCheckedChange={(v) => handleToggle("Dark mode", v, setDarkMode)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Auto-save drafts</Label>
              <Switch checked={autoSave} onCheckedChange={(v) => handleToggle("Auto-save drafts", v, setAutoSave)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show tooltips</Label>
              <Switch checked={showTooltips} onCheckedChange={(v) => handleToggle("Show tooltips", v, setShowTooltips)} />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default Settings;
