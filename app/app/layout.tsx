import { Sidebar } from "@/components/layout/Sidebar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Desktop: fixed sidebar + scrollable main */}
      <div className="hidden md:flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto min-h-0">{children}</main>
      </div>

      {/* Mobile: full-page scroll + bottom tab bar */}
      <div className="md:hidden flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
        <main
          className="flex-1"
          style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))" }}
        >
          {children}
        </main>
        <MobileTabBar />
      </div>
    </>
  );
}
