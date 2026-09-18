import Link from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <main className="relative z-0 mx-auto flex w-full max-w-page flex-1 flex-col px-4 py-10 sm:px-6 sm:py-14">
        {children}
      </main>
    </div>
  );
}
