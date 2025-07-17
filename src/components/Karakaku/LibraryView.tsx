"use client";

import React, { useState } from "react";
import SongList from "./SongList";
import SongDetailsPanel from "./SongDetailsPanel";
import styles from "@/stylesheets/libraryView.module.scss";

export default function LibraryView({ gameId }: { gameId?: string }) {
  const [selectedSong, setSelectedSong] = useState<any | null>(null);

  return (
    <div className={styles.mainRow}>
      <div className={styles.leftColumn}>
        <h1 className={styles.title}>BIBLIOTHÈQUE</h1>
        <SongList gameId={gameId} onSelectSong={setSelectedSong} />
      </div>
      <div className={styles.rightColumn}>
        <SongDetailsPanel  gameId={gameId} song={selectedSong} />
      </div>
    </div>
  );
}
