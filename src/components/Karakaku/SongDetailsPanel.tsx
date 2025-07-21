"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import styles from "@/stylesheets/songDrawer.module.scss";
import { Database } from "~/database.types";
import { updateGameSong } from "@/app/game/actions";
import Link from "next/link";
import { ChevronDown, Plus, Star } from "lucide-react";
import Image from "next/image";

type Song = Database["public"]["Tables"]["song"]["Row"];
type BestScore = Database["public"]["Tables"]["best_score"]["Row"];
type Game = Database["public"]["Tables"]["games"]["Row"];

export default function SongDetailsPanel({ song, gameId }: { song: Database["public"]["Tables"]["song"]["Row"], gameId?: string }) {
    /** @todo - Add toaster on updateGame error */
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        updateGameSong(song.id, gameId);
    };
  const [bestScore, setBestScore] = useState<BestScore | null>(null);
  const [lastGame, setLastGame] = useState<Game | null>(null);

  
  useEffect(() => {
    const fetchStats = async () => {
      if (!song?.id) return;

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError || !profile) return;

      // Récupère le best score
      const { data: best, error: bestError } = await supabase
        .from("best_score")
        .select("*")
        .eq("user_id", user.id)
        .eq("song_id", song.id)
        .eq("game", "karakaku")
        .eq("game_id", profile.last_game_id)
        .single();

      if (!bestError) setBestScore(best);

      // Récupère la dernière game jouée
      const { data: lastGameData, error: gameError } = await supabase
        .from("games")
        .select("*")
        .eq("user_id", user.id)
        .eq("song_id", song.id)
        .eq("game_name", "karakaku")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!gameError) setLastGame(lastGameData);
    };

    fetchStats();
  }, [song]);

  if (!song) {
    return (
      <div className={styles.drawer}>
        <p>Selectionne une musique à gauche</p>
      </div>
    );
  }

  return (
    <div className={styles.drawer}>
      <img
        src={`https://fyuftckbjismoywarotn.supabase.co/storage/v1/object/public/song/${encodeURIComponent(`${song.singer} - ${song.title.replace(/'/g, "")}`)}/cover.jpg`}
        alt={song.title}
        className={styles.coverImage}
        />

      <h2 className={styles.songTitle}>{song.title}</h2>
      <p className={styles.songSinger}>{song.singer}</p>

      <div className={styles.tags}>
        <div
        className={`${styles.difficulty} ${
          styles[song.difficulty?.toLowerCase() || "unknown"]
        }`}
      >
        {song.difficulty}
      </div>
        {song.music_style?.map((style, index) => (
          <span key={index} className={styles.styleTag}>
            {style}
          </span>
        ))}
      </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Plus className={styles.icon} />
            <span>MODIFICATEURS</span>
          </div>

          <label className={styles.checkboxRow}>
            <input type="checkbox" />
            <span>Mort Subite</span>
          </label>
        </div>

      {bestScore && (
        <div className={styles.gameBlock}>
          <div className={styles.gameHeader}>
            <div className={styles.title}>
              <Star size={16} className={styles.icon} />
              <span>MEILLEUR SCORE</span>
            </div>
            <div className={styles.date}>
              {new Date(bestScore.created_at!).toLocaleDateString("fr-FR")}
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <div className={styles.label}>SCORE</div>
              <div className={styles.value}>{bestScore.score?.toLocaleString()}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.label}>FAUTES</div>
              <div className={styles.value}>
                {/* {bestScore.mistakes} / {bestScore.word_count} */}
              </div>
            </div>
            <div className={styles.stat}>
              <div className={styles.label}>VITESSE</div>
              {/* <div className={styles.value}>{bestScore.word_speed} MPM</div> */}
            </div>
          </div>
        </div>
      )}

      {lastGame && (
      <div className={styles.gameBlock}>
        <div className={styles.gameHeader}>
          <div className={styles.title}>
            <ChevronDown size={16} className={styles.icon} />
            <span>DERNIÈRE PARTIE</span>
          </div>
          <div className={styles.date}>
            {new Date(lastGame.created_at!).toLocaleDateString("fr-FR")}
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <div className={styles.label}>SCORE</div>
            <div className={styles.value}>{lastGame.score ? lastGame.score?.toLocaleString() : "-"}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.label}>FAUTES</div>
            <div className={styles.value}>
              {lastGame.mistakes ? lastGame.mistakes : "-"}
            </div>
          </div>
          <div className={styles.stat}>
            <div className={styles.label}>VITESSE</div>
            <div className={styles.value}>{lastGame.word_speed ? lastGame.word_speed + " MPM" : "-"}</div>
          </div>
        </div>
      </div>
    )}
        <Link
        key={song.id}
        href={`game/karakaku/${gameId}`}
        onClick={handleClick}
        className={styles.playButton}
      >
        <Image src="/assets/img/icon/arrow-right.svg" alt="arrow icon" width={25} height={25} aria-hidden="true"/>
        JOUER
      </Link>
    </div>
  );
}
