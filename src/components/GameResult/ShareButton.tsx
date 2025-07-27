'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/stylesheets/gameend.module.scss';
import { usePathname } from 'next/navigation';

export default function ShareButton({ score }: { score?: number | null }) {
    const pathname = usePathname();
    const [showCopiedMessage, setShowCopiedMessage] = useState(false);

    async function handleShare() {
        // Copier l'URL dans le presse-papiers
        const message = `J'ai explosé le score avec ${score} points ! 😎 T'as le niveau pour me dépasser ? 🔥\n${window.location.origin + pathname}`;
        await navigator.clipboard.writeText(message);
        // Afficher le message
        setShowCopiedMessage(true);
    }

    // Faire disparaître le message après 3 secondes
    useEffect(() => {
        if (showCopiedMessage) {
            const timer = setTimeout(() => {
                setShowCopiedMessage(false);
            }, 3000); // 3 secondes
            return () => clearTimeout(timer); // Nettoyer le timer
        }
    }, [showCopiedMessage]);

    return (
        <div className={styles.shareButtonContainer}>
            <button className={styles.btnSecondary} onClick={handleShare}>
                Partager
            </button>
            {showCopiedMessage && (
                <span className={styles.copiedMessage}>Copié dans le presse-papiers</span>
            )}
        </div>
    );
}