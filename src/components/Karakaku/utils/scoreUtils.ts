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
export const calculateAccuracy = (completedInputs: Record<number, string>, lyrics: Array<{ text: string }>): number => {
    let totalCorrect = 0;
    let totalCharacters = 0;

    console.log(completedInputs);
    console.log(lyrics);
    Object.keys(completedInputs).forEach(index => {
        const completedLine = completedInputs[Number(index)].toLowerCase();
        const lyricLine = lyrics[Number(index)].text.toLowerCase();

        const correctChars = completedLine.split('').filter((char, i) => char === lyricLine[i]).length;
        totalCorrect += correctChars;
        totalCharacters += lyricLine.length;
    });

    if (totalCharacters === 0) {
        return 0;
    }

    const accuracy = (totalCorrect / totalCharacters) * 100;
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