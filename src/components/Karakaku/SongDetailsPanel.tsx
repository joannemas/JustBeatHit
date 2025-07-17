"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import styles from "@/stylesheets/songDrawer.module.scss";
import { Database } from "~/database.types";

type Song = Database["public"]["Tables"]["song"]["Row"];
type BestScore = Database["public"]["Tables"]["best_score"]["Row"];
type Game = Database["public"]["Tables"]["games"]["Row"];

export default function SongDetailsPanel({ song }: { song: Song | null }) {
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
        src="https://plus.unsplash.com/premium_photo-1682096297493-96a4ac18dd4d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0"
        alt={song.title}
        className={styles.coverImage}
      />

      <h2 className={styles.songTitle}>{song.title}</h2>
      <p className={styles.songSinger}>{song.singer}</p>

      <div className={styles.tags}>
        {song.music_style?.map((style, index) => (
          <span key={index} className={styles.styleTag}>
            {style}
          </span>
        ))}
      </div>

      <div
        className={`${styles.difficulty} ${
          styles[song.difficulty?.toLowerCase() || "unknown"]
        }`}
      >
        {song.difficulty}
      </div>

      {bestScore && (
        <div className={styles.section}>
          <h3>MEILLEUR SCORE</h3>
          <p>{bestScore.score} points</p>
        </div>
      )}

      {lastGame && (
        <div className={styles.section}>
          <h3>DERNIÈRE PARTIE</h3>
          <ul>
            <li>Score : {lastGame.score}</li>
            <li>Erreurs : {lastGame.mistakes}</li>
            <li>Vitesse : {lastGame.word_speed} MPM</li>
            <li>Précision : {Math.round(lastGame.typing_accuracy ?? 0)}%</li>
          </ul>
        </div>
      )}

    <a
      href={`karakaku/${song.id}`}
      className={styles.playButton}
    >
      JOUER
    </a>
    </div>
  );
}
