import { cn } from "@/lib/utils";
import { Textarea } from "./textarea";

interface TextAreaWithCounterProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  className?: string;
  rows?: number;
}

export function TextAreaWithCounter({
  label,
  placeholder,
  value,
  onChange,
  maxLength = 500,
  className,
  rows = 3
}: TextAreaWithCounterProps) {
  const remaining = maxLength - value.length;
  const isNearLimit = remaining < 50;
  const isAtLimit = remaining <= 0;

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <Textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          rows={rows}
          className="resize-none pr-16 bg-background/50 focus:bg-background transition-colors"
        />
        <span className={cn(
          "absolute bottom-2 right-3 text-xs tabular-nums transition-colors",
          isAtLimit ? "text-destructive font-medium" :
          isNearLimit ? "text-warning" : "text-muted-foreground"
        )}>
          {remaining}
        </span>
      </div>
    </div>
  );
}
