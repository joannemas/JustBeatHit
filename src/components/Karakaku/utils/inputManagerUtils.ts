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
    isValidated: boolean,
    setIsValidated: (validated: boolean) => void,
    completedInputs: { [key: number]: string },
    setCompletedInputs: (value: (((prevState: string[]) => string[]) | string[])) => void,
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

    // Stocker l'ancien état avant mise à jour
    const previousInput = userInput;
    const wasLineValidated = isValidated;

    // Cas où l'utilisateur tente d'effacer un caractère validé
    if (inputValue.length < lockedChars.length) {
        // Empêcher l'effacement des caractères validés
        setUserInput(lockedChars);
        return;
    }

    // Permettre l'effacement uniquement des erreurs (caractères non validés)
    if (inputValue.length < userInput.length && inputValue.length >= lockedChars.length) {
        setUserInput(inputValue);  // Mettre à jour avec les erreurs corrigées

        // Détection du caractère supprimé
        const removedChar = previousInput[previousInput.length - 1];
        const wasCorrect = normalizeString(removedChar) === normalizeString(currentLyric[previousInput.length - 1]);
        const isSpecialChar = specialChars.includes(removedChar);

        setScore(prevScore => {
            if (isSpecialChar) return prevScore;  // Ne change pas le score pour les caractères spéciaux
            if (prevScore === 0 && !wasCorrect) return prevScore;  // Empêche de récupérer des points si le score est 0

            let scoreChange = wasCorrect ? -100 : 200;  // Si correct -100, sinon +200

            // Si on efface le dernier caractère d'une ligne validée, retirer les points de fin de ligne
            if (wasLineValidated && inputValue.length === currentLyric.length - 1) {
                scoreChange -= hasErrors ? 500 : 1000;
                setIsValidated(false); // Désactiver la validation tant que l'utilisateur n'a pas retapé
            }

            const newScore = Math.max(prevScore + scoreChange, 0);
            setLastScoreChange(scoreChange);
            return newScore;
        });

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

    const lastTypedChar = userInputUpdated.slice(-1);
    const correctChar = currentLyric[userInputUpdated.length - 1];
    const correctPortion = currentLyric.slice(0, userInputUpdated.length);
    const userTypedPortion = userInputUpdated.slice(0, correctPortion.length);

    if (normalizeString(userTypedPortion) === normalizeString(correctPortion)) {
        setLockedChars(userInputUpdated);
    } else {
        setHasErrors(true);
    }

    if (normalizeString(lastTypedChar) === normalizeString(correctChar)) {
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
    }

    setUserInput(userInputUpdated);
    let userLyricSize = normalizeString(userInputUpdated.trim()).length;
    let lineLyricSize = normalizeString(currentLyric.trim()).length;

    if (userLyricSize === lineLyricSize) {
        setCompletedInputs(prev => ({ ...prev, [currentLyricIndex]: userInputUpdated }));
        setIsValidated(true);

        if (!completedInputs[currentLyricIndex]){
            const points = hasErrors ? 500 : 1000;
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

    // Vérification si la ligne est validée et si on efface puis retape le dernier caractère
    if (previousInput.length === lineLyricSize - 1 && completedInputs[currentLyricIndex]) {
        // On a effacé un caractère mais la ligne était validée, réactive les points
        const points = hasErrors ? 500 : 1000;
        setScore(prevScore => calculateScore(prevScore, points));
        setLastScoreChange(points);
    }

    if (!isStarted && audioPlayerRef.current?.audioEl.current?.paused) {
        audioPlayerRef.current.audioEl.current.play();
        setIsStarted(true);
        setStartTime(Date.now());
    }
};