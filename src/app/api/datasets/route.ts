import { NextResponse } from "next/server";
import { buildProfile } from "@/lib/datasets/profile";
import {
  saveDataset,
  getDatasetCsvPath,
  saveProfile,
} from "@/lib/datasets/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Falta el archivo CSV" },
      { status: 400 },
    );
  }

  const name = file.name.toLowerCase();
  const looksCsv =
    name.endsWith(".csv") ||
    file.type === "text/csv" ||
    file.type === "application/vnd.ms-excel";

  if (!looksCsv) {
    return NextResponse.json(
      { error: "Solo se aceptan archivos CSV" },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const meta = await saveDataset({
    originalName: file.name,
    bytes,
  });

  const csvPath = await getDatasetCsvPath(meta.id);
  if (!csvPath) {
    return NextResponse.json(
      { error: "No se encontró el CSV guardado." },
      { status: 500 },
    );
  }

  try {
    const profile = await buildProfile(csvPath);
    await saveProfile(meta.id, profile);
    return NextResponse.json({ ...meta, profile }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudo perfilar el CSV.";
    return NextResponse.json(
      { ...meta, error: message },
      { status: 422 },
    );
  }
}