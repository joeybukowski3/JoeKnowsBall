import { Navbar } from "@/components/layout/Navbar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <Navbar />
        <main className="flex-1 py-7">{children}</main>
      </div>
    </div>
  );
}
