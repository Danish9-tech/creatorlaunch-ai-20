import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Zap, Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ListToMarketplace } from "@/components/ListToMarketplace";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  toolSlug: string;
  toolTitle: string;
  fields: Record<string, any>;
}

export const AIGenerator = ({ toolSlug, toolTitle, fields }: Props) => {
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const generateStream = async () => {
    if (Object.values(fields).every((v) => !v)) {
      toast({ title: "Please fill in the fields first", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult("");
    try {
      // Get the current user session token (JWT) for auth
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

      // Stream the plain text response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setResult((prev) => prev + chunk);
      }

      toast({ title: "Generation Successful!" });
    } catch (error: any) {
      toast({
        title: "Generation Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <Button
        onClick={generateStream}
        disabled={isLoading}
        className="w-full gradient-primary text-primary-foreground h-12 text-lg font-semibold btn-animate"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Zap className="mr-2 h-5 w-5" />
        )}
        {isLoading ? "AI is Thinking..." : `Generate ${toolTitle}`}
      </Button>

      {result && (
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap font-sans text-foreground leading-relaxed">
                {result}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-end">
              <ListToMarketplace generatedContent={result} toolTitle={toolTitle} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
