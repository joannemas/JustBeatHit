import { normalizeString } from './lyricsDisplayUtils';
import { calculateScore } from './scoreUtils';
import React from "react";

//Bloque le copié collé
export const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
};

//Actions liées à la saisie utilisateur
export const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    lyrics: { text: string }[],
    currentLyricIndex: number,
    userInput: string,
    lockedChars: string,
    setUserInput: (input: string) => void,
    setLockedChars: (chars: string) => void,
    setScore: (score: (prevScore: number) => number) => void,
    setLastScoreChange: (score: number) => void,
    setIncorrectCharacters: (count: (prevCount: number) => number) => void,
    setHasErrors: (hasError: boolean) => void,
    setIsValidated: (validated: boolean) => void,
    setTotalCharacters: (total: (prevTotal: number) => number) => void,
    audioPlayerRef: React.RefObject<any>,
    setIsStarted: (started: boolean) => void,
    setStartTime: (time: number) => void,
    setEndTime: (time: number) => void,
    isStarted: boolean,
    hasErrors: boolean,
) => {
    let inputValue = e.target.value;

    if (!lyrics[currentLyricIndex]) return;

    const currentLyric = lyrics[currentLyricIndex].text;
    const specialChars = [' ', '.', ',', '!', '?', ';', ':', '-', '(', ')', '"', "'", "+", "*", "/", '='];
    //Booléen pour empêcher le changement de score si un caractère spécial est utilisé
    let usedSpecialChar = false;

    // Blocage des caractères spéciaux dans l'input
    const lastCharTyped = inputValue[inputValue.length - 1];
    if (specialChars.includes(lastCharTyped)) {
        // Empêcher l'ajout de caractères spéciaux
        inputValue = inputValue.slice(0, -1);
        usedSpecialChar = true;
    } else {
        usedSpecialChar = false;
    }

    // Cas où l'utilisateur tente d'effacer un caractère validé
    if (inputValue.length < lockedChars.length) {
        // Empêcher l'effacement des caractères validés
        setUserInput(lockedChars);
        return;
    }

    // Permettre l'effacement uniquement des erreurs (caractères non validés)
    if (inputValue.length < userInput.length && inputValue.length >= lockedChars.length) {
        setUserInput(inputValue);  // Mettre à jour avec les erreurs corrigées
        return;
    }

    // Remplacer 'oe' par 'œ'
    if (currentLyric[inputValue.length - 2] === 'œ' && inputValue.endsWith('oe')) {
        inputValue = inputValue.slice(0, -2) + 'œ';
    }

    let userInputUpdated = inputValue;

    // Bloque les caractères corrects
    if (inputValue.length < userInput.length) {
        if (inputValue.length < lockedChars.length) {
            setUserInput(lockedChars);
            return;
        } else {
            setUserInput(inputValue);
            return;
        }
    }

    while (specialChars.includes(currentLyric[userInputUpdated.length])) {
        userInputUpdated += currentLyric[userInputUpdated.length];
    }

    // Empêcher de taper plus que la longueur de la lyric
    if (userInputUpdated.length > currentLyric.length) {
        userInputUpdated = userInputUpdated.slice(0, currentLyric.length);
        usedSpecialChar = true;
    }

    const correctPortion = currentLyric.slice(0, userInputUpdated.length);
    const userTypedPortion = userInputUpdated.slice(0, correctPortion.length);

    if (normalizeString(userTypedPortion) === normalizeString(correctPortion)) {
        setLockedChars(userInputUpdated);
        const points = 100;
        if (!usedSpecialChar) {
            setScore(prevScore => {
                const newScore = prevScore + points;
                setLastScoreChange(points);
                return newScore;
            });
        }
    } else {
        const points = -200;
        if (!usedSpecialChar) {
            setScore(prevScore => {
                const newScore = Math.max(prevScore + points, 0);
                setLastScoreChange(points);
                return newScore;
            });
        }
        setIncorrectCharacters(prev => prev + 1);
        setHasErrors(true);
    }

    setUserInput(userInputUpdated);

    if (normalizeString(userInputUpdated.trim()) === normalizeString(currentLyric.trim())) {
        setIsValidated(true);
        if (!hasErrors) {
            const points = 500;
            setScore(prevScore => calculateScore(prevScore, points));
            setLastScoreChange(points);
        }

        const alphabeticCharacters = userInputUpdated.match(/[a-zA-Z]/g);
        if (alphabeticCharacters) {
            setTotalCharacters(prev => prev + alphabeticCharacters.length);
        }

        if (currentLyricIndex === lyrics.length - 1) {
            setEndTime(Date.now());
        } else if (audioPlayerRef.current?.audioEl.current && audioPlayerRef.current.audioEl.current.paused) {
            audioPlayerRef.current.audioEl.current.play();
        }
    }

    if (!isStarted && audioPlayerRef.current?.audioEl.current?.paused) {
        audioPlayerRef.current.audioEl.current.play();
        setIsStarted(true);
        setStartTime(Date.now());
    }
};