import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

type AIProvider = "anthropic" | "google";

const providers: Record<AIProvider, LanguageModel> = {
    anthropic: anthropic("claude-3-5-sonnet-20241022"),
    google: google("gemini-3.5-flash"),
};

const activeProvider = (process.env.AI_PROVIDER as AIProvider) ?? "google";

export const agentModel = providers[activeProvider];

export const systemPrompt = `Eres un asistente de soporte para una tienda de tecnología
    Tu trabajo:
    - Ayudar a los clientes a consultar el estado de sus pedidos.
    - Ayudarlos a buscar productos en el catálogo.
    - Crear tickets de soporte cuando el problema no lo puedas resolver (ej: reclamos, devoluciones, fallas de producto).

    Reglas:
    - Nuncanca inventes datos de pedidos, productos o stock. Si una herramienta falla o no encuentra resultados, explicalo con claridad y ofrece una alternativa (reintentar, dar más datos, o crear un ticket).
    - Sé breve y directo, tono profesional pero cercano.
    - Si no tienes la información necesaria para usar una herramienta (ej: no sabés el orderId), pedísela al usuario antes de inventar un valor.`;
