import { Navbar } from "@/components/layout/Navbar";
import { RightRail } from "@/components/layout/RightRail";
import { Sidebar } from "@/components/layout/Sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[1240px] flex-col px-5 py-3">
        <Navbar />
        <main className="flex-1 py-3">
          <div className="grid gap-4 xl:grid-cols-[210px_minmax(0,1fr)_250px]">
            <Sidebar />
            <div className="min-w-0">{children}</div>
            <RightRail />
          </div>
        </main>
        <footer className="mt-6 border-t border-[var(--border)] px-1 py-4 text-center text-xs text-[var(--muted)]">
          Joe Knows Ball. NCAA tools are live now, with broader premium sports modules staged for Pro.
        </footer>
      </div>
    </div>
  );
}
