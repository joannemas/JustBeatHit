"use client"

import Link from "next/link";
import styles from "@/stylesheets/songList.module.scss";
import { updateGameSong } from "@/app/game/actions";
import { Database } from "~/database.types";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function SongCard({ song, gameId }: { song: Database["public"]["Tables"]["song"]["Row"], gameId?: string }) {
    const [image, setImage] = useState<string>("https://plus.unsplash.com/premium_photo-1682096297493-96a4ac18dd4d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0")

    /** @todo - Add toaster on updateGame error */
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        updateGameSong(song.id, gameId);
    };

    useEffect(()=>{
        const fetchImage = async () => {
            const image = supabase.storage.from('song').getPublicUrl(`${song.singer} - ${song.title.replaceAll("'", '')}/cover.jpg`).data.publicUrl
            console.debug(image)
            setImage(image)
        }
        fetchImage()
    }, [])

    return (
        <Link key={song.id} onClick={handleClick} href={`game/karakaku/${gameId}`} className={styles.songCard}>
            <div className={styles.imageBack}>
                <img
                src={image}
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
