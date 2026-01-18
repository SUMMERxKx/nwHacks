/**
 * Home (/): dashboard + inline check-in. useCheckInData, getCheckInByDate, saveCheckIn (Firestore).
 * Date picker, streak, ratings + prompts, save with unsaved/saved banners.
 */
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { RatingSlider } from "@/components/ui/RatingSlider";
import { TextAreaWithCounter } from "@/components/ui/TextAreaWithCounter";
import { EmptyState } from "@/components/ui/EmptyState";
import { InlineBanner } from "@/components/ui/InlineBanner";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useCheckInData } from "@/hooks/useCheckInData";
import { getCheckInByDate, saveCheckIn } from "@/lib/firebaseService";
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Flame, 
  ClipboardCheck,
  Sparkles,
  Calendar
} from "lucide-react";
import { formatDateFull } from "@/lib/mockData";

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showCheckInSection, setShowCheckInSection] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSavedBanner, setShowSavedBanner] = useState(false);
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

  const { getStreakCount, checkIns } = useCheckInData();
  const streak = getStreakCount();
  const dateKey = selectedDate.toISOString().split('T')[0];
  const isToday = dateKey === new Date().toISOString().split('T')[0];
  const existingCheckIn = checkIns.find(c => c.date === dateKey);

  // Load existing check-in from Firebase
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
          setProud(firebaseData.prompts.proud ?? "");
          setStressed(firebaseData.prompts.stressed ?? "");
          setChallenge(firebaseData.prompts.challenge ?? "");
          setGrateful(firebaseData.prompts.grateful ?? "");
          setIntention(firebaseData.prompts.intention ?? "");
          setShowCheckInSection(true);
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
          setShowCheckInSection(false);
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

  const startNewCheckIn = () => {
    setStress(5);
    setEnergy(5);
    setMood(5);
    setFocus(5);
    setProud("");
    setStressed("");
    setChallenge("");
    setGrateful("");
    setIntention("");
    setShowCheckInSection(true);
    setHasUnsavedChanges(false);
  };

  return (
    <>
      <PageHeader
        title="Home"
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

      <div className="space-y-6">
        {/* Welcome Section */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif font-semibold">Welcome back!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isToday ? "How are you doing today?" : "You're doing great!"}
              </p>
            </div>
            {streak > 0 && (
              <Chip variant="primary" size="md">
                <Flame className="w-4 h-4" />
                {streak} day{streak !== 1 ? 's' : ''}
              </Chip>
            )}
          </div>
        </Card>

        {/* Daily Check-In Section */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Daily Check-In</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => navigateDate('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[100px] text-center">
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
          </div>

          {!showCheckInSection && !existingCheckIn ? (
            <Button
              onClick={startNewCheckIn}
              variant="default"
              className="w-full gap-2"
            >
              <ClipboardCheck className="w-4 h-4" />
              {isToday ? "Start today's check-in" : "Add reflection"}
            </Button>
          ) : existingCheckIn && !showCheckInSection ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                ✓ Check-in completed for this day
              </p>
              <Button
                onClick={startNewCheckIn}
                variant="outline"
                className="w-full"
              >
                Edit Check-In
              </Button>
            </div>
          ) : null}
        </Card>

        {/* Check-In Form */}
        {showCheckInSection && (
          <div className="space-y-4 animate-fade-in">
            {/* Ratings Section */}
            <Card className="p-5 space-y-6">
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
            </Card>

            {/* Text Prompts */}
            <Card className="p-5">
              <TextAreaWithCounter
                label="What are you proud of today?"
                placeholder="Even small wins count..."
                value={proud}
                onChange={(v) => { setProud(v); handleChange(); }}
              />
            </Card>

            <Card className="p-5">
              <TextAreaWithCounter
                label="Did you feel stressed? Why?"
                placeholder="What triggered it?"
                value={stressed}
                onChange={(v) => { setStressed(v); handleChange(); }}
              />
            </Card>

            <Card className="p-5">
              <TextAreaWithCounter
                label="What was the biggest challenge?"
                placeholder="Something you struggled with..."
                value={challenge}
                onChange={(v) => { setChallenge(v); handleChange(); }}
              />
            </Card>

            <Card className="p-5">
              <TextAreaWithCounter
                label="One thing you're grateful for"
                placeholder="Big or small..."
                value={grateful}
                onChange={(v) => { setGrateful(v); handleChange(); }}
              />
            </Card>

            <Card className="p-5">
              <TextAreaWithCounter
                label="One intention for tomorrow"
                placeholder="What will you focus on?"
                value={intention}
                onChange={(v) => { setIntention(v); handleChange(); }}
              />
            </Card>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={!canSave || isLoading}
              className="w-full gap-2 h-10"
              size="lg"
            >
              <Save className="w-4 h-4" />
              {isLoading ? "Saving..." : "Save Check-In"}
            </Button>

            {existingCheckIn && (
              <p className="text-xs text-muted-foreground text-center">
                Last updated: {new Date(existingCheckIn.updatedAt.toDate()).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
