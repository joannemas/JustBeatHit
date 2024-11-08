'use client';

import React from 'react';
import Link from 'next/link';
import '../../../stylesheets/karakaku.scss';

const List: React.FC = () => {
    const songs = [
        { name: 'Michael_Jackson-Beat_It', title: "Michael Jackson - Beat It" },
        { name: 'Whitney_Houston-I_Have_Nothing', title: "Whitney Houston - I Have Nothing" },
        { name: 'Sabrina_Carpenter-Espresso', title: "Sabrina Carpenter - Espresso" },
        { name: 'Sabrina_Carpenter-Dont_Smile', title: "Sabrina Carpenter - Don't Smile" },
        { name: 'd4vd-Feel_It', title: "d4vd - Feel It" },
        { name: 'Amel_Bent-Ma_Philosophie', title: "Amel Bent - Ma Philosophie" },
        { name: 'Renaud-Mistral_Gagnant', title: "Renaud - Mistral Gagnant" },
        { name: 'Charles_Aznavour-Emmenez-moi', title: "Charles Aznavour - Emmenez-moi" },
    ];

    return (
        <div>
            <h1>Karakaku</h1>
            <p>Sélectionnez votre musique : </p>
            <ul className='song-list'>
                {songs.map((song) => (
                <li key={song.name}>
                    <Link href={`/karakaku/${song.name}`}>
                        {song.title}
                    </Link>
                </li>
                
                ))}
            </ul>
        </div>
    );
};

export default List;
