import { Navbar } from "@/components/layout/Navbar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto flex min-h-screen w-full max-w-[1720px] flex-col px-4 py-6 sm:px-6 lg:px-8">
        <Navbar />
        <main className="flex-1 py-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
