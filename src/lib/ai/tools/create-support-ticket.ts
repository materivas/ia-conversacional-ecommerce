import { tool } from "ai";
import { createSupportTicketSchema } from "@/lib/types/tools";
import { supabaseAdmin } from "@/lib/supabase/server";

export const createSupportTicket = tool({
    description: "Crea un ticket de soporte para un usuario específico.",
    inputSchema: createSupportTicketSchema,
    execute: async ({ subject, description, priority, userId }) => {
        const { data, error } = await supabaseAdmin
            .from("support_tickets")
            .insert({
                subject,
                description,
                priority,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error("createSupportTicket failed:", error);
            return {
                success: false as const,
                error: `No se pudo crear el ticket de soporte. Por favor, intente nuevamente más tarde.`,
            };
        }

        return { success: true as const, data };
    },
})
