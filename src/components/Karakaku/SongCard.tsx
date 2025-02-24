"use client"

import Link from "next/link";
import React from "react"
import styles from "@/stylesheets/songList.module.scss";
import { updateGame } from "@/app/game/actions";
import { Database } from "~/database.types";

export default function SongCard({ song, gameId }: { song: Database["public"]["Tables"]["song"]["Row"], gameId?: string }) {
    /** @todo - Add toaster on updateGame error */
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        updateGame(song.id, gameId);
    };

    return (
        <Link key={song.id} onClick={handleClick} href={`game/karakaku/${gameId}`} className={styles.songCard}>
            <div className={styles.songContent}>
                <div className={styles.innerDisk}></div>
                <div className={styles.songContentText}>
                    <h2 className={styles.songTitle}>{song.title}</h2>
                    <p className={styles.songSinger}>{song.singer}</p>
                </div>
            </div>
        </Link>
    )
}
