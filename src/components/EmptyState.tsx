import { Button } from "@/components/ui/button";
import { LucideIcon, FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon = FolderOpen, title, description, actionLabel, actionUrl, onAction }: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-display font-semibold text-lg mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {actionLabel && (
        <Button
          className="gradient-primary text-primary-foreground btn-animate"
          onClick={() => { if (onAction) onAction(); else if (actionUrl) navigate(actionUrl); }}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
