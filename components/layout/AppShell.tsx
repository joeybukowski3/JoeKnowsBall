import { Navbar } from "@/components/layout/Navbar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[1240px] flex-col px-5 py-[18px]">
        <Navbar />
        <main className="flex-1 py-8">{children}</main>
        <footer className="mt-10 border-t border-[var(--border)] px-1 py-5 text-center text-xs text-[var(--muted)]">
          Joe Knows Ball. NCAA tools are live now, with broader premium sports modules staged for Pro.
        </footer>
      </div>
    </div>
  );
}
