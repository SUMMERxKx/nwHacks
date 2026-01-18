/**
 * BlindSpots: Dedicated page for blind spot analysis.
 * Generate calls generateBlindSpots API → blindSpots + awarenessNotes. Period 'week'|'30'.
 */
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonLoader";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useCheckInData } from "@/hooks/useCheckInData";
import { generateBlindSpots as generateBlindSpotsApi } from "@/lib/aiApi";
import { toYYYYMMDD, getWeekStart, getWeekEnd } from "@/lib/utils";
import { BlindSpot, AwarenessNote } from "@/lib/mockData";
import { Eye, RefreshCw, TrendingUp, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function BlindSpots() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [period, setPeriod] = useState<'week' | '30'>('week');
  const [blindSpots, setBlindSpots] = useState<BlindSpot[]>([]);
  const [awarenessNotes, setAwarenessNotes] = useState<AwarenessNote[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { checkIns, getCheckInsByDateRange } = useCheckInData();
  const hasData = checkIns.length > 0;

  const { consistencyDays, totalDays, consistencyPercent } = useMemo(() => {
    const totalDays = 7;
    const weekStart = getWeekStart(new Date());
    const weekEnd = getWeekEnd(new Date());
    const weekCheckIns = getCheckInsByDateRange(toYYYYMMDD(weekStart), toYYYYMMDD(weekEnd));
    const consistencyDays = weekCheckIns.length;
    return { consistencyDays, totalDays, consistencyPercent: (consistencyDays / totalDays) * 100 };
  }, [checkIns, getCheckInsByDateRange]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { blindSpots: bs, awarenessNotes: an } = await generateBlindSpotsApi({ checkInData: checkIns, period });
      setBlindSpots(Array.isArray(bs) ? bs : []);
      setAwarenessNotes(Array.isArray(an) ? an : []);
    } catch (error) {
      console.error('Error generating blind spots:', error);
      setBlindSpots([]);
      setAwarenessNotes([]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Blind Spots"
        subtitle={
          <div className="flex items-center gap-2">
            <Chip
              variant={period === 'week' ? 'primary' : 'muted'}
              size="sm"
              onClick={() => setPeriod('week')}
            >
              This week
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
          hasData && (
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

      {!hasData ? (
        <EmptyState
          icon={Eye}
          title="Your blind spots will appear here"
          description="Complete check-ins to discover potential blind spots and build greater self-awareness."
        />
      ) : isGenerating ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Consistency Widget */}
          <div className="card-elevated p-5 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Consistency</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Check-ins this week</span>
                <span className="font-medium">{consistencyDays}/{totalDays} days</span>
              </div>
              <Progress value={consistencyPercent} className="h-2" />
            </div>
          </div>

          {/* Blind Spots */}
          {blindSpots.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Blind Spots</h3>
              </div>
              <div className="space-y-3">
                {blindSpots.map((spot, index) => (
                  <div 
                    key={spot.id}
                    className="card-elevated p-4 animate-slide-up border-amber-200/30"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center flex-shrink-0">
                        <Eye className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground mb-1">{spot.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2 italic">"{spot.observation}"</p>
                        <p className="text-sm text-foreground leading-relaxed">
                          <span className="font-medium text-amber-700">Suggestion: </span>
                          {spot.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awareness Notes */}
          {awarenessNotes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Awareness Notes</h3>
              </div>
              <div className="space-y-3">
                {awarenessNotes.map((note, index) => (
                  <div 
                    key={note.id}
                    className="card-soft p-4 animate-slide-up border-amber-100"
                    style={{ animationDelay: `${(blindSpots.length + index) * 75}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <Eye className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground leading-relaxed">{note.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state after generation */}
          {!isGenerating && blindSpots.length === 0 && awarenessNotes.length === 0 && hasData && (
            <div className="card-elevated p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto">
                  <Eye className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Ready to discover your blind spots?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click "Generate" to find potential blind spots and build greater self-awareness
                  </p>
                </div>
                <Button onClick={handleGenerate} size="lg" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Generate
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
