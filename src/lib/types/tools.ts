import { z } from "zod";

export const getOrderStatusSchema = z.object({
    orderId: z.string().describe("ID o número de orden del cliente"),
});

export const searchProductsSchema = z.object({
    query: z.string().describe("Término de búsqueda: nombre, categoría o SKU"),
    maxResults: z.number().int().min(1).max(10).default(5),
});

export const createSupportTicketSchema = z.object({
    subject: z.string(),
    description: z.string(),
    priority: z.enum(["low", "medium", "high"]).default("medium"),
    userId: z.string().uuid(),
});

export type GetOrderStatusInput = z.infer<typeof getOrderStatusSchema>;
export type SearchProductsInput = z.infer<typeof searchProductsSchema>;
export type CreateSupportTicketInput = z.infer<typeof createSupportTicketSchema>;