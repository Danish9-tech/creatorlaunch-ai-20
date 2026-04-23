import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Zap, Copy, Check, Download, FileText, FileJson } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ToolResultDisplay } from "@/components/ToolResultDisplay";

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
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [parsed, setParsed] = useState<any>(null);

  // FIX #7: Clear previous results when tool changes
  useEffect(() => {
    setResult("");
    setShowSuccessToast(false);
    setParsed(null);
  }, [toolSlug]);

  // FIX #4: Auto-hide success toast after 5 seconds
  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast({ 
      title: "Copied to clipboard!",
      duration: 5000 // FIX #4: Auto-hide after 5 seconds
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // FIX #1: Export as Text
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
      duration: 5000 // FIX #4: Auto-hide after 5 seconds
    });
  };

  // FIX #1: Export as JSON
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
      duration: 5000 // FIX #4: Auto-hide after 5 seconds
    });
  };

  // FIX #3: Gumroad publishing only for listings-generator
  const publishToGumroad = async () => {
    toast({
      title: "Publishing to Gumroad...",
      description: "Creating draft product",
      duration: 5000 // FIX #4: Auto-hide after 5 seconds
    });
    
    try {
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
        duration: 5000 // FIX #4: Auto-hide after 5 seconds
      });
    } catch (error: any) {
      toast({
        title: "Publish failed",
        description: error.message,
        variant: "destructive",
        duration: 5000 // FIX #4: Auto-hide after 5 seconds
      });
    }
  };

  const generateStream = async () => {
    if (Object.values(fields).every((v) => !v)) {
      toast({ 
        title: "Please fill in the fields first", 
        variant: "destructive",
        duration: 5000 // FIX #4: Auto-hide after 5 seconds
      });
      return;
    }

    setIsLoading(true);
    setResult("");
    setShowSuccessToast(false);

    try {
      let authToken = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.access_token) {
          authToken = sessionData.session.access_token;
        }
      }

      // FIX #8: Enhanced AI prompt with better instructions
      const enhancedPrompt = {
        tool: toolSlug,
        toolTitle: toolTitle,
        fields: fields,
        instructions: `Generate high-quality, professional ${toolTitle} content. 
        Ensure the output is:
        - Well-structured and easy to read
        - Professional and polished
        - Actionable and practical
        - Formatted with proper line breaks and sections
        - Comprehensive yet concise`
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(enhancedPrompt),
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

      // Try to parse the final result as JSON for structured display
      setResult((finalText) => {
        try {
          const cleaned = finalText
            .replace(/```json\s*/gi, "")
            .replace(/```\s*/gi, "")
            .trim();
          const match = cleaned.match(/(\[\s*[\s\S]*\]|\{[\s\S]*\})/);
          if (match) setParsed(JSON.parse(match[0]));
        } catch {
          /* keep as plain text */
        }
        return finalText;
      });

      // FIX #4: Show success toast with auto-hide
      setShowSuccessToast(true);
      toast({ 
        title: "Generation Successful!",
        duration: 5000 // Auto-hide after 5 seconds
      });
    } catch (error: any) {
      toast({
        title: "Generation Error",
        description: error.message,
        variant: "destructive",
        duration: 5000 // FIX #4: Auto-hide after 5 seconds
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 w-full">
      {/* FIX #5 & #6: Mobile responsive button with better text sizing and alignment */}
      <Button
        onClick={generateStream}
        disabled={isLoading}
        className="w-full gradient-primary text-primary-foreground h-11 sm:h-12 text-base sm:text-lg font-semibold btn-animate px-4 sm:px-6"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 sm:h-5 sm:w-5 animate-spin flex-shrink-0" />
            <span className="truncate">AI is Thinking...</span>
          </>
        ) : (
          <>
            <Zap className="mr-2 h-5 w-5 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">Generate {toolTitle}</span>
          </>
        )}
      </Button>

      {/* FIX #4: Success toast notification */}
      {showSuccessToast && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <Check className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="text-sm sm:text-base font-medium">Content generated successfully!</span>
          </div>
        </div>
      )}

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
          {isLoading && !parsed ? (
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="whitespace-pre-wrap font-sans text-sm sm:text-base text-foreground leading-relaxed break-words bg-muted/30 rounded-lg p-4 sm:p-6">
                  {result}
                </div>
              </CardContent>
            </Card>
          ) : (
            <ToolResultDisplay result={parsed ?? result} toolSlug={toolSlug} />
          )}

          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={exportAsText}>
              <FileText className="h-4 w-4 mr-2" /> TXT
            </Button>
            <Button variant="outline" size="sm" onClick={exportAsJSON}>
              <FileJson className="h-4 w-4 mr-2" /> JSON
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
