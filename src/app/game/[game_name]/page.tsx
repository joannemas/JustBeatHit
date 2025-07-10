import React from "react"
import SongList from "@/components/Karakaku/SongList";
import styles from "@/stylesheets/songList.module.scss";
import { CircleArrowLeft } from "lucide-react";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { Database } from "~/database.types";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";

const GAME_NAMES: Database["public"]["Enums"]["game_name"][] = ["karakaku"];

export default async function Page({ params: { game_name } }: { params: { game_name: Database["public"]["Enums"]["game_name"] } }) {
    if (!GAME_NAMES.includes(game_name as Database["public"]["Enums"]["game_name"])) {
        return notFound()// If the user chooses a game that does not exist, then return 404
    }
    const supabaseAdmin = createAdminClient();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabaseAdmin.from("games").insert([{ game_name, user_id: user?.id! }]).select();

    
    /** If user choose karakaku, then display song list */
    if (game_name === "karakaku") {
        return (
            <>
                <Navbar/>
                <div className={styles.container}>
                    <div className={styles.titleContainer}>
                        <a href="/" className={styles.backBtn}>
                            <CircleArrowLeft size={52} color="#f59e0b"/>
                        </a>
                        <h1 className={styles.title}>BIBLIOTHÈQUE</h1>
                    </div>
                    <SongList gameId={data ? data[0].id : undefined}/>
                    {/* console */}
                </div>
            </>
        );
    }
}
