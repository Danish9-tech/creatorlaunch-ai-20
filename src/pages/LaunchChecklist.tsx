import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "creatorlaunch_checklist";

const checklist = [
  { category: "Product Creation", items: ["Product files finalized", "Product description written", "License created"] },
  { category: "Listing Optimization", items: ["SEO keywords added", "Title optimized", "Tags selected", "Images/mockups ready"] },
  { category: "Marketing", items: ["Social posts created", "Email campaign prepared", "DM scripts ready"] },
  { category: "Launch", items: ["Pricing set", "Listings published", "Launch email sent", "Social posts scheduled"] },
];

const total = checklist.reduce((a, c) => a + c.items.length, 0);

const LaunchChecklist = () => {
  const [checked, setChecked] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...checked]));
  }, [checked]);

  const toggle = (item: string) => {
    const next = new Set(checked);
    next.has(item) ? next.delete(item) : next.add(item);
    setChecked(next);
  };

  const done = checked.size;
  const isComplete = done === total;

  return (
    <DashboardLayout>
      <ToolPageWrapper title="Launch Checklist" description="Track your product launch progress.">
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6"
            >
              <Card className="border-highlight border-2 overflow-hidden">
                <CardContent className="p-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="inline-flex w-16 h-16 rounded-full bg-highlight/20 items-center justify-center mb-3"
                  >
                    <PartyPopper className="w-8 h-8 text-highlight" />
                  </motion.div>
                  <h3 className="font-display font-bold text-xl mb-1">🎉 Congratulations!</h3>
                  <p className="text-muted-foreground text-sm">You've completed all launch checklist items. You're ready to launch!</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

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
