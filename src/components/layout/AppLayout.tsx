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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/60 to-primary/5 relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,209,197,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(52,102,199,0.08),transparent_30%)]" aria-hidden />
      <main className="relative max-w-3xl mx-auto px-4 pb-28 pt-6 space-y-4">
        {children}
      </main>
      <TabNavigation />
    </div>
  );
}
