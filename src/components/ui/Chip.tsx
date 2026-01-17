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
  default: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  primary: 'bg-primary/10 text-primary hover:bg-primary/15',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-warning-foreground',
  muted: 'bg-muted text-muted-foreground hover:bg-muted/80',
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
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        onClick && "cursor-pointer",
        active && "ring-2 ring-primary ring-offset-2",
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {children}
    </span>
  );
}
