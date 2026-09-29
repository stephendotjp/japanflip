import { Sidebar } from "@/components/layout/Sidebar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

// One tree for every width — pages render once, so their state (a lookup result,
// a half-filled form) survives crossing the md breakpoint.
// Mobile: page scrolls, fixed bottom tab bar. Desktop: fixed sidebar, main scrolls.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:h-screen md:flex md:overflow-hidden" style={{ background: "var(--bg)" }}>
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <main className="pb-[calc(64px+env(safe-area-inset-bottom,0px))] md:pb-0 md:flex-1 md:overflow-y-auto md:min-h-0">
        {children}
      </main>
      <div className="md:hidden">
        <MobileTabBar />
      </div>
    </div>
  );
}
