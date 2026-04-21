import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, Download, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ResultDisplayProps {
  result: string | any;
  toolTitle: string;
  toolSlug: string;
  showMarketplace?: boolean;
  onPublishToGumroad?: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  toolTitle,
  toolSlug,
  showMarketplace = false,
  onPublishToGumroad,
}) => {
  const [copied, setCopied] = useState(false);

  const resultText = typeof result === "string" ? result : JSON.stringify(result, null, 2);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(resultText);
    setCopied(true);
    toast({ title: "Copied to clipboard!", duration: 5000 });
    setTimeout(() => setCopied(false), 2000);
  };

  const exportAsText = () => {
    const blob = new Blob([resultText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${toolSlug}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Exported successfully!", duration: 5000 });
  };

  const exportAsJSON = () => {
    const jsonData = {
      tool: toolTitle,
      generatedAt: new Date().toISOString(),
      content: result,
    };
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${toolSlug}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Exported as JSON!", duration: 5000 });
  };

  if (!result) return null;

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500 mt-4 md:mt-6">
      <CardContent className="p-4 sm:p-6 relative">
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-wrap gap-1 sm:gap-2 z-10">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 sm:h-8 sm:w-8"
            onClick={copyToClipboard}
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            ) : (
              <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 sm:h-8 sm:w-8"
            onClick={exportAsText}
            title="Export as TXT"
          >
            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 sm:h-8 sm:w-8"
            onClick={exportAsJSON}
            title="Export as JSON"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none mt-8 sm:mt-0">
          <div className="whitespace-pre-wrap font-sans text-sm sm:text-base text-foreground leading-relaxed break-words">
            {resultText}
          </div>
        </div>

        {showMarketplace && onPublishToGumroad && (
          <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button 
              onClick={onPublishToGumroad}
              className="w-full sm:w-auto gradient-primary text-xs sm:text-sm"
            >
              Publish to Gumroad (Draft)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
