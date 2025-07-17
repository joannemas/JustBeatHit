"use client"

import Link from "next/link";
import React from "react"
import styles from "@/stylesheets/songList.module.scss";
import { updateGameSong } from "@/app/game/actions";
import { Database } from "~/database.types";

export default function SongCard({ song, gameId }: { song: Database["public"]["Tables"]["song"]["Row"], gameId?: string }) {
    /** @todo - Add toaster on updateGame error */
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        updateGameSong(song.id, gameId);
    };

    return (
        <Link key={song.id} onClick={handleClick} href={`game/karakaku/${gameId}`} className={styles.songCard}>
            <div className={styles.imageBack}>
              <img
                src={`https://fyuftckbjismoywarotn.supabase.co/storage/v1/object/public/song/${encodeURIComponent(`${song.singer} - ${song.title.replace(/'/g, "")}`)}/cover.jpg`}
                alt={song.title}
              />
              <div className={styles.overlay}>
                <div className={styles.musicStyle}>
                  {song.music_style?.map((style, index) => (
                    <div key={index} className={styles.musicStyleItem}>
                      {style}
                    </div>
                  ))}
                </div>
                <div className={styles.songContentText}>
                  <div className={styles.SingerAndTitle}>
                    <h2 className={styles.songTitle}>{song.title}</h2>
                    <p className={styles.songSinger}>{song.singer}</p>
                  </div>
                  <div className={`${styles.difficulty} ${styles[song.difficulty?.toLowerCase() || 'unknown']}`}>
                    <p>{song.difficulty}</p>
                  </div>
                </div>
              </div>
            </div>
        </Link>
        )
}
