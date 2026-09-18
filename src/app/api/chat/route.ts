import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  smoothStream,
  stepCountIs,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { google } from "@ai-sdk/google";
import { createDatasetTools } from "@/lib/datasets/agent-tools";
import { getDatasetMeta, getProfile } from "@/lib/datasets/store";
import type { DatasetProfile } from "@/lib/datasets/profile";

export const runtime = "nodejs";
export const maxDuration = 60;

function profileToSystemPrompt(
  originalName: string,
  profile: DatasetProfile,
): string {
  const columns = profile.columns
    .map((c) => {
      const bits = [
        `${c.name}:${c.type}`,
        `nulls=${c.nullCount}`,
        `card=${c.cardinality}`,
      ];
      if (c.type === "number") {
        bits.push(
          `min=${c.min}`,
          `max=${c.max}`,
          `mean=${c.mean}`,
          `median=${c.median}`,
        );
      }
      if (c.type === "category" && c.topValues?.length) {
        bits.push(
          `top=${c.topValues.map((t) => `${t.value}(${t.count})`).join("|")}`,
        );
      }
      return `- ${bits.join(", ")}`;
    })
    .join("\n");

  return [
    "Sos un analista de datos. Respondé en español, claro y conciso.",
    "Podés usar markdown simple (títulos, listas, negrita); se renderiza en la UI.",
    "Tenés un PROFILE compacto del dataset (schema/stats/sample). NO el CSV completo.",
    "Usá tools cuando necesites datos concretos:",
    "- get_schema: columnas y tipos",
    "- describe_column: stats de una columna",
    "- sample_rows: filas reales del CSV (máx 20)",
    "No inventes números ni filas que no vengan del profile o de las tools.",
    "Si falta una agregación exacta sobre muchas filas, pedí aclaración (SQL llega después).",
    "",
    `Dataset: ${originalName}`,
    `Filas: ${profile.rowCount}`,
    "Columnas:",
    columns,
    "",
    "Sample (hasta 5 filas, del profile):",
    JSON.stringify(profile.sample, null, 2),
  ].join("\n");
}

export async function POST(req: Request) {
  const body = await req.json();
  const messages = body.messages as UIMessage[] | undefined;
  const datasetId = body.datasetId as string | undefined;

  if (!datasetId) {
    return Response.json({ error: "Falta datasetId." }, { status: 400 });
  }
  if (!messages?.length) {
    return Response.json({ error: "Faltan messages." }, { status: 400 });
  }

  const meta = await getDatasetMeta(datasetId);
  const profile = await getProfile(datasetId);

  if (!meta || !profile) {
    return Response.json(
      { error: "Dataset o profile no encontrado." },
      { status: 404 },
    );
  }

  const result = streamText({
    model: google("gemini-3.6-flash"),
    system: profileToSystemPrompt(meta.originalName, profile),
    messages: await convertToModelMessages(messages),
    tools: createDatasetTools(datasetId),
    stopWhen: stepCountIs(5),
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingLevel: "minimal",
        },
      },
    },
    experimental_transform: smoothStream({
      delayInMs: 15,
      chunking: "word",
    }),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
    }),
    headers: {
      "Transfer-Encoding": "chunked",
      Connection: "keep-alive",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
