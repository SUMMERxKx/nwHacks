import { ReactNode } from "react";
import { TabNavigation } from "./TabNavigation";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-lg mx-auto px-4 pb-24">
        {children}
      </main>
      <TabNavigation />
    </div>
  );
}
