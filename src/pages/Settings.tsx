import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

const Settings = () => (
  <DashboardLayout>
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold">Settings</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {["Email notifications", "Product updates", "Marketing tips"].map((s) => (
            <div key={s} className="flex items-center justify-between">
              <Label>{s}</Label>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {["Dark mode", "Auto-save drafts", "Show tooltips"].map((s) => (
            <div key={s} className="flex items-center justify-between">
              <Label>{s}</Label>
              <Switch />
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  </DashboardLayout>
);

export default Settings;
