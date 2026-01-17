import { cn } from "@/lib/utils";
import { Slider } from "./slider";

interface RatingSliderProps {
  label: string;
  helperText?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
  className?: string;
}

export function RatingSlider({
  label,
  helperText,
  value,
  onChange,
  min = 1,
  max = 10,
  lowLabel = "Low",
  highLabel = "High",
  className
}: RatingSliderProps) {
  const getValueColor = (val: number) => {
    const normalized = (val - min) / (max - min);
    if (normalized <= 0.3) return 'text-destructive';
    if (normalized <= 0.6) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-baseline justify-between">
        <div>
          <label className="text-sm font-medium text-foreground">{label}</label>
          {helperText && (
            <p className="text-xs text-muted-foreground mt-0.5">{helperText}</p>
          )}
        </div>
        <span className={cn(
          "text-2xl font-semibold tabular-nums",
          getValueColor(value)
        )}>
          {value}
        </span>
      </div>
      
      <Slider
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        min={min}
        max={max}
        step={1}
        className="w-full"
      />
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
