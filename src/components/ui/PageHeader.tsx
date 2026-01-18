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
        "relative overflow-hidden rounded-2xl border bg-card/90 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] px-4 py-4 sm:px-6 sm:py-5",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60 opacity-80" aria-hidden />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          {badge && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {badge}
            </span>
          )}
          <h1 className="text-2xl font-semibold font-serif text-foreground sm:text-3xl">{title}</h1>
          {subtitle && (
            <div className="text-sm text-muted-foreground max-w-2xl">
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
