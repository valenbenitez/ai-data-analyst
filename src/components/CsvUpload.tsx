"use client";

import { useRef, useState } from "react";
import type { DatasetProfile } from "@/lib/datasets/profile";

type DatasetMeta = {
  id: string;
  originalName: string;
  createdAt: string;
  sizeBytes: number;
};

type UploadSuccess = DatasetMeta & { profile: DatasetProfile };

type Status =
  | { kind: "idle" }
  | { kind: "uploading" }
  | { kind: "success"; data: UploadSuccess }
  | { kind: "error"; message: string };

function isCsv(file: File) {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".csv") ||
    file.type === "text/csv" ||
    file.type === "application/vnd.ms-excel"
  );
}

type Props = {
  onSuccess?: (data: UploadSuccess) => void;
  onClear?: () => void;
};

export function CsvUpload({ onSuccess, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  function pickFile(next: File | null) {
    if (!next) return;
    if (!isCsv(next)) {
      setFile(null);
      setStatus({ kind: "error", message: "Solo se aceptan archivos CSV." });
      return;
    }
    setFile(next);
    setStatus({ kind: "idle" });
    onClear?.();
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0] ?? null;
    e.target.value = "";
    pickFile(next);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0] ?? null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || status.kind === "uploading") return;

    setStatus({ kind: "uploading" });
    const body = new FormData();
    body.set("file", file);

    try {
      const res = await fetch("/api/datasets", { method: "POST", body });
      const data = await res.json();

      if (!res.ok) {
        setStatus({
          kind: "error",
          message: data.error ?? "No se pudo subir el archivo.",
        });
        onClear?.();
        return;
      }

      if (!data.profile) {
        setStatus({
          kind: "error",
          message: "Upload OK pero no se recibió el profile.",
        });
        return;
      }

      const success = data as UploadSuccess;
      setStatus({ kind: "success", data: success });
      onSuccess?.(success);
    } catch {
      setStatus({ kind: "error", message: "Error de red al subir el CSV." });
      onClear?.();
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-element">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={onInputChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex min-h-[180px] w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed px-6 py-10 text-center transition-colors ${
          dragging
            ? "border-ember bg-ember/10"
            : "border-obsidian/25 bg-pumice/40 hover:border-obsidian/45"
        }`}
      >
        <span className="text-base text-obsidian">
          {file ? file.name : "Soltá el CSV acá o hacé click para elegir"}
        </span>
        <span className="font-caption text-xs text-obsidian/60">
          {file
            ? `${(file.size / 1024).toFixed(1)} KB · listo para subir`
            : "Un archivo .csv por sesión (v1)"}
        </span>
      </button>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!file || status.kind === "uploading"}
          className="inline-flex rounded-pill bg-ember px-6 py-3 text-base text-obsidian disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status.kind === "uploading" ? "Subiendo…" : "Subir CSV"}
        </button>
        {file && status.kind !== "uploading" && (
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setStatus({ kind: "idle" });
              onClear?.();
            }}
            className="rounded-[40px] border-[1.5px] border-obsidian px-4 py-3 text-base text-obsidian"
          >
            Quitar
          </button>
        )}
      </div>

      {status.kind === "success" && (
        <p className="text-sm leading-[1.2] text-obsidian">
          Listo: <strong>{status.data.originalName}</strong>
          <br />
          <span className="font-caption text-xs text-obsidian/70">
            id: {status.data.id} · {status.data.profile.rowCount} filas
          </span>
        </p>
      )}

      {status.kind === "error" && (
        <p className="text-sm text-obsidian" role="alert">
          {status.message}
        </p>
      )}
    </form>
  );
}
