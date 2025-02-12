import React from 'react';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import styles from '@/stylesheets/songList.module.scss';

export default async function SongList() {
    const supabase = createClient();
    const { data, error } = await supabase.from('song').select('*');

    return (
        <div className={styles.songGrid}>
            {data?.map((song) => (
                <Link key={song.id} href={`/karakaku/${song.id}`} className={styles.songCard}>
                    <div className={styles.songContent}>
                        <div className={styles.innerDisk}></div>
                        <div className={styles.songContentText}>
                            <h2 className={styles.songTitle}>{song.title}</h2>
                            <p className={styles.songSinger}>{song.singer}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};
