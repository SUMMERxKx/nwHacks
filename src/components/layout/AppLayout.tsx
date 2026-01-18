/**
 * Shell for authenticated pages: max-w container, main content, fixed bottom TabNavigation.
 */
import { ReactNode } from "react";
import { TabNavigation } from "./TabNavigation";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(34,197,94,0.05),transparent_50%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.05),transparent_40%)]" aria-hidden />
      <main className="relative max-w-3xl mx-auto px-5 pb-32 pt-8 space-y-6">
        {children}
      </main>
      <TabNavigation />
    </div>
  );
}
