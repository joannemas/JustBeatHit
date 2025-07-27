"use client";

import React, { useState } from "react";
import SongList from "./SongList";
import SongDetailsPanel from "./SongDetailsPanel";
import styles from "@/stylesheets/libraryView.module.scss";
import { LocalSong } from "@/lib/dexie/types";
import { Database } from "~/database.types";

export default function LibraryView({ gameId }: { gameId?: string }) {
  const [selectedSong, setSelectedSong] = useState<Database["public"]["Tables"]["song"]["Row"] | LocalSong | null>(null);
  const [mortSubite, setMortSubite] = useState(false);

 return (
    <div className={styles.mainRow}>
      <div className={styles.leftColumn}>
        <h1 className={styles.title}>BIBLIOTHÈQUE</h1>
        <SongList gameId={gameId} onSelectSong={setSelectedSong} />
      </div>
      <div className={styles.rightColumn}>
        {selectedSong && (
          <SongDetailsPanel
            gameId={gameId}
            song={selectedSong}
            mortSubite={mortSubite}
            setMortSubite={setMortSubite}
          />
        )}
      </div>
    </div>
  );
}