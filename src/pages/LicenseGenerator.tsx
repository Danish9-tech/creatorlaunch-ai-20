import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Sparkles } from "lucide-react";

const licenses: Record<string, string> = {
  PLR: `PRIVATE LABEL RIGHTS LICENSE\n\nPermissions:\n✅ Edit and modify the product\n✅ Add your name as the author\n✅ Resell the product\n✅ Bundle with other products\n\nRestrictions:\n❌ Cannot claim original creation\n❌ Cannot sell PLR rights\n\nDisclaimer: This license is provided as-is.`,
  MRR: `MASTER RESELL RIGHTS LICENSE\n\nPermissions:\n✅ Resell the product\n✅ Keep 100% of profits\n✅ Pass resell rights to buyers\n\nRestrictions:\n❌ Cannot modify the product\n❌ Cannot give away for free\n\nDisclaimer: This license is provided as-is.`,
  Personal: `PERSONAL USE LICENSE\n\nPermissions:\n✅ Use for personal projects\n✅ Print for personal use\n\nRestrictions:\n❌ Cannot resell\n❌ Cannot redistribute\n❌ Cannot use commercially\n\nDisclaimer: This license is provided as-is.`,
};

const LicenseGenerator = () => {
  const [type, setType] = useState("");
  const output = type ? licenses[type] || "" : "";

  return (
    <DashboardLayout>
      <ToolPageWrapper title="License Generator" description="Generate legal license documents for your products." output={output}>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2"><Label>License Type</Label>
              <Select value={type} onValueChange={setType}><SelectTrigger><SelectValue placeholder="Select license type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLR">PLR (Private Label Rights)</SelectItem>
                  <SelectItem value="MRR">MRR (Master Resell Rights)</SelectItem>
                  <SelectItem value="Personal">Personal License</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {type && (
          <Card className="mt-6 card-animate">
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-accent" /> {type} License</CardTitle></CardHeader>
            <CardContent><pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">{output}</pre></CardContent>
          </Card>
        )}
      </ToolPageWrapper>
    </DashboardLayout>
  );
};

export default LicenseGenerator;
