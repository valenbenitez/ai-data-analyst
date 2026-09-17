import { NextResponse } from "next/server";
import { saveDataset } from "@/lib/datasets/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
        return NextResponse.json(
            { error: "Falta el archivo CSV" },
            { status: 400 }
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
            { status: 400 }
        );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const meta = await saveDataset({
        originalName: file.name,
        bytes,
    });

    return NextResponse.json(meta, { status: 201 });
}