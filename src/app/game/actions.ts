'use server'

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from 'next/cache';
import { redirect } from "next/navigation";
import { Database } from "~/database.types";

export async function updateGameSong(songId: string, gameId?: string, ): Promise<{ success: boolean, message?: string } |void> {
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
        console.error("Erreur dans updateGameSong:", err);
        return { success: false, message: err instanceof Error ? err.message : "Une erreur inconnue s'est produite" };
    }
    redirect(`/game/${redirectData[0].game_name}/${redirectData[0].id}`);
}

export async function startGame(gameId?: string): Promise<{ success: boolean, message?: string } |void> {
    try {
        if (!gameId) {
            throw new Error("gameId is required");
        }

        const supabaseAdmin = createAdminClient();
        const { data, error } = await supabaseAdmin
            .from('games')
            .update({ status: "started", game_started_at: new Date().toISOString() })
            .eq('id', gameId)
            
        if (error) {
            throw new Error(`Erreur Supabase: ${error.message}`);
        }
        return { success: true };
    } catch (err) {
        console.error("Erreur dans startGame:", err);
        return { success: false, message: err instanceof Error ? err.message : "Une erreur inconnue s'est produite" };
    }
}

/** @todo - Remove optionnel gameId and gameName by returning 404 in case of game doesn't exist */
export async function endGame(stats: { score: number, mistakes: number, typing_accuracy: number, word_speed: number }, gameName?: string, gameId?: string): Promise<{ success: boolean, message?: string } |void> {
    let gameData: Database['public']['Tables']['games']['Row'] | undefined
    try {
        if (!gameId) {
            throw new Error("gameId is required");
        }

        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin
            .from('games')
            .update({ status: "finished", game_ended_at: new Date().toISOString(), ...stats })
            .eq('id', gameId)
            
        if (error) {
            throw new Error(`Erreur Supabase: ${error.message}`);
        }
    } catch (err) {
        console.error("Erreur dans endGame:", err);
        return { success: false, message: err instanceof Error ? err.message : "Une erreur inconnue s'est produite" };
    }
    revalidatePath(`/game/${gameName}/${gameId}`)
}

export async function replayGame(gameId: string): Promise<{ success: boolean, message?: string } |void> {
    let redirectData: Database["public"]["Tables"]["games"]["Row"][] | undefined
    try {
        const supabaseAdmin = createAdminClient();
        const supabase = createClient()
        //To get user id in case of the previousgame is shared to another user
        const {data: {user}} = await supabase.auth.getUser()
        const {data: {...previousGame}} = await supabaseAdmin.from('games').select().eq('id', gameId?? '').single()
        if(!previousGame){
            throw new Error("Game not found")
        }
        const { data, error } = await supabaseAdmin
            .from('games')
            .insert({ status: "configuring", song_id: previousGame.song_id, game_name: previousGame.game_name, user_id: user?.id?? previousGame.user_id })
            .select()
            
        if (error) {
            throw new Error(`Erreur Supabase: ${error.message}`);
        }
        redirectData = data;
    } catch (err) {
        console.error("Erreur dans replayGame:", err);
        return { success: false, message: err instanceof Error ? err.message : "Une erreur inconnue s'est produite" };
    }
    redirect(`/game/${redirectData[0].game_name}/${redirectData[0].id}`);
}