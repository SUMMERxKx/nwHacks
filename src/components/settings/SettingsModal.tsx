import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Divider } from "@/components/ui/Divider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LogOut } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { settings, updateSettings } = useSettings();
  const [displayName, setDisplayName] = useState(settings.displayName);
  const [reminderTime, setReminderTime] = useState(settings.reminderTime);
  const [tone, setTone] = useState(settings.tone);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setDisplayName(settings.displayName);
      setReminderTime(settings.reminderTime);
      setTone(settings.tone);
    }
  }, [open, settings]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
      onOpenChange(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleSave = () => {
    updateSettings({ displayName, reminderTime, tone });
    toast({
      title: "Settings saved",
      description: "Your preferences will stick across sessions.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile */}
          <div className="space-y-3">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <Divider />

          {/* Reminders */}
          <div className="space-y-3">
            <Label htmlFor="reminderTime">Daily Reminder</Label>
            <Input
              id="reminderTime"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              You'll get a gentle nudge to check in at this time.
            </p>
          </div>

          <Divider />

          {/* Tone Preference */}
          <div className="space-y-3">
            <Label>Buddy Tone</Label>
            <RadioGroup value={tone} onValueChange={setTone} className="space-y-2">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="direct" id="direct" />
                <Label htmlFor="direct" className="font-normal cursor-pointer">
                  <span className="font-medium">Direct</span>
                  <span className="text-muted-foreground"> — Straight to the point</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="balanced" id="balanced" />
                <Label htmlFor="balanced" className="font-normal cursor-pointer">
                  <span className="font-medium">Balanced</span>
                  <span className="text-muted-foreground"> — Friendly and clear</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="gentle" id="gentle" />
                <Label htmlFor="gentle" className="font-normal cursor-pointer">
                  <span className="font-medium">Gentle</span>
                  <span className="text-muted-foreground"> — Warm and supportive</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Divider />

          {/* Data Controls */}
          <div className="space-y-3">
            <Label className="text-muted-foreground">Data Controls</Label>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" disabled className="flex-1">
                Export Data
              </Button>
              <Button variant="outline" size="sm" disabled className="flex-1 text-destructive hover:text-destructive">
                Delete Account
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              These features will be available once you create an account.
            </p>
          </div>

          <Divider />

          {/* Logout */}
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="w-full text-destructive hover:text-destructive gap-2"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </Button>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
