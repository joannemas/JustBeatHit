'use server'

import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Database } from "~/database.types";

export async function updateGame(songId: string, gameId?: string, ): Promise<{ success: boolean, message?: string } |void> {
    let redirectData: Database["public"]["Tables"]["games"]["Row"][] | undefined
    try {
        if (!gameId) {
            throw new Error("gameId is required");
        }

        const supabaseAdmin = createAdminClient();
        const { data, error } = await supabaseAdmin
            .from('games')
            .update({ song_id: songId })
            .eq('id', gameId)
            .select()
            
        if (error) {
            throw new Error(`Erreur Supabase: ${error.message}`);
        }
        redirectData = data;
    } catch (err) {
        console.error("Erreur dans updateGame:", err);
        return { success: false, message: err instanceof Error ? err.message : "Une erreur inconnue s'est produite" };
    }
    redirect(`/game/${redirectData[0].game_name}/${redirectData[0].id}`);
}