import { tool } from "ai";
import { getOrderStatusSchema } from "@/lib/types/tools";
import { supabaseAdmin } from "@/lib/supabase/server";

export const getOrderStatus = tool({
    description:
        "Consulta el estado y detalles de una orden específica del cliente por su ID.",
    inputSchema: getOrderStatusSchema,
    execute: async ({ orderId }) => {
        const { data, error } = await supabaseAdmin
            .from("orders")
            .select("id, status, total, created_at, order_items(quantity, unit_price, products(name))")
            .eq("id", orderId)
            .single();

        if (error) {
            return {
                success: false as const,
                error: `No se encontró la orden ${orderId}. Verificá el número e intentá de nuevo.`,
            };
        }

        return { success: true as const, data };
    },
});