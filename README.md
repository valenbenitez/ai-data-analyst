# AI Data Analyst
<img width="1470" height="844" alt="image" src="https://github.com/user-attachments/assets/f503310b-7342-4625-8c2e-88456491ace5" />


Chat en lenguaje natural sobre archivos CSV. El modelo orquesta; el código calcula (profile + tools / DuckDB). Una version simple que permite consultar con lenguaje natural los datos de, por el momento, tu CSV. Esta herramienta podría ser iterada para funcionar como algo mas, quizás transformar una base de datos que un comercio/equipo tenia en Google Sheet/Excel o si necesitaras consultar un CSV en tu aplicación, esta herramienta podría ser de utilidad.


## Requisitos

- Node.js 20+
- Key de [Google AI Studio](https://aistudio.google.com/) (Gemini)

## Setup

```bash
npm install
cp .env.example .env.local
```

Editá `.env.local` y poné tu `GOOGLE_GENERATIVE_AI_API_KEY`. Esa variable **solo** se usa en el server (API routes).

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
