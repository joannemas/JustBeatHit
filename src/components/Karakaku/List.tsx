import React from "react";

import { createClient } from "@/lib/supabase/server";
import styles from "@/stylesheets/songList.module.scss";
import SongCard from "./SongCard";
import Navbar from "../Navbar";

export default async function SongList({ gameId }: { gameId?: string }) {
    const supabase = createClient();
    const { data, error } = await supabase.from("song").select("*");

    return (
        <div className={styles.songGrid}>
            <Navbar />
            {data?.map((song) => (
                <SongCard key={song.id} gameId={gameId} song={song} />
            ))}
        </div>
    );
};
