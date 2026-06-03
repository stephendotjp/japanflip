import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Desktop: fixed sidebar + scrollable main — both always full viewport height */}
      <div className="hidden md:flex h-screen overflow-hidden bg-[#F7F4EF]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto min-h-0">{children}</main>
      </div>

      {/* Mobile: full-page scroll, fixed bottom nav */}
      <div className="md:hidden flex flex-col min-h-screen bg-[#F7F4EF]">
        <main className="flex-1 overflow-y-auto" style={{ paddingBottom: "calc(56px + env(safe-area-inset-bottom, 0px))" }}>
          {children}
        </main>
        <MobileNav />
      </div>
    </>
  );
}
