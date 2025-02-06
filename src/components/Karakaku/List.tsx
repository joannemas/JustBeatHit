import React from 'react';
import Link from 'next/link';
import '@/stylesheets/songList.scss';

import { createClient } from '@/lib/supabase/server';

export default async function SongList() {
    const supabase = createClient();
    const { data, error } = await supabase.from('song').select('*');

    return (
        <div className="container">
            <div className="title-container">
                <h1 className="title">KARAKAKU</h1>
            </div>
            <p className="subtitle">Sélectionnez votre musique</p>

            <div className="song-grid">
                {data?.map((song) => (
                    <Link key={song.id} href={`/karakaku/${song.id}`} className="song-card">
                        <div className="song-content">
                            <div className="inner-disk"></div>
                            <div className="song-content-text">
                                <h2 className="song-title">{song.title}</h2>
                                <p className="song-singer">{song.singer}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};
