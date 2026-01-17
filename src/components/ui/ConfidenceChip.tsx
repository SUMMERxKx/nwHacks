import { Chip } from "./Chip";

interface ConfidenceChipProps {
  level: 'Low' | 'Medium' | 'High';
}

export function ConfidenceChip({ level }: ConfidenceChipProps) {
  const variant = level === 'High' ? 'success' : level === 'Medium' ? 'primary' : 'muted';
  
  return (
    <Chip variant={variant} size="sm">
      {level} confidence
    </Chip>
  );
}
