/**
 * Wins: hasData = checkIns.length > 0. Consistency from getCheckInsByDateRange(weekStart, weekEnd).
 * Generate calls generateWins callable → wins + growthNotes. Period 'week'|'30'.
 */
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonLoader";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useCheckInData } from "@/hooks/useCheckInData";
import { generateWins as generateWinsApi } from "@/lib/aiApi";
import { toYYYYMMDD, getWeekStart, getWeekEnd } from "@/lib/utils";
import { Win, GrowthNote } from "@/lib/mockData";
import { Trophy, Sparkles, RefreshCw, CheckCircle, TrendingUp, Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type DisplayWin = Win & { emoji?: string };

export default function Wins() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [period, setPeriod] = useState<'week' | '30'>('week');
  const [wins, setWins] = useState<DisplayWin[]>([]);
  const [growthNotes, setGrowthNotes] = useState<GrowthNote[]>([]);
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
      const { wins: w, growthNotes: g } = await generateWinsApi({ checkInData: checkIns, period });
      const normalizedWins: DisplayWin[] = Array.isArray(w)
        ? w.map((win) => ({ ...win, emoji: (win as DisplayWin).emoji ?? "🏆" }))
        : [];
      setWins(normalizedWins);
      setGrowthNotes(Array.isArray(g) ? g : []);
    } catch (error) {
      console.error('Error generating wins:', error);
      setWins([]);
      setGrowthNotes([]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Wins"
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
          icon={Trophy}
          title="Your wins will appear here"
          description="Complete check-ins to start tracking your progress and celebrating achievements."
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

          {/* Top Wins */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Top Wins</h3>
            </div>
            <div className="space-y-3">
              {wins.map((win, index) => (
                <div 
                  key={win.id}
                  className="card-elevated p-4 animate-slide-up"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">{win.emoji ?? "🏆"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground">{win.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 italic">"{win.evidence}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Notes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Growth Notes</h3>
            </div>
            <div className="space-y-3">
              {growthNotes.map((note, index) => (
                <div 
                  key={note.id}
                  className="card-soft p-4 animate-slide-up"
                  style={{ animationDelay: `${(wins.length + index) * 75}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{note.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
