"use client";
"use no memo";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

type Props = {
  datasetId: string;
  datasetName: string;
};

export function ChatPanel({ datasetId, datasetName }: Props) {
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
      }),
    [],
  );

  const { messages, sendMessage, status, error, stop } = useChat({
    id: datasetId,
    transport,
    throttle: 30,
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    setInput("");
    void sendMessage(
      { text },
      {
        body: { datasetId },
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="font-caption text-xs text-obsidian/60">
        Chat sobre <strong className="text-obsidian">{datasetName}</strong> ·
        contexto = profile (sin CSV completo)
        {busy && (
          <span className="ml-2 text-ember">
            · {status === "submitted" ? "conectando…" : "escribiendo…"}
          </span>
        )}
      </p>

      <div
        ref={listRef}
        className="flex max-h-[420px] min-h-[220px] flex-col gap-4 overflow-y-auto rounded-md bg-pumice/40 p-4"
      >
        {messages.length === 0 && (
          <p className="text-sm text-obsidian/60">
            Probá algo como: “¿Qué columnas numéricas hay?” o “Resumí el
            dataset”.
          </p>
        )}

        {messages.map((message, messageIndex) => {
          const isUser = message.role === "user";
          const isLastAssistant =
            !isUser && messageIndex === messages.length - 1 && busy;

          return (
            <div
              key={message.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-md px-4 py-3 text-sm leading-[1.55] ${
                  isUser
                    ? "whitespace-pre-wrap bg-ember text-obsidian"
                    : "bg-limestone text-obsidian"
                }`}
              >
                <span className="mb-1 block font-caption text-xs text-obsidian/60">
                  {isUser ? "Vos" : "Analista"}
                </span>
                {message.parts.map((part, i) => {
                  if (part.type !== "text" || !part.text) return null;
                  if (isUser || isLastAssistant) {
                    // Plain text while streaming — markdown completo al terminar
                    return (
                      <span
                        key={`${message.id}-${i}`}
                        className="whitespace-pre-wrap"
                      >
                        {part.text}
                      </span>
                    );
                  }
                  return (
                    <div
                      key={`${message.id}-${i}`}
                      className="[&_code]:rounded [&_code]:bg-pumice [&_code]:px-1 [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:font-display [&_h3]:text-[26px] [&_h3]:leading-none [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_p]:first:mt-0 [&_p]:last:mb-0 [&_strong]:font-medium [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_hr]:my-3 [&_hr]:border-obsidian/20"
                    >
                      <ReactMarkdown>{part.text}</ReactMarkdown>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-obsidian" role="alert">
          {error.message || "Error en el chat."}
        </p>
      )}

      <form onSubmit={onSubmit} className="flex flex-wrap gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Preguntale al dataset…"
          disabled={busy}
          className="min-w-[220px] flex-1 rounded-input border-[1.5px] border-obsidian bg-transparent px-6 py-3 text-base text-obsidian placeholder:text-obsidian/40 disabled:opacity-60"
        />
        {busy ? (
          <button
            type="button"
            onClick={() => stop()}
            className="rounded-[40px] border-[1.5px] border-obsidian px-6 py-3 text-base text-obsidian"
          >
            Detener
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="rounded-pill bg-ember px-6 py-3 text-base text-obsidian disabled:cursor-not-allowed disabled:opacity-50"
          >
            Enviar
          </button>
        )}
      </form>
    </div>
  );
}
