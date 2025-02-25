import Karakaku from "@/components/Karakaku/Karakaku";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from 'react'

export default async function page({ params: { game_name, game_id } }: { params: { game_name: string, game_id: string } }) {
  const supabase = createAdminClient()
  const { data } = await supabase.from('games').select().eq('id', game_id).single()

  if (!data?.song_id) {
    redirect(`/game/${game_name}/${game_id}`)
  }

  const { data: { ...song }, error } = await supabase.from('song').select('*').eq('id', data.song_id).single()
  const songPromises = [
    supabase.storage.from('song').createSignedUrl(`${song.singer} - ${song.title.replaceAll("'", '')}/lyrics.lrc`, 60 * 5),
    supabase.storage.from('song').createSignedUrl(`${song.singer} - ${song.title.replaceAll("'", '')}/song.mp3`, 60 * 5),
  ]
  const [lyricsURL, songURL] = await Promise.all(songPromises)

  // console.debug(lyricsURL, songURL, `${song.singer} - ${song.title.replaceAll('\'','')}/lyrics.lrc`)

  if (!song || !lyricsURL.data || !songURL.data) {
    return <div>Loading...</div>;
  }

  return <Karakaku songSrc={songURL.data.signedUrl} lyricSrc={lyricsURL.data?.signedUrl} title={song.title} singer={song.singer} />;
}
