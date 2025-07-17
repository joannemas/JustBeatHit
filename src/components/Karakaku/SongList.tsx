"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import SongCard from "./SongCard";
import styles from "@/stylesheets/songList.module.scss";
import Link from "next/link";

export default function SongList({
  gameId,
  onSelectSong,
}: {
  gameId?: string;
  onSelectSong?: (song: any) => void;
}) {
  const [songs, setSongs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const allStyles = ["Pop", "Rock", "Rap", "Jazz", "Electro"];

  useEffect(() => {
    const fetchSongs = async () => {
      let query = supabase.from("song").select("*");

      if (search) {
        query = query.ilike("title", `%${search}%`);
      }

      if (selectedStyles.length > 0) {
        query = query.contains("music_style", selectedStyles.map((s) => s.toLowerCase()));
      }

      const { data, error } = await query;
      if (!error) {
        setSongs(data || []);
        if (data?.length && onSelectSong) {
          onSelectSong(data[0]); // sélectionne automatiquement la première
        }
      }
    };

    fetchSongs();
  }, [search, selectedStyles]);

  const toggleStyle = (style: string) => {
    const lower = style.toLowerCase();
    setSelectedStyles((prev) =>
      prev.includes(lower) ? prev.filter((s) => s !== lower) : [...prev, lower]
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
        <Link href="/upload-song" className={styles.addButton}>+ AJOUTER UNE MUSIQUE</Link>
      </div>

      {/* Filtres */}
      <div className={styles.filterContainer}>
        <div className={styles.dropdownWrapper}>
          <button
            className={styles.dropdownButton}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            AJOUTER UN FILTRE <span className={styles.plus}>+</span>
          </button>

          {showDropdown && (
            <div className={styles.dropdownMenu}>
              {allStyles.map((style) => (
                <div
                  key={style}
                  className={styles.dropdownItem}
                  onClick={() => toggleStyle(style)}
                >
                  {style}
                </div>
              ))}
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
          <SongCard
            key={song.id}
            song={song}
            gameId={gameId}
            onSelect={() => onSelectSong?.(song)}
          />
        ))}
      </div>
    </div>
  );
}
