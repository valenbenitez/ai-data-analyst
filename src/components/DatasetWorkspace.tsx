"use client";

import { useState } from "react";
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
          onClear={() => setResult(null)}
        />
      </div>

      {result?.profile && (
        <div className="rounded-card bg-surface p-card">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
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
              disabled
              title="El chat llega en la próxima tarea"
              className="inline-flex rounded-pill bg-ember px-6 py-3 text-base text-obsidian opacity-50"
            >
              Chat — próximamente
            </button>
          </div>
          <ProfilePreview
            profile={result.profile}
            originalName={result.originalName}
          />
        </div>
      )}
    </div>
  );
}
