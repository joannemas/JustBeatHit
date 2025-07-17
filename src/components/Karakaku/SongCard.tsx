"use client";

import React from "react";
import styles from "@/stylesheets/songList.module.scss";
import { Database } from "~/database.types";
import { Star, StarHalf } from "lucide-react";

export default function SongCard({
  song,
  gameId,
  onSelect,
}: {
  song: Database["public"]["Tables"]["song"]["Row"];
  gameId?: string;
  onSelect?: () => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSelect) {
      onSelect(); // 👉 déclenche affichage des détails
    }
  };

  return (
    <div onClick={handleClick} className={styles.songCard}>
      <div className={styles.imageBack}>
        <img
                src={`https://fyuftckbjismoywarotn.supabase.co/storage/v1/object/public/song/${encodeURIComponent(`${song.singer} - ${song.title.replace(/'/g, "")}`)}/cover.jpg`}
                alt={song.title}
              />
        <div className={styles.overlay}>
          {song.is_premium && (
            <div className={styles.premiumBadge}>
              <Star size={16} strokeWidth={2} color="white" />
              <span>PREMIUM</span>
            </div>
          )}


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
            <div
              className={`${styles.difficulty} ${styles[song.difficulty?.toLowerCase() || "unknown"]}`}
            >
              <p>{song.difficulty}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
