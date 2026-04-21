import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Zap, Copy, Check, Download, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  toolSlug: string;
  toolTitle: string;
  fields: Record<string, any>;
  showMarketplace?: boolean; // Only true for listings-generator
}

export const AIGenerator = ({ toolSlug, toolTitle, fields, showMarketplace = false }: Props) => {
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Clear previous results when tool changes
  useEffect(() => {
    setResult("");
  }, [toolSlug]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast({ 
      title: "Copied to clipboard!",
      duration: 5000 // Auto-hide after 5 seconds
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const exportAsText = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${toolSlug}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ 
      title: "Exported successfully!",
      duration: 5000
    });
  };

  const exportAsJSON = () => {
    const jsonData = {
      tool: toolTitle,
      generatedAt: new Date().toISOString(),
      content: result,
      fields: fields
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
    toast({ 
      title: "Exported as JSON!",
      duration: 5000
    });
  };

  const publishToGumroad = async () => {
    // This will be called only from listings-generator
    toast({
      title: "Publishing to Gumroad...",
      description: "Creating draft product",
      duration: 5000
    });
    
    try {
      // Call Gumroad API to create draft
      const { data, error } = await supabase.functions.invoke('publish-gumroad-product', {
        body: {
          title: fields.productName || toolTitle,
          description: result,
          price: fields.price || 0
        }
      });

      if (error) throw error;

      toast({
        title: "Published to Gumroad!",
        description: "Product added as draft",
        duration: 5000
      });
    } catch (error: any) {
      toast({
        title: "Publish failed",
        description: error.message,
        variant: "destructive",
        duration: 5000
      });
    }
  };

  const generateStream = async () => {
    if (Object.values(fields).every((v) => !v)) {
      toast({ 
        title: "Please fill in the fields first", 
        variant: "destructive",
        duration: 5000
      });
      return;
    }

    setIsLoading(true);
    setResult("");

    try {
      let authToken = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.access_token) {
          authToken = sessionData.session.access_token;
        }
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            tool: toolSlug,
            toolTitle: toolTitle,
            fields: fields,
          }),
        }
      );

      if (!response.ok) {
        let errorMsg = "Generation failed";
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch {
          errorMsg = `Generation failed (${response.status})`;
        }
        throw new Error(errorMsg);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setResult((prev) => prev + chunk);
      }

      toast({ 
        title: "Generation Successful!",
        duration: 5000
      });
    } catch (error: any) {
      toast({
        title: "Generation Error",
        description: error.message,
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 w-full">
      <Button
        onClick={generateStream}
        disabled={isLoading}
        className="w-full gradient-primary text-primary-foreground h-10 sm:h-12 text-sm sm:text-lg font-semibold btn-animate"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
        ) : (
          <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
        )}
        <span className="truncate">{isLoading ? "AI is Thinking..." : `Generate ${toolTitle}`}</span>
      </Button>

      {result && (
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                {result}
              </div>
            </div>

            {showMarketplace && (
              <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row gap-2 sm:justify-end">
                <Button 
                  onClick={publishToGumroad}
                  className="w-full sm:w-auto gradient-primary text-xs sm:text-sm"
                >
                  Publish to Gumroad (Draft)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
