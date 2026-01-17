import { cn } from "@/lib/utils";
import { X, CheckCircle2, AlertTriangle, Info, AlertCircle } from "lucide-react";

interface InlineBannerProps {
  variant: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description?: string;
  onDismiss?: () => void;
  className?: string;
}

const variantConfig = {
  success: {
    icon: CheckCircle2,
    bgClass: 'bg-success/10 border-success/20',
    iconClass: 'text-success',
    titleClass: 'text-success'
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-warning/10 border-warning/30',
    iconClass: 'text-warning',
    titleClass: 'text-warning-foreground'
  },
  error: {
    icon: AlertCircle,
    bgClass: 'bg-destructive/10 border-destructive/20',
    iconClass: 'text-destructive',
    titleClass: 'text-destructive'
  },
  info: {
    icon: Info,
    bgClass: 'bg-info/10 border-info/20',
    iconClass: 'text-info',
    titleClass: 'text-info'
  }
};

export function InlineBanner({
  variant,
  title,
  description,
  onDismiss,
  className
}: InlineBannerProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg border animate-fade-in",
      config.bgClass,
      className
    )}>
      <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", config.iconClass)} />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", config.titleClass)}>{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded-md hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
