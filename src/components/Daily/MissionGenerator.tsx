import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchSongs() {
  const { data, error } = await supabase
    .from("song")
    .select("title");
  if (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
  return data.map((song: { title: string }) => song.title);
}

export async function generateDailyMissions() {
  const today = new Date().toISOString().slice(0, 10);
  const SONGS = await fetchSongs();
  const randomSong = SONGS.length > 0
    ? SONGS[Math.floor(Math.random() * SONGS.length)]
    : "Unknown Song";
  return [
    { id: "play-song", text: `Play "${randomSong}"`, song: randomSong },
    { id: "get-score", text: "Get a score above 5000", score: 5000 },
    { id: "extreme-mode", text: "Try Extreme Mode", mode: "extreme" },
  ];
}

export async function getDailyMissions() {
  const today = new Date().toISOString().slice(0, 10);
  const stored = localStorage.getItem("daily-missions");
  if (stored) {
    const { date, missions } = JSON.parse(stored);
    if (date === today) return missions;
  }
  const missions = await generateDailyMissions();
  localStorage.setItem("daily-missions", JSON.stringify({ date: today, missions }));
  return missions;
}