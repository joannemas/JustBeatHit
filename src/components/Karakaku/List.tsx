import React from 'react';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';

export default async function SongList() {
    const supabase = createClient();
    const { data, error } = await supabase.from('song').select('*');

    return (
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
    );
};
