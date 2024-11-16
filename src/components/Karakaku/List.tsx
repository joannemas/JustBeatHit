
import React from 'react';
import Link from 'next/link';
import '@/stylesheets/karakaku.scss';
import { createClient } from '@/lib/supabase/server';

export default async function SongList(){
    const supabase = createClient()
    const { data, error } = await supabase.from('song').select('*')

    return (
        <div>
            <h1>Karakaku</h1>
            <p>Sélectionnez votre musique : </p>
            <ul className='song-list'>
                {data?.map((song) => (
                    <li key={song.id}>
                        <Link href={`/karakaku/${song.id}`}>
                            {`${song.title} - ${song.singer}`}
                        </Link>
                    </li>

                ))}
            </ul>
        </div>
    );
};