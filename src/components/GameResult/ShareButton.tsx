'use client'

import React from 'react'
import styles from '@/stylesheets/gameend.module.scss';
import { usePathname } from 'next/navigation';

export default function ShareButton({score}: {score?: number | null}) {
    const pathname = usePathname()

    async function handleShare(){
        // Copy the URL to clipboard
        const message = `J'ai explosé le score avec ${score} points ! 😎 T'as le niveau pour me dépasser ? 🔥\n${window.location.origin + pathname}`;
        await navigator.clipboard.writeText(message);
    }

    return (
        <button className={styles.btnSecondary} onClick={handleShare}>Partagé</button>
    )
}
