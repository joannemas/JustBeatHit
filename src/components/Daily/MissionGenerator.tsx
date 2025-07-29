import { SupabaseClient } from "@supabase/supabase-js";

// Fetch all song titles from the "song" table
export async function fetchSongs(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("song").select("title");
  if (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
  return data.map((song: { title: string }) => song.title);
}

// Generate daily missions as one mission object per type, for direct insertion
export async function generateDailyMissions(supabase: SupabaseClient, userId: string, date: string) {
  const SONGS = await fetchSongs(supabase);
  const randomSong = SONGS.length > 0 ? SONGS[Math.floor(Math.random() * SONGS.length)] : "Unknown Song";

  // Each mission is a row, not an array
  const missions = [
    {
      user_id: userId,
      date,
      type: "song",
      song: randomSong,
      completed: false,
      text: `Essayer la chanson "${randomSong}"`,
    },
    {
      user_id: userId,
      date,
      type: "score",
      score: 5000,
      completed: false,
      text: "Avoir un score au dessus de 5000",
    },
    {
      user_id: userId,
      date,
      type: "mode",
      mode: "extreme",
      completed: false,
      text: "Essayer le mode extrême",
    },
  ];

  // Directly insert all missions as rows
  const { error } = await supabase.from("daily_missions").insert(missions);
  if (error) {
    console.error("Error inserting daily missions:", error);
  }
  return missions;
}