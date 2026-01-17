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
}

export function PageHeader({
  title,
  subtitle,
  action,
  onSettingsClick,
  className
}: PageHeaderProps) {
  return (
    <header className={cn(
      "flex items-center justify-between py-4 px-1",
      className
    )}>
      <div>
        <h1 className="text-2xl font-semibold font-serif text-foreground">{title}</h1>
        {subtitle && (
          <div className="mt-1">
            {typeof subtitle === 'string' ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : subtitle}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {action}
        {onSettingsClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-5 h-5" />
          </Button>
        )}
      </div>
    </header>
  );
}
