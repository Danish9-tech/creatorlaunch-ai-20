import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, FileText, FileSpreadsheet, StickyNote } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "creatorwand_last_output";

function getLastOutput(): string {
  return localStorage.getItem(STORAGE_KEY) || "";
}

function handleCopyText() {
  const content = getLastOutput();
  if (!content) {
    toast({ title: "Nothing to copy", description: "Generate some content first using any tool.", variant: "destructive" });
    return;
  }
  navigator.clipboard.writeText(content);
  toast({ title: "Copied!", description: "Content copied to clipboard." });
}

async function handlePdfExport() {
  const content = getLastOutput();
  if (!content) {
    toast({ title: "Nothing to export", description: "Generate some content first using any tool.", variant: "destructive" });
    return;
  }
  try {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(content, 180);
    let y = 20;
    for (const line of lines) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line, 15, y);
      y += 7;
    }
    doc.save("creatorwand-export.pdf");
    toast({ title: "PDF Downloaded", description: "Your content has been exported as a PDF." });
  } catch {
    toast({ title: "PDF Export Failed", description: "Could not generate PDF. Please try again.", variant: "destructive" });
  }
}

function handleGoogleDocs() {
  const content = getLastOutput();
  if (!content) {
    toast({ title: "Nothing to export", description: "Generate some content first using any tool.", variant: "destructive" });
    return;
  }
  const encoded = encodeURIComponent(content);
  window.open(`https://docs.google.com/document/create?title=CreatorWand+Export&body=${encoded}`, "_blank");
  toast({ title: "Opening Google Docs", description: "A new Google Doc is being created." });
}

function handleNotionExport() {
  const content = getLastOutput();
  if (!content) {
    toast({ title: "Nothing to copy", description: "Generate some content first using any tool.", variant: "destructive" });
    return;
  }
  // Format as Notion-compatible markdown
  const notionFormatted = content
    .replace(/\*\*(.*?)\*\*/g, "**$1**")
    .replace(/^- /gm, "• ");
  navigator.clipboard.writeText(notionFormatted);
  toast({ title: "Notion Markdown Copied!", description: "Paste it into any Notion page." });
}

const formats = [
  { name: "Copy Text", icon: Copy, desc: "Copy last generated content to clipboard", handler: handleCopyText },
  { name: "PDF Export", icon: FileText, desc: "Download as a PDF document", handler: handlePdfExport },
  { name: "Google Docs", icon: FileSpreadsheet, desc: "Open in a new Google Doc", handler: handleGoogleDocs },
  { name: "Notion", icon: StickyNote, desc: "Copy Notion-formatted markdown", handler: handleNotionExport },
];

const ExportTools = () => (
  <DashboardLayout>
    <ToolPageWrapper title="Export Tools" description="Export your content in multiple formats.">
      <div className="grid sm:grid-cols-2 gap-4">
        {formats.map((f) => (
          <Card key={f.name} className="card-animate">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <f.icon className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold">{f.name}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
              <Button variant="outline" className="btn-animate" onClick={f.handler}>
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
