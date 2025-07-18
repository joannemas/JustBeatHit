"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import SongCard from "./SongCard";
import styles from "@/stylesheets/songList.module.scss";

export default function SongList({ gameId }: { gameId?: string }) {
  const [songs, setSongs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  const allStyles = ["Pop", "Rock", "Rap", "Jazz", "Electro"];
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchSongs = async () => {
      let query = supabase.from("song").select("*");

      if (search) {
        query = query.ilike("title", `%${search}%`);
      }

      if (selectedStyles.length > 0) {
        query = query.contains("music_style", selectedStyles); // attention : .contains fonctionne sur array
      }

      const { data, error } = await query;
      if (!error) setSongs(data || []);
    };

    fetchSongs();
  }, [search, selectedStyles]);

    const toggleStyle = (style: string) => {
    const lower = style.toLowerCase();
    setSelectedStyles((prev) =>
        prev.includes(lower)
        ? prev
        : [...prev, lower]
    );
    };

    const removeStyle = (style: string) => {
    setSelectedStyles((prev) => prev.filter((s) => s !== style));
    };

  return (
    <div>
      {/* Barre de recherche */}
        <div className={styles.searchBarWrapper}>
            <div className={styles.searchInputGroup}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                type="text"
                placeholder="RECHERCHER UNE MUSIQUE"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
                />
            </div>
            <button className={styles.addButton}>
                + AJOUTER UNE MUSIQUE
            </button>
        </div>


      {/* Filtres par style */}
      <div className={styles.filterContainer}>
      <div className={styles.dropdownWrapper}>
        <button
          className={styles.dropdownButton}
          onClick={() => setShowDropdown((prev) => !prev)}
        >
          AJOUTER UN FILTRE <span className={styles.plus}>+</span>
        </button>

        {showDropdown && (
          <div className={styles.dropdownMenu}>
            {allStyles.map((style) => {
              const lower = style.toLowerCase();
              return (
                <div
                  key={style}
                  className={styles.dropdownItem}
                  onClick={() => toggleStyle(style)}
                >
                  {style}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.selectedTags}>
        {selectedStyles.map((style) => (
          <div key={style} className={styles.filterTag}>
            <span>{style.toUpperCase()}</span>
            <button onClick={() => removeStyle(style)}>&times;</button>
          </div>
        ))}
      </div>
    </div>

    {/* Liste des chansons */}
    <div className={styles.songGrid}>
      {songs.map((song) => (
        <SongCard key={song.id} gameId={gameId} song={song} />
      ))}
    </div>
  </div>
  );
}
