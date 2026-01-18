/**
 * Bottom tab bar: Home, Buddy, Patterns, Wins, Blind Spots. Uses NavLink; active state by pathname.
 */
import { cn } from "@/lib/utils";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Home,
  MessageCircle, 
  TrendingUp, 
  Trophy,
  Eye
} from "lucide-react";

const tabs = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/buddy', label: 'Buddy', icon: MessageCircle },
  { path: '/patterns', label: 'Patterns', icon: TrendingUp },
  { path: '/wins', label: 'Wins', icon: Trophy },
  { path: '/blind-spots', label: 'Blind Spots', icon: Eye },
];

export function TabNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-4 left-0 right-0 z-50">
      <div className="max-w-3xl mx-auto px-4">
        <ul className="flex items-center justify-around rounded-2xl border-2 border-border/60 bg-card/95 backdrop-blur-xl shadow-elevated py-2.5">
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
                      ? "text-primary bg-primary/10 shadow-inner"
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
        </ul>
      </div>
    </nav>
  );
}
