import Karakaku from "@/components/Karakaku/Karakaku";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from 'react'
import { replayGame } from "../../actions";
import GameResult from '@/components/GameResult/GameResult';
import { headers } from "next/headers";
import { Metadata } from 'next';
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";

export async function generateMetadata({ params: { game_name, game_id }, params }: { params: { game_name: string, game_id: string } }): Promise<Metadata | void> {
  const supabase = createClient()
  const { data } = await supabase.from('games').select().eq('id', game_id).single()
  const { data: song } = await supabase.from('song').select('*').eq('id', data?.song_id ?? '').single()

  const host = headers().get('x-forwarded-host')
  const protocol = headers().get('x-forwarded-proto')
  const isBot = headers().get('x-is-bot') === 'true'

  if (isBot) {
    return {
      title: `${song?.title} - ${song?.singer} | ${capitalizeFirstLetter(game_name)}`,
      description: `J'ai obtenu ${data?.score} points sur ${song?.title} de ${song?.singer}, essaye de faire mieux !`,
      openGraph: {
        title: `${song?.title} - ${song?.singer} | ${capitalizeFirstLetter(game_name)}`,
        description: `J'ai obtenu ${data?.score} points sur ${song?.title} de ${song?.singer}, essaye de faire mieux !`,
        url: `${protocol}://${host}/game/${game_name}/${game_id}`,
        // images: ['/some-specific-page-image.jpg', ...previousImages],
      },
    }
  }
}

export default async function page({ params: { game_name, game_id } }: { params: { game_name: string, game_id: string } }) {
  const headersList = headers()
  const isBot = headersList.get('x-is-bot') === 'true'

  if (isBot) {
    return (
      <div className="bot-friendly-version">
        <h1>Karakaku - Jeu de karaoké</h1>
        <p>Cette page affiche les résultats d&apos;une partie de karaoké.</p>
        <p>Inscrivez-vous pour jouer et partager vos scores !</p>
      </div>
    )
  }

  const supabase = createClient()
  const { data } = await supabase.from('games').select().eq('id', game_id).single()

  // If no game found, redirect to game page
  if (!data) {
    redirect(`/game/${game_name}`)
  }

  // If game is already started, that's mean user refresh the page, so create a new game and redirect to it
  if (data.status === 'started') {
    await replayGame(game_id)
  }

  // If no song found, redirect to songs page
  if (!data?.song_id) {
    redirect(`/game/${game_name}`)
  }

  if (data.status === 'finished') {
    return <GameResult gameId={game_id} />
  }

  const { data: { ...song }, error } = await supabase.from('song').select('*').eq('id', data?.song_id ?? '').single()
  const songPromises = [
    supabase.storage.from('song').createSignedUrl(`${song.singer} - ${song.title.replaceAll("'", '')}/lyrics.lrc`, 60 * 5),
    supabase.storage.from('song').createSignedUrl(`${song.singer} - ${song.title.replaceAll("'", '')}/song.mp3`, 60 * 5),
  ]
  const [lyricsURL, songURL] = await Promise.all(songPromises)

  console.debug(lyricsURL, songURL, `${song.singer} - ${song.title.replaceAll('\'', '')}/lyrics.lrc`)

  if (!song || !lyricsURL.data || !songURL.data) {
    return <div>Loading...</div>;
  }

  return <Karakaku songSrc={songURL.data.signedUrl} lyricSrc={lyricsURL.data?.signedUrl} title={song.title} singer={song.singer} gameId={game_id} gameName={game_name} />;
}
