import { useEffect, RefObject } from 'react';

interface UseCaretPositionProps {
    userInput: string;
    currentLyricIndex: number;
    lyrics: { text: string }[];
    charRefs: RefObject<(HTMLSpanElement | null)[][] | null>;
    caretRef: RefObject<HTMLDivElement>;
}

//Positionne le caret en fonction de la position de l'utilisateur dans les paroles
export const caretUtils = ({
                                     userInput,
                                     currentLyricIndex,
                                     lyrics,
                                     charRefs,
                                     caretRef
                                 }: UseCaretPositionProps) => {
    useEffect(() => {
        const updateCaretPosition = () => {
            if (!charRefs.current) return;

            const currentCharIndex = userInput.length;
            const charRef = charRefs.current[currentLyricIndex]?.[currentCharIndex];
            const currentLyric = lyrics[currentLyricIndex]?.text || '';

            if (currentCharIndex === currentLyric.length) {
                // Positionner le caret après la dernière lettre
                const lastCharRef = charRefs.current[currentLyricIndex]?.[currentCharIndex - 1];
                if (lastCharRef && caretRef.current) {
                    const rect = lastCharRef.getBoundingClientRect();
                    const parentRect = lastCharRef.parentElement?.getBoundingClientRect();
                    if (rect && parentRect) {
                        caretRef.current.style.left = `${rect.right - parentRect.left}px`;
                        caretRef.current.style.top = `${rect.top - parentRect.top}px`;
                    }
                }
            } else if (charRef && caretRef.current) {
                const rect = charRef.getBoundingClientRect();
                const parentRect = charRef.parentElement?.getBoundingClientRect();
                if (rect && parentRect) {
                    caretRef.current.style.left = `${rect.left - parentRect.left}px`;
                    caretRef.current.style.top = `${rect.top - parentRect.top}px`;
                }
            }
        };

        updateCaretPosition();
    }, [userInput, currentLyricIndex, lyrics, charRefs, caretRef]);
};