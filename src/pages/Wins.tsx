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
import { useCheckInData } from "@/hooks/useCheckInData";
import { generateWins as generateWinsApi } from "@/lib/aiApi";
import { toYYYYMMDD, getWeekStart, getWeekEnd } from "@/lib/utils";
import { Win, GrowthNote } from "@/lib/mockData";
import { Trophy, Sparkles, RefreshCw, Heart } from "lucide-react";

type DisplayWin = Win & { emoji?: string };

export default function Wins() {
  const [period, setPeriod] = useState<'week' | '30'>('30');
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
        subtitle="Discover all the positive things you've achieved"
        action={
          hasData && (
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              variant="default"
              className="gap-2 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              Generate Wins
            </Button>
          )
        }
      />

      {!hasData ? (
        <EmptyState
          icon={Trophy}
          title="Your wins will appear here"
          description="Complete check-ins to discover all the positive things you've achieved."
        />
      ) : isGenerating ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : wins.length === 0 && !isGenerating ? (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Ready to discover your wins?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click "Generate Wins" to find all the positive things you've achieved
              </p>
            </div>
            <Button onClick={handleGenerate} size="lg" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Generate Wins
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Top Wins - Focus on Positive Achievements */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Your Wins</h3>
            </div>
            <div className="space-y-4">
              {wins.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Click Generate to discover your positive achievements!
                  </p>
                </Card>
              ) : (
                wins.map((win, index) => (
                  <Card 
                    key={win.id}
                    className="p-5 animate-slide-up"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">{win.emoji ?? "🏆"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground mb-2">{win.title}</h4>
                        <p className="text-sm text-muted-foreground italic leading-relaxed">"{win.evidence}"</p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Growth Notes - Always Positive */}
          {growthNotes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">You're Doing Great!</h3>
              </div>
              <div className="space-y-3">
                {growthNotes.map((note, index) => (
                  <Card 
                    key={note.id}
                    className="p-4 bg-primary/5 border-primary/20 animate-slide-up"
                    style={{ animationDelay: `${(wins.length + index) * 75}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground leading-relaxed">{note.content}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
