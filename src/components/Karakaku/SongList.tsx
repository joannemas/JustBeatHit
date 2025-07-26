"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import SongCard from "./SongCard";
import styles from "@/stylesheets/songList.module.scss";
import Link from "next/link";
import { useRef } from "react";
import { listLocalSongs } from "@/lib/dexie/listLocalSongs";
import { Database } from "~/database.types";
import { LocalSong } from "@/lib/dexie/types";
import useClaims from "@/lib/hooks/useClaims";

export default function SongList({
  gameId,
  onSelectSong,
}: {
  gameId?: string;
  onSelectSong?: (song: any) => void;
}) {
  const {userClaims: {role, plan}} = useClaims()

  const [songs, setSongs] = useState<Database["public"]["Tables"]["song"]["Row"][] | LocalSong[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [premiumFilter, setPremiumFilter] = useState<"all" | "premium" | "free" | "local">("all");
  const [premiumCount, setPremiumCount] = useState(0);
  const [freeCount, setFreeCount] = useState(0);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false); // État pour la popup

  const allStyles = ['Pop', 'Rock', 'Electro', 'Hip-Hop', 'Jazz', 'R&B', 'Chill', 'Funk', 'K-pop', 'J-pop', 'Reggae', 'Classique', 'Indie', 'Metal', 'Country', 'Blues', 'Latin', 'Folk', 'Soul', 'Punk', 'Disco', 'House', 'Techno', 'Trance', 'Dubstep', 'Ambient', 'Experimental', 'World Music', 'Gospel', 'Opera', 'Ska', 'Grunge', 'Synthwave', 'Lo-fi', 'Acoustic', 'Alternative', 'New Wave', 'Progressive', 'Post-Rock', 'Post-Punk', 'Emo', 'Ska Punk', 'Math Rock', 'Garage Rock', 'Surf Rock', 'Shoegaze', 'Dream Pop', 'Chiptune', 'Funk Rock', 'Nu Metal', 'Metalcore', 'Death Metal', 'Black Metal', 'Thrash Metal', 'Power Metal', 'Symphonic Metal', 'Industrial Metal', 'Glam Rock', 'Hard Rock', 'Southern Rock', 'Bluegrass', 'Celtic', 'Bossa Nova', 'Samba', 'Flamenco', 'Tango', 'Bollywood', 'Afrobeats', 'Highlife', 'Kizomba', 'Salsa', 'Merengue', 'Cumbia', 'Reggaeton', 'Dancehall', 'Trap', 'Grime', 'Drill'];
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      let query = supabase.from("song").select("*");

      if (role !== "admin") {
        query = query.neq("status", "Draft");
      }

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
      if(premiumFilter === "local"){
        const songs = await listLocalSongs()
        console.debug("songs", songs)
        if (songs?.length && onSelectSong) {
          onSelectSong(songs[0]);
        }
        setSongs(songs)
        return
      }
      let query = supabase.from("song").select("*");

      if (role !== "admin") {
        query = query.neq("status", "Draft");
      }

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

      // Compteurs pour premium et free avec filtre status pour non-admins
      let premiumQuery = supabase.from("song").select("*", { count: "exact", head: true }).eq("is_premium", true);
      let freeQuery = supabase.from("song").select("*", { count: "exact", head: true }).eq("is_premium", false);

      if (role !== "admin") {
        premiumQuery = premiumQuery.neq("status", "Draft");
        freeQuery = freeQuery.neq("status", "Draft");
      }

      const [premium, free] = await Promise.all([premiumQuery, freeQuery]);

      if (!premium.error) setPremiumCount(premium.count || 0);
      if (!free.error) setFreeCount(free.count || 0);
    };

    fetchSongs();
  }, [search, selectedStyles, premiumFilter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPremiumPopup(false);
      }
    };

    if (showDropdown || showPremiumPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown, showPremiumPopup]);

  const toggleStyle = (style: string) => {
    const lower = style.toLowerCase();
    setSelectedStyles((prev) =>
      prev.includes(lower) ? prev.filter((s) => s !== lower) : [...prev, lower]
    );
  };

  const removeStyle = (style: string) => {
    setSelectedStyles((prev) => prev.filter((s) => s !== style));
  };

  const handleAddSongClick = () => {
    if (role !== "admin" && plan !== "Premium") {
      setShowPremiumPopup(true);
    } else {
      window.location.href = "/upload-song"; // Redirection manuelle
    }
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
          <button className={styles.addButton} onClick={handleAddSongClick}>+ AJOUTER UNE MUSIQUE</button>
        </div>

        {/* Popup pour utilisateurs non premium */}
        {showPremiumPopup && (
            <div className={styles.premiumPopup}>
              <div className={styles.premiumPopupContent} ref={popupRef}>
                <button
                    className={styles.closeIcon}
                    onClick={() => setShowPremiumPopup(false)}
                    aria-label="Fermer la popup"
                >
                  ✕
                </button>
                <h2>Fonctionnalité réservée aux utilisateurs Premium</h2>
                <p>
                  L&apos;ajout de musiques est une fonctionnalité exclusive pour les utilisateurs ayant un abonnement Premium.
                  Souscrivez à un abonnement pour débloquer cette fonctionnalité et bien plus encore !
                </p>
                <div className={styles.premiumPopupButtons}>
                  <Link href="/options/subscription" className={styles.subscribeButton}>
                    Voir les abonnements
                  </Link>
                  <button
                      className={styles.closeButton}
                      onClick={() => setShowPremiumPopup(false)}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Filtres */}
        <div className={styles.filterContainer}>
          <div className={styles.dropdownWrapper} ref={dropdownRef}>
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
          <button
              className={`${styles.filterButton} ${premiumFilter === "local" ? styles.active : ""}`}
              onClick={() => setPremiumFilter("local")}
          >
            Musiques Personnalisées
          </button>
        </div>


        {/* Liste des chansons */}
        <div className={styles.songGrid}>
          {songs.map((song) => (
              <SongCard
                  key={song.id}
                  song={song}
                  gameId={gameId}
                  coverUrl={"coverFile" in song ? URL.createObjectURL(song.coverFile) : `https://fyuftckbjismoywarotn.supabase.co/storage/v1/object/public/song/${encodeURIComponent(`${song.singer} - ${song.title.replace(/'/g, "")}`)}/cover.jpg`}
                  onSelect={() => onSelectSong?.(song)}
              />
          ))}
        </div>
      </div>
  );
}
