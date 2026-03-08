import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, FileText, FileSpreadsheet, StickyNote } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const formats = [
  { name: "Copy Text", icon: Copy, desc: "Copy to clipboard" },
  { name: "PDF", icon: FileText, desc: "Export as PDF document" },
  { name: "Google Docs", icon: FileSpreadsheet, desc: "Export to Google Docs format" },
  { name: "Notion", icon: StickyNote, desc: "Export in Notion format" },
];

const ExportTools = () => (
  <DashboardLayout>
    <ToolPageWrapper title="Export Tools" description="Export your content in multiple formats.">
      <div className="grid sm:grid-cols-2 gap-4">
        {formats.map((f) => (
          <Card key={f.name} className="card-animate">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center"><f.icon className="w-6 h-6 text-accent" /></div>
              <div className="flex-1">
                <h3 className="font-display font-semibold">{f.name}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
              <Button variant="outline" className="btn-animate" onClick={() => toast({ title: `${f.name}`, description: "Export feature coming soon." })}>
                Export
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </ToolPageWrapper>
  </DashboardLayout>
);

export default ExportTools;
