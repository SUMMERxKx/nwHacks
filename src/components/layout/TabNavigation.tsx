/**
 * Bottom tab bar: Home, Buddy, Wins, Settings. Uses NavLink; active state by pathname.
 */
import { cn } from "@/lib/utils";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { 
  Home,
  MessageCircle, 
  Trophy,
  Settings
} from "lucide-react";
import { SettingsModal } from "@/components/settings/SettingsModal";

const tabs = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/buddy', label: 'Buddy', icon: MessageCircle },
  { path: '/wins', label: 'Wins', icon: Trophy },
];

export function TabNavigation() {
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-4 left-0 right-0 z-50">
        <div className="max-w-3xl mx-auto px-4">
          <ul className="flex items-center justify-around rounded-2xl border border-border bg-card shadow-lg py-3 px-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path;
              
              return (
                <li key={tab.path}>
                  <NavLink
                    to={tab.path}
                    className={cn(
                      "relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all min-w-[70px]",
                      isActive 
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5 transition-transform",
                      isActive && "scale-110"
                    )} />
                    <span className={cn(
                      "text-xs font-medium",
                      isActive && "text-primary"
                    )}>
                      {tab.label}
                    </span>
                  </NavLink>
                </li>
              );
            })}
            {/* Settings Button */}
            <li>
              <button
                onClick={() => setSettingsOpen(true)}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all min-w-[70px]",
                  "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <Settings className="w-5 h-5" />
                <span className="text-xs font-medium">Settings</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
