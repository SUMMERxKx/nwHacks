/**
 * Home (/): Welcome message, daily check-in, and wins summary.
 * Shows welcome back with displayName, check-in prompt, and positive wins messages.
 */
import { useState, useEffect } from "react";
import { RatingSlider } from "@/components/ui/RatingSlider";
import { TextAreaWithCounter } from "@/components/ui/TextAreaWithCounter";
import { InlineBanner } from "@/components/ui/InlineBanner";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSettings } from "@/hooks/useSettings";
import type { Win, GrowthNote } from "@/lib/mockData";
import { useCheckInData } from "@/hooks/useCheckInData";
import { getCheckInByDate, saveCheckIn, getAllCheckIns } from "@/lib/firebaseService";
import { generateWins as generateWinsApi } from "@/lib/aiApi";
import { 
  Save, 
  Flame, 
  ClipboardCheck,
  Sparkles,
  Heart,
  ArrowRight
} from "lucide-react";

export default function Home() {
  const { settings } = useSettings();
  const { getStreakCount, checkIns } = useCheckInData();
  const [showCheckInSection, setShowCheckInSection] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSavedBanner, setShowSavedBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [winsMessages, setWinsMessages] = useState<string[]>([]);
  const [isLoadingWins, setIsLoadingWins] = useState(false);
  
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

  const streak = getStreakCount();
  const today = new Date().toISOString().split('T')[0];
  const existingCheckIn = checkIns.find(c => c.date === today);

  // Load today's check-in
  useEffect(() => {
    const loadCheckIn = async () => {
      try {
        const firebaseData = await getCheckInByDate(today);
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
        } else {
          setStress(5);
          setEnergy(5);
          setMood(5);
          setFocus(5);
          setProud("");
          setStressed("");
          setChallenge("");
          setGrateful("");
          setIntention("");
        }
      } catch (error) {
        console.error("Error loading check-in:", error);
      }
      setHasUnsavedChanges(false);
    };
    loadCheckIn();
  }, [today]);

  // Load wins messages when check-in exists
  useEffect(() => {
    const loadWins = async () => {
      if (existingCheckIn && checkIns.length > 0) {
        setIsLoadingWins(true);
        try {
          const { wins, growthNotes } = await generateWinsApi({ checkInData: checkIns, period: '30' });
          const positiveMessages: string[] = [];
          
          // Add win titles with positive framing
          if (Array.isArray(wins) && wins.length > 0) {
            wins.slice(0, 2).forEach((win: Win) => {
              if (win.title && win.evidence) {
                positiveMessages.push(`✨ You did something great: ${win.title}`);
              }
            });
          }
          
          // Add growth notes (always positive)
          if (Array.isArray(growthNotes) && growthNotes.length > 0) {
            growthNotes.slice(0, 2).forEach((note: GrowthNote) => {
              if (note.content) {
                positiveMessages.push(`💚 ${note.content}`);
              }
            });
          }
          
          // Add generic positive messages if no wins generated
          if (positiveMessages.length === 0) {
            positiveMessages.push("You're doing great! Keep up the amazing work!");
            positiveMessages.push("Every day is a step forward. You've got this!");
          }
          
          setWinsMessages(positiveMessages);
        } catch (error) {
          console.error("Error loading wins:", error);
          setWinsMessages(["You're amazing! Keep reflecting and growing!"]);
        } finally {
          setIsLoadingWins(false);
        }
      } else {
        setWinsMessages([]);
      }
    };
    loadWins();
  }, [existingCheckIn, checkIns]);

  const handleChange = () => {
    setHasUnsavedChanges(true);
  };

  const canSave = proud || stressed || challenge || grateful || intention;

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await saveCheckIn({
        date: today,
        ratings: { stress, energy, mood, focus },
        prompts: { proud, stressed, challenge, grateful, intention }
      });
      setHasUnsavedChanges(false);
      setShowSavedBanner(true);
      setShowCheckInSection(false);
      
      // Trigger wins reload after a short delay
      setTimeout(async () => {
        try {
          const allCheckIns = await getAllCheckIns();
          const { wins, growthNotes } = await generateWinsApi({ checkInData: allCheckIns, period: '30' });
          const positiveMessages: string[] = [];
          
          if (Array.isArray(wins) && wins.length > 0) {
            wins.slice(0, 2).forEach((win: Win) => {
              if (win.title && win.evidence) {
                positiveMessages.push(`✨ You did something great: ${win.title}`);
              }
            });
          }
          
          if (Array.isArray(growthNotes) && growthNotes.length > 0) {
            growthNotes.slice(0, 2).forEach((note: GrowthNote) => {
              if (note.content) {
                positiveMessages.push(`💚 ${note.content}`);
              }
            });
          }
          
          if (positiveMessages.length === 0) {
            positiveMessages.push("You're doing great! Keep up the amazing work!");
            positiveMessages.push("Every day is a step forward. You've got this!");
          }
          
          setWinsMessages(positiveMessages);
        } catch (error) {
          console.error("Error loading wins:", error);
          setWinsMessages(["You're amazing! Keep reflecting and growing!"]);
        }
      }, 1500);
    } catch (error) {
      console.error("Error saving check-in:", error);
    } finally {
      setIsLoading(false);
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
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-primary/5 border-primary/20 p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground tracking-tight">
              Welcome back{settings.displayName ? `, ${settings.displayName}` : ''}!
            </h1>
            <p className="text-base text-muted-foreground mt-2 leading-relaxed">
              Ready to reflect on your day?
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

      {showSavedBanner && (
        <InlineBanner
          variant="success"
          title="Check-in saved"
          description="Great job reflecting today!"
          onDismiss={() => setShowSavedBanner(false)}
        />
      )}

      {/* Check-In Section */}
      {!existingCheckIn && !showCheckInSection ? (
        <Card className="p-8 text-center border-2 border-primary/20 shadow-sm">
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto shadow-sm">
              <ClipboardCheck className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                Ready for your daily check-in?
              </h2>
              <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                Take a moment to reflect on how you're feeling today
              </p>
            </div>
            <Button
              onClick={startNewCheckIn}
              size="lg"
              className="gap-2 shadow-sm"
            >
              Start Check-In
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ) : null}

      {/* Check-In Form */}
      {showCheckInSection && (
        <div className="space-y-4 animate-fade-in">
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

          <Button
            onClick={handleSave}
            disabled={!canSave || isLoading}
            className="w-full gap-2"
            size="lg"
          >
            <Save className="w-4 h-4" />
            {isLoading ? "Saving..." : "Save Check-In"}
          </Button>

          {hasUnsavedChanges && (
            <p className="text-xs text-muted-foreground text-center">
              You have unsaved changes
            </p>
          )}
        </div>
      )}

      {/* Wins Summary - Only show after check-in is saved */}
      {existingCheckIn && !showCheckInSection && winsMessages.length > 0 && (
        <Card className="p-8 space-y-5 bg-gradient-to-br from-success/10 via-primary/5 to-primary/5 border-success/20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-success" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">You're doing great!</h2>
          </div>
          {isLoadingWins ? (
            <div className="space-y-3">
              <div className="h-5 bg-muted/50 rounded-lg animate-pulse" />
              <div className="h-5 bg-muted/50 rounded-lg animate-pulse w-4/5" />
            </div>
          ) : (
            <div className="space-y-4">
              {winsMessages.map((message, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-base text-foreground leading-relaxed flex-1">
                    {message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Check-in completed message */}
      {existingCheckIn && !showCheckInSection && winsMessages.length === 0 && !isLoadingWins && (
        <Card className="p-8 text-center border-success/20 shadow-sm">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-8 h-8 text-success" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground mb-2">
                Check-in completed!
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Visit Wins to discover your positive achievements.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
