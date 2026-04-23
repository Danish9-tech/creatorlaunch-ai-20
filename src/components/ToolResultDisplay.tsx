import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const HEADLINE_KEYS = ["name", "title", "headline", "keyword", "optimizedTitle"];
const TAG_KEYS = ["tags", "keywords", "seoKeywords", "hashtags"];

function humanLabel(key: string) {
  return key
    .replace(/[_-]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isTagField(key: string, value: unknown) {
  if (TAG_KEYS.includes(key)) return true;
  if (Array.isArray(value) && value.every((v) => typeof v === "string" && v.length < 40)) return true;
  return false;
}

function valueToTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((v) => v.trim()).filter(Boolean);
  return [];
}

interface ToolResultDisplayProps {
  result: any;
  toolSlug: string;
}

function FieldBlock({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined || value === "") return null;

  if (isTagField(label.toLowerCase(), value)) {
    const tags = valueToTags(value);
    if (!tags.length) return null;
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((t, i) => (
            <Badge key={i} variant="secondary" className="rounded-full">
              {t}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/90">
          {value.map((v, i) => (
            <li key={i}>{typeof v === "object" ? JSON.stringify(v) : String(v)}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (typeof value === "object") {
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <pre className="text-xs bg-muted/50 p-3 rounded-md overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{String(value)}</p>
    </div>
  );
}

function getHeadline(item: Record<string, any>): string | null {
  for (const k of HEADLINE_KEYS) {
    if (item[k] && typeof item[k] === "string") return item[k];
  }
  return null;
}

export function ToolResultDisplay({ result, toolSlug }: ToolResultDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportable = typeof result === "string" ? result : JSON.stringify(result, null, 2);

  const Toolbar = (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => handleCopy(exportable)}>
        {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
        Copy
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          handleDownload(exportable, `${toolSlug}-result.${typeof result === "string" ? "txt" : "json"}`)
        }
      >
        <Download className="h-4 w-4 mr-2" />
        Download
      </Button>
    </div>
  );

  // Array of items
  if (Array.isArray(result)) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> {result.length} Results
          </h3>
          {Toolbar}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {result.map((item, idx) => {
            if (typeof item !== "object" || item === null) {
              return (
                <Card key={idx} className="card-animate">
                  <CardContent className="p-4 text-sm">{String(item)}</CardContent>
                </Card>
              );
            }
            const headline = getHeadline(item) ?? `Result ${idx + 1}`;
            const rest = Object.entries(item).filter(
              ([k, v]) => !(typeof v === "string" && v === headline),
            );
            return (
              <Card key={idx} className="card-animate border-primary/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{headline}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {rest.map(([k, v]) => (
                    <FieldBlock key={k} label={humanLabel(k)} value={v} />
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Object result
  if (typeof result === "object" && result !== null) {
    const headline = getHeadline(result);
    const entries = Object.entries(result).filter(
      ([, v]) => !(typeof v === "string" && v === headline),
    );
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Generated Content
          </h3>
          {Toolbar}
        </div>
        {headline && (
          <Card className="border-primary">
            <CardContent className="p-5">
              <p className="text-xl font-semibold leading-snug">{headline}</p>
            </CardContent>
          </Card>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {entries.map(([k, v]) => (
            <Card key={k}>
              <CardContent className="p-5">
                <FieldBlock label={humanLabel(k)} value={v} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // String result
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" /> Generated Content
        </h3>
        {Toolbar}
      </div>
      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {String(result)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
