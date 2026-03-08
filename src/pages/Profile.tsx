import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { User, Camera } from "lucide-react";

const Profile = () => {
  const [name, setName] = useState("Creator User");
  const [email, setEmail] = useState("creator@example.com");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");

  const handleSave = () => {
    toast({ title: "✨ Profile updated!", description: "Your changes have been saved successfully." });
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-display font-bold">Profile</h1>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="gradient-primary text-primary-foreground font-display text-2xl">CU</AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <h2 className="font-display font-semibold text-lg">{name}</h2>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2"><Label>Full Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Current Password</Label><Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} /></div>
            <div className="space-y-2"><Label>New Password</Label><Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div><p className="font-semibold">Subscription</p><p className="text-sm text-muted-foreground">Current plan</p></div>
            <Badge className="gradient-primary text-primary-foreground">Free Plan</Badge>
          </CardContent>
        </Card>

        <Button className="w-full gradient-primary text-primary-foreground btn-animate font-display font-semibold" onClick={handleSave}>
          Save Changes
        </Button>
      </motion.div>
    </DashboardLayout>
  );
};

export default Profile;
