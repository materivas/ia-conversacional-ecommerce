# Agente de IA Conversacional para E-Commerce

Asistente de soporte con **tool use real**: no solo chatea, ejecuta acciones sobre una base de datos en producción — consulta pedidos, busca productos y crea tickets de soporte, todo con datos reales, sin alucinar.

## El problema que resuelve

Un chatbot de soporte tradicional responde con texto genérico o inventa información cuando no tiene contexto real. Este agente está diseñado para que el modelo **decida cuándo usar una herramienta** (tool calling) en vez de generar una respuesta libre, de forma que cada dato que menciona (estado de un pedido, precio, stock) viene de una consulta real a la base de datos, no de la imaginación del modelo.

## Arquitectura

```
Usuario → Next.js (API Route) → Vercel AI SDK (streamText)
                                        │
                                        ├─ Decide si necesita una tool
                                        │
                                        ▼
                              ┌─────────────────────┐
                              │   Tools (Zod schema)  │
                              │  - getOrderStatus     │
                              │  - searchProducts     │
                              │  - createSupportTicket│
                              └──────────┬───────────┘
                                         │
                                         ▼
                                   Supabase (Postgres)
                                         │
                                         ▼
                         Resultado real → modelo → respuesta en texto
```

**Flujo de una request:**
1. El usuario envía un mensaje.
2. El modelo (Claude o Gemini, intercambiable) analiza la intención y decide si necesita ejecutar una tool.
3. Si la necesita, genera los parámetros según el schema Zod definido — el modelo nunca toca la base de datos directamente.
4. El código del servidor ejecuta la consulta real contra Supabase.
5. El resultado (datos reales o un error controlado) vuelve al modelo.
6. El modelo redacta la respuesta final en lenguaje natural, basada en esos datos.

## Stack y por qué

| Tecnología | Por qué |
|---|---|
| **Next.js 15 (App Router)** | API Routes + frontend en un solo proyecto, Server Actions nativas |
| **Vercel AI SDK v5** | Abstrae el proveedor de modelo (tool calling estandarizado, streaming nativo) |
| **Claude 3.5 Sonnet / Gemini 3.5 Flash** | Arquitectura multi-provider: el agente es agnóstico del modelo, se cambia con una env var sin tocar lógica de negocio |
| **Supabase (Postgres)** | Base de datos relacional real con Row Level Security nativo |
| **Zod** | Contrato tipado entre lo que el modelo puede pedir y lo que el backend ejecuta — valida cada tool call antes de correr |
| **TypeScript estricto** | Sin `any`; los tipos de la DB se generan automáticamente desde el schema de Supabase |

## Las 3 tools

| Tool | Qué hace | Qué devuelve si falla |
|---|---|---|
| `getOrderStatus` | Consulta estado y detalle de una orden por ID | Mensaje claro, nunca expone el error interno de Postgres |
| `searchProducts` | Busca productos por nombre, categoría o SKU | Mensaje explícito si no hay resultados, para que el modelo no invente productos |
| `createSupportTicket` | Crea un ticket de soporte | Error genérico al usuario, log real solo en servidor |

## Cómo correrlo localmente

```bash
git clone <repo>
cd ia-conversacional-ecommerce
npm install
cp .env.local.example .env.local
```

Completá `.env.local`:
```
AI_PROVIDER=google                          # "google" o "anthropic"
ANTHROPIC_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Corré el schema SQL (`docs/schema.sql`) en el SQL Editor de tu proyecto Supabase, generá los tipos:
```bash
npx supabase gen types typescript --project-id TU_PROJECT_ID > src/lib/types/database.ts
```

Y levantá el server:
```bash
npm run dev
```

## Estructura del proyecto

```
src/
├── app/api/chat/route.ts       # Endpoint principal (streamText + tools)
├── lib/
│   ├── ai/
│   │   ├── agent.ts            # Modelo + system prompt (multi-provider)
│   │   └── tools/               # Cada tool en su propio archivo
│   ├── supabase/server.ts       # Cliente admin (service_role)
│   └── types/                   # Zod schemas + tipos de DB generados
└── components/chat/              # UI del chat (en progreso)
```

## Deuda técnica conocida

Documentar esto explícitamente es intencional — mostrar qué falta y por qué es parte del proceso de ingeniería real, no un descuido.

- **`userId` en `createSupportTicket`** viene como parámetro que el modelo completa, no de una sesión autenticada real. En producción debería inyectarse desde Supabase Auth antes de llegar a la tool, no dejar que el LLM lo decida.
- **Cliente `service_role`** bypassea Row Level Security — el filtrado de datos por usuario lo hace el código, no la base de datos. Migrar a token de sesión + RLS es el siguiente paso de hardening.
- **Sin tests automatizados todavía.**
- **UI de chat en desarrollo** — el backend está probado end-to-end vía requests directos al endpoint.

## Roadmap

- [x] Definición de arquitectura y schema de datos
- [x] Tools con manejo de errores robusto
- [x] Agente multi-provider funcionando end-to-end
- [ ] UI de chat (componentes + streaming en frontend)
- [ ] Auth real de usuarios + RLS
- [ ] Tests
- [ ] Deploy (Vercel + Supabase)