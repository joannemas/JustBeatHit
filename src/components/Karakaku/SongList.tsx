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
  const [premiumFilter, setPremiumFilter] = useState<"all" | "premium" | "free">("all");
  const [premiumCount, setPremiumCount] = useState(0);
  const [freeCount, setFreeCount] = useState(0);

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

  useEffect(() => {
    const fetchSongs = async () => {
      let query = supabase.from("song").select("*");

      if (search) {
        query = query.ilike("title", `%${search}%`);
      }

      if (selectedStyles.length > 0) {
        query = query.contains("music_style", selectedStyles.map((s) => s.toLowerCase()));
      }

      if (premiumFilter === "premium") {
        query = query.eq("is_premium", true);
      } else if (premiumFilter === "free") {
        query = query.eq("is_premium", false);
      }

      const { data, error } = await query;
      if (!error) {
        setSongs(data || []);
        if (data?.length && onSelectSong) {
          onSelectSong(data[0]);
        }
      }

      // ✅ En parallèle : fetch counts
      const [premium, free] = await Promise.all([
        supabase.from("song").select("*", { count: "exact", head: true }).eq("is_premium", true),
        supabase.from("song").select("*", { count: "exact", head: true }).eq("is_premium", false),
      ]);

      if (!premium.error) setPremiumCount(premium.count || 0);
      if (!free.error) setFreeCount(free.count || 0);
    };

    fetchSongs();
  }, [search, selectedStyles, premiumFilter]);



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

        <div className={styles.premiumFilterButtons}>
          <button
              className={`${styles.filterButton} ${premiumFilter === "all" ? styles.active : ""}`}
              onClick={() => setPremiumFilter("all")}
          >
            Tous
            <span className={styles.premiumFilterCount}>{premiumCount + freeCount}</span>
          </button>
          <button
              className={`${styles.filterButton} ${premiumFilter === "premium" ? styles.active : ""}`}
              onClick={() => setPremiumFilter("premium")}
          >
            Musiques Premium
            <span className={styles.premiumFilterCount}>{premiumCount}</span>
          </button>
          <button
              className={`${styles.filterButton} ${premiumFilter === "free" ? styles.active : ""}`}
              onClick={() => setPremiumFilter("free")}
          >
            Musiques Gratuites
            <span className={styles.premiumFilterCount}>{freeCount}</span>
          </button>
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
