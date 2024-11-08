interface Lyric {
    text: string;
}

//Calcule les mots par minute
export const calculateWPM = (startTime: number, endTime: number, lyrics: Lyric[]): number => {
    if (!startTime || !endTime || endTime <= startTime) {
        return 0;
    }

    const elapsedTimeInSeconds = (endTime - startTime) / 1000;
    const words = lyrics.reduce((acc, lyric) => acc + lyric.text.split(' ').length, 0);
    const wpm = (words / elapsedTimeInSeconds) * 60;
    return Math.round(wpm);
};

//Calcule la précision d'écriture
export const calculateAccuracy = (totalCharacters: number, incorrectCharacters: number): number => {
    if (!totalCharacters || totalCharacters === 0) {
        return 0;
    }
    const accuracy = ((totalCharacters - incorrectCharacters) / totalCharacters) * 100;
    return Math.round(accuracy);
};

//Calcule le score
export const calculateScore = (prevScore: number, points: number): number => {
    return Math.max(prevScore + points, 0);
};

//Calcule le nombre de pauses
export const calculatePauseCount = (pauseCount: number): number => {
    return pauseCount + 1;
};