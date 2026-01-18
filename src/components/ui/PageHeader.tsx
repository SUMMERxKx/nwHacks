import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "./button";

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  onSettingsClick?: () => void;
  className?: string;
  badge?: string;
}

export function PageHeader({
  title,
  subtitle,
  action,
  onSettingsClick,
  className,
  badge
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card backdrop-blur-sm px-6 py-5",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" aria-hidden />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          {badge && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20">
              {badge}
            </span>
          )}
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">{title}</h1>
          {subtitle && (
            <div className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {typeof subtitle === "string" ? <p>{subtitle}</p> : subtitle}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-center">
          {action}
          {onSettingsClick && (
            <Button
              variant="outline"
              size="icon"
              onClick={onSettingsClick}
              className="border-border/70 hover:border-border"
            >
              <Settings className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
