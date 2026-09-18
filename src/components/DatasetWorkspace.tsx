"use client";

import { useEffect, useRef, useState } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import { CsvUpload } from "@/components/CsvUpload";
import { ProfilePreview } from "@/components/ProfilePreview";
import type { DatasetProfile } from "@/lib/datasets/profile";

type UploadResult = {
  id: string;
  originalName: string;
  createdAt: string;
  sizeBytes: number;
  profile: DatasetProfile;
};

export function DatasetWorkspace() {
  const [result, setResult] = useState<UploadResult | null>(null);
  const [profileOpen, setProfileOpen] = useState(true);
  const chatSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!result?.profile) return;
    // Tras el upload: colapsar profile y llevar al chat
    setProfileOpen(false);
    const id = window.requestAnimationFrame(() => {
      chatSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [result?.id, result?.profile]);

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-card bg-surface p-card">
        <div className="mb-6 flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-obsidian text-sm text-chalk"
          >
            1
          </span>
          <h2 className="text-[30px] leading-[1.5] text-obsidian">
            Elegí un dataset
          </h2>
        </div>
        <CsvUpload
          onSuccess={(data) => setResult(data)}
          onClear={() => {
            setResult(null);
            setProfileOpen(true);
          }}
        />
      </div>

      {result?.profile && (
        <>
          <div className="rounded-card bg-surface p-card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-obsidian text-sm text-chalk"
                >
                  2
                </span>
                <h2 className="text-[30px] leading-[1.5] text-obsidian">
                  Profile del dataset
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                aria-expanded={profileOpen}
                className="rounded-[40px] border-[1.5px] border-obsidian px-4 py-2 text-sm text-obsidian"
              >
                {profileOpen ? "Colapsar" : "Expandir"}
              </button>
            </div>

            {!profileOpen && (
              <p className="mt-4 font-caption text-xs text-obsidian/60">
                {result.originalName} · {result.profile.rowCount} filas ·{" "}
                {result.profile.columns.length} columnas
              </p>
            )}

            {profileOpen && (
              <div className="mt-6">
                <ProfilePreview
                  profile={result.profile}
                  originalName={result.originalName}
                />
              </div>
            )}
          </div>

          <div
            ref={chatSectionRef}
            id="chat"
            className="scroll-mt-6 rounded-card bg-surface p-card"
          >
            <div className="mb-6 flex items-center gap-3">
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-obsidian text-sm text-chalk"
              >
                3
              </span>
              <h2 className="text-[30px] leading-[1.5] text-obsidian">Chat</h2>
            </div>
            <ChatPanel
              key={result.id}
              datasetId={result.id}
              datasetName={result.originalName}
            />
          </div>
        </>
      )}
    </div>
  );
}
