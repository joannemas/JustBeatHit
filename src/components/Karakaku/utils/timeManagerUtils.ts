import ReactAudioPlayer from "react-audio-player";
import React from "react";

//Joue ou stop l'audio
export const handlePlayPauseClick = (
    audioPlayerRef: React.RefObject<any>,
    setIsStarted: (started: boolean) => void,
    setIsCountdownActive: (active: boolean) => void,
    setCountdown: (value: number) => void
) => {
    const audioEl = audioPlayerRef.current?.audioEl.current;
    if (audioEl) {
        if (audioEl.paused) {
            audioEl.play();
            setIsStarted(true);
            setIsCountdownActive(false);
            setCountdown(10);
        } else {
            audioEl.pause();
            setIsCountdownActive(true);
        }
    }
};

let isAlreadyOver = false; // Variable de contrôle
//Actions liées à la durée de la chanson
export const handleTimeUpdate = (
    audioPlayerRef: React.RefObject<ReactAudioPlayer>,
    lyrics: any[],
    currentLyricIndex: number,
    userInput: string,
    isValidated: boolean,
    IsMusicFinished: boolean,
    setUserInput: React.Dispatch<React.SetStateAction<string>>,
    setLockedChars: React.Dispatch<React.SetStateAction<string>>,
    setCurrentLyricIndex: React.Dispatch<React.SetStateAction<number>>,
    setIsValidated: React.Dispatch<React.SetStateAction<boolean>>,
    setHasErrors: React.Dispatch<React.SetStateAction<boolean>>,
    setPauseCount: React.Dispatch<React.SetStateAction<number>>,
    calculatePauseCount: (prevCount: number) => number,
    setScore: React.Dispatch<React.SetStateAction<number>>,
    setLastScoreChange: React.Dispatch<React.SetStateAction<number>>,
    setIsMusicFinished: React.Dispatch<React.SetStateAction<boolean>>,
    setIsCountdownActive: (active: boolean) => void
) => {
    const audioEl = audioPlayerRef.current?.audioEl.current;
    if (audioEl) {
        const currentTime = audioEl.currentTime;
        const nextLyricTime = lyrics[currentLyricIndex + 1]?.time;
        const currentLyric = lyrics[currentLyricIndex]?.text || "";

        if (currentLyricIndex === lyrics.length - 1) {
            const handleAudioEnded = () => {
                // if (isAlreadyOver) return; // Évite l'exécution multiple (en com parce que bug)
                isAlreadyOver = true;
                audioEl.pause();
                setIsMusicFinished(true);
                if (userInput.length !== currentLyric.length) {
                        // Démarrer le compte à rebours uniquement si ce n'est pas déjà fait
                        setIsCountdownActive(true);
                        const points = -500;
                        setScore(prevScore => {
                            const newScore = Math.max(prevScore + points, 0);
                            setLastScoreChange(points);
                            return newScore;
                        });
                } else {
                    setIsMusicFinished(true);
                    setIsCountdownActive(false);
                }
            };

            // Ajout de l'écouteur `ended`
            audioEl.addEventListener('ended', handleAudioEnded);

            // Nettoyage de l'écouteur
            return () => {
                audioEl.removeEventListener('ended', handleAudioEnded);
                isAlreadyOver = false;
            };
        } else if (nextLyricTime && currentTime >= nextLyricTime - 0.05) {
            // Logique normale pour les autres lyrics
            if (!isValidated) {
                audioEl.pause();
                setIsCountdownActive(true);
                const points = -500;
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
                setIsCountdownActive(false);
            }
        }
    }
    if (!audioEl) {
        console.error("audioEl non défini");
    }
};