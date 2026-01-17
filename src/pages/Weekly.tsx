import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonLoader";
import { Chip } from "@/components/ui/Chip";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { 
  mockWeeklyReviews, 
  mockCheckIns, 
  WeeklyReview,
  getWeekStart,
  getWeekEnd,
  formatDate
} from "@/lib/mockData";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Target,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function Weekly() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [review, setReview] = useState<WeeklyReview | null>(mockWeeklyReviews[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [nextWeekPlan, setNextWeekPlan] = useState("");

  const today = new Date();
  const currentWeekStart = getWeekStart(new Date(today.getTime() + currentWeekOffset * 7 * 24 * 60 * 60 * 1000));
  const currentWeekEnd = getWeekEnd(currentWeekStart);

  const hasData = mockCheckIns.length > 0;

  const handleGenerate = () => {
    setIsGenerating(true);
    // TODO: Replace with actual weekly review generation Cloud Function
    setTimeout(() => {
      setReview(mockWeeklyReviews[0]);
      setIsGenerating(false);
    }, 2000);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newOffset = currentWeekOffset + (direction === 'next' ? 1 : -1);
    if (newOffset <= 0) {
      setCurrentWeekOffset(newOffset);
      // In a real app, this would fetch the review for the selected week
    }
  };

  return (
    <>
      <PageHeader
        title="Weekly Review"
        subtitle={
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => navigateWeek('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[180px] text-center">
              {formatDate(currentWeekStart)} – {formatDate(currentWeekEnd)}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => navigateWeek('next')}
              disabled={currentWeekOffset >= 0}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
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
          icon={Calendar}
          title="Complete check-ins for a weekly review"
          description="Once you have a week's worth of reflections, you can generate a summary with insights and plans."
        />
      ) : isGenerating ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : !review ? (
        <EmptyState
          icon={Calendar}
          title="Ready to review this week"
          description="Click Generate to create your weekly summary with themes, highlights, and focus areas."
          action={{
            label: "Generate Review",
            onClick: handleGenerate
          }}
        />
      ) : (
        <div className="space-y-4">
          {/* Theme Card */}
          <div className="card-elevated p-6 text-center animate-fade-in">
            <p className="text-lg font-serif text-foreground leading-relaxed">
              "{review.theme}"
            </p>
          </div>

          {/* Went Well / Didn't Go Well */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-elevated p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-success" />
                <h3 className="font-semibold">Went Well</h3>
              </div>
              <ul className="space-y-2">
                {review.wentWell.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-success mt-1">•</span>
                    <span className="text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-elevated p-5 animate-slide-up" style={{ animationDelay: '150ms' }}>
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Didn't Go Well</h3>
              </div>
              <ul className="space-y-2">
                {review.didntGoWell.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground mt-1">•</span>
                    <span className="text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Next Week Focus */}
          <div className="card-elevated p-5 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Next Week Focus</h3>
            </div>
            <ul className="space-y-2">
              {review.nextWeekFocus.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risk Flags */}
          {review.riskFlags.length > 0 && (
            <div className="card-elevated p-5 border-warning/30 bg-warning/5 animate-slide-up" style={{ animationDelay: '250ms' }}>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <h3 className="font-semibold text-warning-foreground">Things to Watch</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {review.riskFlags.map((flag, i) => (
                  <Chip key={i} variant="warning" size="sm">
                    {flag}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* Plan Next Week CTA */}
          <Button 
            onClick={() => setPlanModalOpen(true)}
            className="w-full gap-2"
            size="lg"
          >
            <Target className="w-4 h-4" />
            Create Next Week Plan
          </Button>
        </div>
      )}

      {/* Plan Modal */}
      <Dialog open={planModalOpen} onOpenChange={setPlanModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Plan Next Week</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Based on your review, what are your key intentions for next week?
            </p>
            <Textarea
              value={nextWeekPlan}
              onChange={(e) => setNextWeekPlan(e.target.value)}
              placeholder="• Focus on deep work in the mornings&#10;• Take a proper lunch break daily&#10;• Limit meetings to 3 per day"
              rows={6}
              className="resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setPlanModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // TODO: Save plan to Firebase
              console.log('Saving plan:', nextWeekPlan);
              setPlanModalOpen(false);
            }}>
              Save Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
