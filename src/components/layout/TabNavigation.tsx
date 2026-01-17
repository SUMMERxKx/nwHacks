import { cn } from "@/lib/utils";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Home,
  MessageCircle, 
  TrendingUp, 
  Trophy, 
  Calendar 
} from "lucide-react";

const tabs = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/buddy', label: 'Buddy', icon: MessageCircle },
  { path: '/patterns', label: 'Patterns', icon: TrendingUp },
  { path: '/wins', label: 'Wins', icon: Trophy },
  { path: '/weekly', label: 'Weekly', icon: Calendar },
];

export function TabNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-lg mx-auto">
        <ul className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            
            return (
              <li key={tab.path}>
                <NavLink
                  to={tab.path}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px]",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
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
                  {isActive && (
                    <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
