import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ChipProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'muted';
  size?: 'sm' | 'md';
  onClick?: () => void;
  active?: boolean;
  className?: string;
}

const variantStyles = {
  default: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50',
  primary: 'bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20 shadow-sm',
  success: 'bg-success/10 text-success border border-success/20 shadow-sm',
  warning: 'bg-warning/15 text-warning-foreground border border-warning/20 shadow-sm',
  muted: 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border/50',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export function Chip({ 
  children, 
  variant = 'default', 
  size = 'md',
  onClick,
  active,
  className 
}: ChipProps) {
  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-all",
        variantStyles[variant],
        sizeStyles[size],
        onClick && "cursor-pointer hover:scale-105 active:scale-95",
        active && "ring-2 ring-primary/30 ring-offset-1 shadow-sm",
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {children}
    </span>
  );
}
