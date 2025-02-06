import Karakaku from '@/components/Karakaku/Karakaku';
import { createClient } from '@/lib/supabase/server';

interface SongPageProps {
  params: { songId: string,  }
}

export default async function SongPage({ params }: SongPageProps){
  const { songId } = params

  const supabase = createClient()
  const { data: { ...song }, error } = await supabase.from('song').select('*').eq('id', songId).single()
  const songPromises = [
    supabase.storage.from('song').createSignedUrl(`${song.singer} - ${song.title.replaceAll("'",'')}/lyrics.lrc`, 60*5),
    supabase.storage.from('song').createSignedUrl(`${song.singer} - ${song.title.replaceAll("'",'')}/song.mp3`, 60*5),
  ]
  const [lyricsURL, songURL] = await Promise.all(songPromises)

  console.info(lyricsURL, songURL, `${song.singer} - ${song.title.replaceAll('\'','')}/lyrics.lrc`)

  if (!song || !lyricsURL.data || !songURL.data) {
    return <div>Loading...</div>;
  }

  return <Karakaku songSrc={songURL.data.signedUrl} lyricSrc={lyricsURL.data?.signedUrl} />;
};