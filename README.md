# AI Data Analyst

Chat en lenguaje natural sobre archivos CSV. El modelo orquesta; el código calcula (profile + tools / DuckDB). El CSV completo no se manda al LLM.


## Requisitos

- Node.js 20+
- Key de [Google AI Studio](https://aistudio.google.com/) (Gemini)

## Setup

```bash
npm install
cp .env.example .env.local
```

Editá `.env.local` y poné tu `GOOGLE_GENERATIVE_AI_API_KEY`. Esa variable **solo** se usa en el server (API routes); no la prefijes con `NEXT_PUBLIC_`.

## Desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servir el build |
| `npm run lint` | Biome check |
| `npm run format` | Biome format |

## Stack (v1)

- Next.js (App Router)
- Vercel AI SDK + Gemini (chat / tools — en progreso)
- DuckDB (SQL sobre CSV — en progreso)
- Persistencia: sesión / filesystem temporal (sin DB durable en v1)
