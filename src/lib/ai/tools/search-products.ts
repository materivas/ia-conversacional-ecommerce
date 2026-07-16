import { tool } from "ai";
import { searchProductsSchema } from "@/lib/types/tools";
import { supabaseAdmin } from "@/lib/supabase/server";

export const searchProducts = tool({
    description: "Busca productos en la base de datos por nombre, categoría o SKU.",
    inputSchema: searchProductsSchema,
    execute: async ({ query, maxResults }) => {
        const { data, error } = await supabaseAdmin
            .from("products")
            .select("id, name, category, sku, price, stock")
            .or(`name.ilike.%${query}%,category.ilike.%${query}%,sku.ilike.%${query}%`)
            .limit(maxResults);

        if (error) {
            console.error("searchProducts failed:", error);
            return {
                success: false as const,
                error: `Error al buscar productos. Por favor, intente nuevamente más tarde.`,
            };
        }

        if (!data || data.length === 0) {
            return {
                success: false as const,
                error: `No se encontraron productos que coincidan con la búsqueda.`,
            };
        }

        return { success: true as const, data };
    },
}); 
