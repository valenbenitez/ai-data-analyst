import { AppShell } from "@/components/AppShell";

export default function Home() {
  return (
    <AppShell>
      <section className="flex flex-1 flex-col justify-center gap-6">
        <p className="font-caption text-xs text-obsidian/70">v1 · CSV</p>
        <h1 className="max-w-3xl font-display text-[48px] leading-none tracking-[0.02em] text-obsidian sm:text-[80px] sm:leading-[1.1]">
          Preguntale a tu CSV
        </h1>
        <p className="max-w-md text-base leading-[1.55] text-obsidian">
          Subí un archivo, vemos el profile y el agente consulta con tools — el
          CSV completo no va al modelo.
        </p>
        <div className="pt-2">
          <span className="inline-flex rounded-pill bg-ember px-6 py-3 text-base text-obsidian">
            Subí un CSV — próximamente
          </span>
        </div>
      </section>
    </AppShell>
  );
}
