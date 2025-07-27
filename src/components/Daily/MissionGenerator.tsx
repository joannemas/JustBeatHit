import { SupabaseClient } from "@supabase/supabase-js";

export async function fetchSongs(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("song").select("title");
  if (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
  return data.map((song: { title: string }) => song.title);
}

export async function generateDailyMissions(supabase: SupabaseClient) {
  const SONGS = await fetchSongs(supabase);
  const randomSong =
    SONGS.length > 0 ? SONGS[Math.floor(Math.random() * SONGS.length)] : "Unknown Song";

  return [
    { id: "play-song", text: `Play "${randomSong}"`, song: randomSong },
    { id: "get-score", text: "Get a score above 5000", score: 5000 },
    { id: "extreme-mode", text: "Try Extreme Mode", mode: "extreme" },
  ];
}
