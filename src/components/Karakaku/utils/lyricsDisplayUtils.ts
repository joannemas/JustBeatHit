import { RefObject, useEffect, useState } from 'react';
import { LyricLine } from '@/utils/LrcParser';
import { loadLRCFile } from '@/utils/LrcLoader';

// Enlève les segments entre parenthèses dans les lignes de paroles
const removeParentheses = (str: string): string => {
    return str.replace(/\(.*?\)/g, '').trim();
};

// Normalise les chaînes et remplace les "oe" par "œ" et supprime les accents
export const normalizeString = (str: string): string => {
    return str
        .replace(/oe/g, 'œ')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
};

// Récupère les lyrics à partir du fichier LRC
export const lyricsDisplayUtils = (
    songName: string,
    charRefs: RefObject<(HTMLSpanElement | null)[][]>,
    parseLRC: (content: string) => LyricLine[]
) => {
    const [lyrics, setLyrics] = useState<LyricLine[]>([]);
    const [totalLines, setTotalLines] = useState<number>(0);

    useEffect(() => {
        const loadLyrics = async () => {
            try {
                const lrcContent = await loadLRCFile(`/songs/${songName}/lyrics.lrc`);
                const parsedLyrics = parseLRC(lrcContent);
                const cleanedLyrics = parsedLyrics.map(lyric => ({
                    ...lyric,
                    text: removeParentheses(lyric.text),
                }));
                setLyrics(cleanedLyrics);
                setTotalLines(cleanedLyrics.length);

                // Initialise les références aux caractères lorsque les paroles changent
                // if (charRefs.current) {
                //     cleanedLyrics.forEach((_, index) => {
                //         if (!charRefs.current![index]) {
                //             charRefs.current![index] = [];
                //         }
                //     });
                // }
            } catch (error) {
                console.error('Failed to load LRC file:', error);
            }
        };

        loadLyrics();
    }, [songName, parseLRC, charRefs]);

    return { lyrics, totalLines };
};