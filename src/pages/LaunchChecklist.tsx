import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare } from "lucide-react";

const checklist = [
  { category: "Product Creation", items: ["Product files finalized", "Product description written", "License created"] },
  { category: "Listing Optimization", items: ["SEO keywords added", "Title optimized", "Tags selected", "Images/mockups ready"] },
  { category: "Marketing", items: ["Social posts created", "Email campaign prepared", "DM scripts ready"] },
  { category: "Launch", items: ["Pricing set", "Listings published", "Launch email sent", "Social posts scheduled"] },
];

const LaunchChecklist = () => {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (item: string) => {
    const next = new Set(checked);
    next.has(item) ? next.delete(item) : next.add(item);
    setChecked(next);
  };

  const total = checklist.reduce((a, c) => a + c.items.length, 0);
  const done = checked.size;

  return (
    <DashboardLayout>
      <ToolPageWrapper title="Launch Checklist" description="Track your product launch progress.">
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>{done} of {total} completed</span>
            <span className="font-bold text-primary">{Math.round((done / total) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div className="h-3 rounded-full gradient-primary transition-all" style={{ width: `${(done / total) * 100}%` }} />
          </div>
        </div>

        <div className="space-y-4">
          {checklist.map((cat) => (
            <Card key={cat.category} className="card-animate">
              <CardContent className="p-5">
                <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-accent" /> {cat.category}
                </h3>
                <div className="space-y-2">
                  {cat.items.map((item) => (
                    <label key={item} className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
                      <Checkbox checked={checked.has(item)} onCheckedChange={() => toggle(item)} />
                      <span className={checked.has(item) ? "line-through text-muted-foreground" : ""}>{item}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ToolPageWrapper>
    </DashboardLayout>
  );
};

export default LaunchChecklist;
