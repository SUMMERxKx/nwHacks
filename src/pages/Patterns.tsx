/**
 * Patterns: hasEnoughData = checkIns.length >= 3 (useCheckInData). Generate calls generatePatterns callable.
 * Period 7|30; pattern cards: title, meaning, evidence, experiment, confidence.
 */
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonLoader";
import { ConfidenceChip } from "@/components/ui/ConfidenceChip";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useCheckInData } from "@/hooks/useCheckInData";
import { generatePatterns as generatePatternsApi } from "@/lib/aiApi";
import type { PatternInsight } from "@/lib/mockData";
import { TrendingUp, Sparkles, Quote, Lightbulb, RefreshCw } from "lucide-react";

export default function Patterns() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [period, setPeriod] = useState<'7' | '30'>('30');
  const [patterns, setPatterns] = useState<PatternInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { checkIns } = useCheckInData();
  const hasEnoughData = checkIns.length >= 3;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generatePatternsApi({ checkInData: checkIns, period });
      setPatterns(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Error generating patterns:', error);
      setPatterns([]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Patterns"
        subtitle={
          <div className="flex items-center gap-2">
            <Chip
              variant={period === '7' ? 'primary' : 'muted'}
              size="sm"
              onClick={() => setPeriod('7')}
            >
              Last 7 days
            </Chip>
            <Chip
              variant={period === '30' ? 'primary' : 'muted'}
              size="sm"
              onClick={() => setPeriod('30')}
            >
              Last 30 days
            </Chip>
          </div>
        }
        action={
          hasEnoughData && (
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              Generate
            </Button>
          )
        }
        onSettingsClick={() => setSettingsOpen(true)}
      />

      {!hasEnoughData ? (
        <EmptyState
          icon={TrendingUp}
          title="Not enough data yet"
          description="Complete at least 3 check-ins to unlock pattern analysis. Your insights will appear here."
        />
      ) : isGenerating ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : patterns.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Ready to find patterns"
          description="Click Generate to analyze your check-ins and discover insights about your habits and tendencies."
          action={{
            label: "Generate Patterns",
            onClick: handleGenerate
          }}
        />
      ) : (
        <div className="space-y-4">
          {patterns.map((pattern, index) => (
            <div 
              key={pattern.id} 
              className="card-elevated p-5 space-y-4 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-foreground">{pattern.title}</h3>
                <ConfidenceChip level={pattern.confidence} />
              </div>

              {/* Meaning */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pattern.meaning}
              </p>

              {/* Evidence */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Quote className="w-3.5 h-3.5" />
                  Evidence
                </div>
                <div className="space-y-2 pl-5">
                  {pattern.evidence.map((e, i) => (
                    <p key={i} className="text-sm text-foreground/80 italic">
                      "{e}"
                    </p>
                  ))}
                </div>
              </div>

              {/* Experiment */}
              <div className="bg-accent/50 rounded-lg p-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground mb-2">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Try this
                </div>
                <p className="text-sm text-foreground">
                  {pattern.experiment}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
