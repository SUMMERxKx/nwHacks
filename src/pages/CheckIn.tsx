import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { RatingSlider } from "@/components/ui/RatingSlider";
import { TextAreaWithCounter } from "@/components/ui/TextAreaWithCounter";
import { EmptyState } from "@/components/ui/EmptyState";
import { InlineBanner } from "@/components/ui/InlineBanner";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/button";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { 
  mockCheckIns, 
  getStreakCount, 
  CheckInEntry,
  formatDateFull 
} from "@/lib/mockData";
import { getCheckInByDate, saveCheckIn } from "@/lib/firebaseService";
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Flame, 
  ClipboardCheck,
  Sparkles
} from "lucide-react";

export default function CheckIn() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSavedBanner, setShowSavedBanner] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Ratings
  const [stress, setStress] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [mood, setMood] = useState(5);
  const [focus, setFocus] = useState(5);
  
  // Prompts
  const [proud, setProud] = useState("");
  const [stressed, setStressed] = useState("");
  const [challenge, setChallenge] = useState("");
  const [grateful, setGrateful] = useState("");
  const [intention, setIntention] = useState("");

  const streak = getStreakCount(mockCheckIns);
  const dateKey = selectedDate.toISOString().split('T')[0];
  const existingEntry = mockCheckIns.find(c => c.date === dateKey);
  const isToday = dateKey === new Date().toISOString().split('T')[0];

  // Load existing entry from Firebase

  useEffect(() => {
    const loadCheckIn = async () => {
      setIsLoading(true);
      try {
        const firebaseData = await getCheckInByDate(dateKey);
        if (firebaseData) {
          setStress(firebaseData.ratings.stress);
          setEnergy(firebaseData.ratings.energy);
          setMood(firebaseData.ratings.mood);
          setFocus(firebaseData.ratings.focus);
          setProud(firebaseData.prompts.proud);
          setStressed(firebaseData.prompts.stressed);
          setChallenge(firebaseData.prompts.challenge);
          setGrateful(firebaseData.prompts.grateful);
          setIntention(firebaseData.prompts.intention);
          setIsStarted(true);
        } else if (existingEntry) {
          setStress(existingEntry.ratings.stress);
          setEnergy(existingEntry.ratings.energy);
          setMood(existingEntry.ratings.mood);
          setFocus(existingEntry.ratings.focus);
          setProud(existingEntry.prompts.proud);
          setStressed(existingEntry.prompts.stressed);
          setChallenge(existingEntry.prompts.challenge);
          setGrateful(existingEntry.prompts.grateful);
          setIntention(existingEntry.prompts.intention);
          setIsStarted(true);
        } else {
          // Reset for new day
          setStress(5);
          setEnergy(5);
          setMood(5);
          setFocus(5);
          setProud("");
          setStressed("");
          setChallenge("");
          setGrateful("");
          setIntention("");
          setIsStarted(false);
        }
      } catch (error) {
        console.error("Error loading check-in:", error);
      } finally {
        setIsLoading(false);
      }
      setHasUnsavedChanges(false);
    };

    loadCheckIn();
  }, [dateKey]);

  const handleChange = () => {
    setHasUnsavedChanges(true);
  };

  const canSave = proud || stressed || challenge || grateful || intention;

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await saveCheckIn({
        date: dateKey,
        ratings: { stress, energy, mood, focus },
        prompts: { proud, stressed, challenge, grateful, intention }
      });
      setHasUnsavedChanges(false);
      setShowSavedBanner(true);
      setTimeout(() => setShowSavedBanner(false), 3000);
    } catch (error) {
      console.error("Error saving check-in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };

  return (
    <>
      <PageHeader
        title="Daily Check-In"
        subtitle={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => navigateDate('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[140px] text-center">
                {isToday ? 'Today' : formatDateFull(selectedDate).split(',').slice(0, 2).join(',')}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => navigateDate('next')}
                disabled={isToday}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            {streak > 0 && (
              <Chip variant="primary" size="sm">
                <Flame className="w-3.5 h-3.5" />
                {streak}-day streak
              </Chip>
            )}
          </div>
        }
        action={
          isStarted && (
            <Button 
              onClick={handleSave}
              disabled={!canSave}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
          )
        }
        onSettingsClick={() => setSettingsOpen(true)}
      />

      {showSavedBanner && (
        <InlineBanner
          variant="success"
          title="Check-in saved"
          description="Great job reflecting today!"
          onDismiss={() => setShowSavedBanner(false)}
          className="mb-4"
        />
      )}

      {hasUnsavedChanges && !showSavedBanner && (
        <InlineBanner
          variant="info"
          title="You have unsaved changes"
          className="mb-4"
        />
      )}

      {!isStarted && !existingEntry ? (
        <EmptyState
          icon={ClipboardCheck}
          title={isToday ? "Ready for today's reflection?" : "No check-in for this day"}
          description={isToday 
            ? "Take a few minutes to check in with yourself. It helps build self-awareness over time."
            : "You can still add a reflection for past days."}
          action={{
            label: isToday ? "Start today's check-in" : "Add reflection",
            onClick: () => setIsStarted(true)
          }}
        />
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Ratings Section */}
          <div className="card-elevated p-5 space-y-6">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              How are you feeling?
            </div>
            
            <RatingSlider
              label="Stress Level"
              helperText="How stressed do you feel right now?"
              value={stress}
              onChange={(v) => { setStress(v); handleChange(); }}
              lowLabel="Calm"
              highLabel="Overwhelmed"
            />
            
            <RatingSlider
              label="Energy"
              helperText="How's your physical and mental energy?"
              value={energy}
              onChange={(v) => { setEnergy(v); handleChange(); }}
              lowLabel="Drained"
              highLabel="Energized"
            />
            
            <RatingSlider
              label="Mood"
              helperText="Overall emotional state"
              value={mood}
              onChange={(v) => { setMood(v); handleChange(); }}
              lowLabel="Low"
              highLabel="Great"
            />
            
            <RatingSlider
              label="Focus"
              helperText="Ability to concentrate today"
              value={focus}
              onChange={(v) => { setFocus(v); handleChange(); }}
              lowLabel="Scattered"
              highLabel="Laser-focused"
            />
          </div>

          {/* Text Prompts */}
          <div className="space-y-4">
            <div className="card-elevated p-5">
              <TextAreaWithCounter
                label="What are you proud of today?"
                placeholder="Even small wins count..."
                value={proud}
                onChange={(v) => { setProud(v); handleChange(); }}
              />
            </div>

            <div className="card-elevated p-5">
              <TextAreaWithCounter
                label="Did you feel stressed? Why?"
                placeholder="What triggered it?"
                value={stressed}
                onChange={(v) => { setStressed(v); handleChange(); }}
              />
            </div>

            <div className="card-elevated p-5">
              <TextAreaWithCounter
                label="What was the biggest challenge?"
                placeholder="Something you struggled with..."
                value={challenge}
                onChange={(v) => { setChallenge(v); handleChange(); }}
              />
            </div>

            <div className="card-elevated p-5">
              <TextAreaWithCounter
                label="One thing you're grateful for"
                placeholder="Big or small..."
                value={grateful}
                onChange={(v) => { setGrateful(v); handleChange(); }}
              />
            </div>

            <div className="card-elevated p-5">
              <TextAreaWithCounter
                label="One intention for tomorrow"
                placeholder="What will you focus on?"
                value={intention}
                onChange={(v) => { setIntention(v); handleChange(); }}
              />
            </div>
          </div>

          {existingEntry && (
            <p className="text-xs text-muted-foreground text-center pb-4">
              Last updated: {new Date(existingEntry.updatedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
