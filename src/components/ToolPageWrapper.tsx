import { ArrowLeft, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface ToolPageWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
  output?: string;
}

export function ToolPageWrapper({ title, description, children, output }: ToolPageWrapperProps) {
  const navigate = useNavigate();

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      toast({ title: "Copied!", description: "Content copied to clipboard." });
    }
  };

  const handleExport = (format: string) => {
    toast({ title: `Export as ${format}`, description: "Export feature coming soon." });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="btn-animate">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        </div>
        {output && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="btn-animate">
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("PDF")} className="btn-animate">
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
          </div>
        )}
      </div>
      {children}
    </motion.div>
  );
}
