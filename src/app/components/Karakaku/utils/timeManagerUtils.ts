import ReactAudioPlayer from "react-audio-player";
import React from "react";


//Joue ou stop l'audio
export const handlePlayPauseClick = (
    audioPlayerRef: React.RefObject<any>,
    setIsStarted: (started: boolean) => void
) => {
    const audioEl = audioPlayerRef.current?.audioEl.current;
    if (audioEl) {
        if (audioEl.paused) {
            audioEl.play();
            setIsStarted(true);
        } else {
            audioEl.pause();
        }
    }
};

//Actions liées à la durée de la chanson
export const handleTimeUpdate = (
    audioPlayerRef: React.RefObject<ReactAudioPlayer>,
    lyrics: any[],
    currentLyricIndex: number,
    isValidated: boolean,
    setUserInput: React.Dispatch<React.SetStateAction<string>>,
    setLockedChars: React.Dispatch<React.SetStateAction<string>>,
    setCurrentLyricIndex: React.Dispatch<React.SetStateAction<number>>,
    setIsValidated: React.Dispatch<React.SetStateAction<boolean>>,
    setHasErrors: React.Dispatch<React.SetStateAction<boolean>>,
    setPauseCount: React.Dispatch<React.SetStateAction<number>>,
    calculatePauseCount: (prevCount: number) => number,
    setScore: React.Dispatch<React.SetStateAction<number>>,
    setLastScoreChange: React.Dispatch<React.SetStateAction<number>>,
    setIsMusicFinished: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const audioEl = audioPlayerRef.current?.audioEl.current;
    if (audioEl) {
        const currentTime = audioEl.currentTime;
        const nextLyricTime = lyrics[currentLyricIndex + 1]?.time;

        if (nextLyricTime && currentTime >= nextLyricTime - 0.05) {
            if (!isValidated) {
                audioEl.pause();
                const points = -500;
                setPauseCount(prevCount => calculatePauseCount(prevCount));
                setScore(prevScore => {
                    const newScore = Math.max(prevScore + points, 0);
                    setLastScoreChange(points);
                    return newScore;
                });
            } else {
                setUserInput('');
                setLockedChars('');
                setCurrentLyricIndex(currentLyricIndex + 1);
                setIsValidated(false);
                setHasErrors(false);
            }
        }

        const handleAudioEnded = () => {
            setIsMusicFinished(true);
        };
        audioEl.addEventListener('ended', handleAudioEnded);

        return () => {
            audioEl.removeEventListener('ended', handleAudioEnded);
        };
    }
};