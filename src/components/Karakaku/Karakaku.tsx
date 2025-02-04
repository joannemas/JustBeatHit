'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import {LyricLine, parseLRC} from '@/utils/LrcParser';
import '@/stylesheets/karakaku.scss';
import Link from 'next/link';

import { lyricsDisplayUtils, normalizeString } from './utils/lyricsDisplayUtils';
import { caretUtils } from "./utils/caretUtils";
import { calculateWPM, calculateAccuracy, calculatePauseCount } from './utils/scoreUtils';
import { handlePlayPauseClick, handleTimeUpdate } from "./utils/timeManagerUtils";
import { handleInputChange as handleInputChangeUtil, handlePaste } from './utils/inputManagerUtils';

interface KarakakuProps {
    songSrc: string;
    lyricSrc: string;
}

const Karakaku: React.FC<KarakakuProps> = ({ songSrc, lyricSrc }) => {
    const [currentLyricIndex, setCurrentLyricIndex] = useState<number>(0);
    const [userInput, setUserInput] = useState<string>('');
    const [isValidated, setIsValidated] = useState<boolean>(false);
    const [lockedChars, setLockedChars] = useState<string>('');
    const [isStarted, setIsStarted] = useState<boolean>(false);
    const audioPlayerRef = useRef<ReactAudioPlayer>(null);
    const charRefs = useRef<(HTMLSpanElement | null)[][]>([]);
    const caretRef = useRef<HTMLDivElement>(null);
    const [score, setScore] = useState<number>(0);
    const [lastScoreChange, setLastScoreChange] = useState<number>(0);
    const [hasErrors, setHasErrors] = useState<boolean>(false);
    const [pauseCount, setPauseCount] = useState<number>(0);
    const [startTime, setStartTime] = useState<number>(0);
    const [endTime, setEndTime] = useState<number>(0);
    const [incorrectCharacters, setIncorrectCharacters] = useState<number>(0);
    const [totalCharacters, setTotalCharacters] = useState<number>(0);
    const [isGameOver, setIsGameOver] = useState<boolean>(false);
    const [isMusicFinished, setIsMusicFinished] = useState<boolean>(false);
    const [lyrics, setLyrics] = useState<LyricLine[]>([]);
    const [totalLines, setTotalLines] = useState<number>(0);
    const [countdown, setCountdown] = useState<number>(10);
    const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false);
    const [completedInputs, setCompletedInputs] = useState<string[]>([]);

    useEffect(() => {
        lyricsDisplayUtils(lyricSrc, charRefs, parseLRC, setLyrics, setTotalLines)
    }, [lyricSrc, charRefs]);

    //Appel de fonction pour placer le caret
    useEffect(() => {
        caretUtils({
            userInput,
            currentLyricIndex,
            lyrics,
            charRefs,
            caretRef
        });
    }, [userInput, currentLyricIndex, lyrics, charRefs, caretRef]);

    //Appel de fonction pour gérer les actions liées au temps/durée de la chanson
    const handleTimeUpdateWrapper = () => {
        handleTimeUpdate(
            audioPlayerRef,
            lyrics,
            currentLyricIndex,
            userInput,
            isValidated,
            isMusicFinished,
            setUserInput,
            setLockedChars,
            setCurrentLyricIndex,
            setIsValidated,
            setHasErrors,
            setPauseCount,
            calculatePauseCount,
            setScore,
            setLastScoreChange,
            setIsMusicFinished,
            setIsCountdownActive
        );
    };

    //Appel de fonction pour gérer les actions liées à la saisie de texte sur l'input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleInputChangeUtil(
            e,
            lyrics,
            currentLyricIndex,
            userInput,
            lockedChars,
            setUserInput,
            setLockedChars,
            setScore,
            setLastScoreChange,
            setIncorrectCharacters,
            setHasErrors,
            setIsValidated,
            setCompletedInputs,
            setTotalCharacters,
            audioPlayerRef,
            setIsStarted,
            setStartTime,
            setEndTime,
            isStarted,
            hasErrors
        );
    };

    //Fonction qui permet de styliser les caractères en fonction s'ils sont corrects ou non
    const getStyledText = () => {
        const currentLyric = lyrics[currentLyricIndex]?.text || '';
        return currentLyric.split('').map((char, index) => {
            let className = '';
            // Si l'utilisateur a écrit jusqu'à ce caractère
            if (index < userInput.length) {
                // Vérification de la correspondance
                className = normalizeString(userInput[index]) === normalizeString(char)
                    ? 'right'
                    : 'wrong';
            }

            if (!charRefs.current[currentLyricIndex]) {
                charRefs.current[currentLyricIndex] = [];
            }
            return (
                <span key={index} className={className} ref={el => { charRefs.current[currentLyricIndex][index] = el; }}>
                    {char}
                </span>
            );
        });
    };

    useEffect(() => {
        console.log('completedInputs', completedInputs);
    }, [completedInputs]);

    //Termine la partie si l'utilisateur a terminé de saisir les paroles et que la chanson est terminée
    useEffect(() => {
        if (currentLyricIndex === lyrics.length - 1 && (isValidated && isMusicFinished)) {
            setIsStarted(false);
            setIsGameOver(true);
        }
    }, [currentLyricIndex, isValidated, lyrics.length, isMusicFinished]);


    //Relance la partie
    const handleReplay = () => {
        setCurrentLyricIndex(0);
        setUserInput('');
        setIsValidated(false);
        setLockedChars('');
        setIsStarted(false);
        setIsGameOver(false);
        setIsMusicFinished(false);
        setScore(0);
        setLastScoreChange(0);
        setHasErrors(false);
        setPauseCount(0);
        setStartTime(0);
        setEndTime(0);
        setIncorrectCharacters(0);
        setTotalCharacters(0);
        setCompletedInputs([]);
        audioPlayerRef.current?.audioEl.current?.load();
    };
    const isHandlingLineSwitch = useRef(false);

    // Compte à rebours si ligne incomplète
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (isCountdownActive && !isHandlingLineSwitch.current && !isValidated) {
            isHandlingLineSwitch.current = true; // Active le verrou
            setCountdown(10);

            timer = setInterval(() => {
                setCountdown((prev) => {

                    if (prev <= 1) {
                        clearInterval(timer);
                        setCountdown(10);
                        setIsCountdownActive(false);

                        if (currentLyricIndex < lyrics.length - 1) {
                            setCurrentLyricIndex((prevIndex) => {
                                // +0.5 car ça s'effectue 2 fois (bizarrement). A fix plus tard
                                return prevIndex + 0.5;
                            });

                            console.log(userInput);

                            setCompletedInputs((prev) => ({
                                ...prev,
                                [currentLyricIndex]: userInput,
                            }));
                            // Réinitialise l'état des inputs
                            setUserInput('');
                            setLockedChars('');
                            setHasErrors(false);
                            setIsValidated(false);

                            // Reprend la musique si elle est en pause
                            if (audioPlayerRef.current?.audioEl.current?.paused) {
                                audioPlayerRef.current.audioEl.current.play();
                            }
                        } else if (currentLyricIndex === lyrics.length - 1 && !isValidated) {
                            audioPlayerRef.current?.audioEl.current?.play();
                        }

                        // Gère la fin du jeu
                        if (currentLyricIndex === lyrics.length - 1) {
                            setIsStarted(false);
                            setIsGameOver(true);
                            setIsValidated(true);
                        }
                        isHandlingLineSwitch.current = false; // Libère le verrou
                        return 0;
                    }

                    return prev - 1; // Décrémente le compteur
                });
            }, 1000);
        } else if (currentLyricIndex === lyrics.length - 1 && isValidated && isMusicFinished) {
            setIsStarted(false);
            setIsGameOver(true);
            setIsValidated(true);
        }

        return () => {
            clearInterval(timer);
            isHandlingLineSwitch.current = false; // Libère le verrou
        };
    }, [isCountdownActive, lyrics.length, audioPlayerRef, isValidated]);


    //Affiche les paroles et le score final
    const renderLyrics = () => {
        if ((currentLyricIndex === lyrics.length - 1 && isValidated) && isGameOver) {
            return (
                <div className="final-score">
                    <p>Score final: {score}</p>
                    <p>Nombre de lignes en pause : {pauseCount} pauses / {totalLines} lignes</p>
                    <p>Vitesse de frappe : {calculateWPM(startTime, endTime, lyrics)} mots par minute</p>
                    <p>Précision d&apos;écriture : {calculateAccuracy(totalCharacters, incorrectCharacters)}%</p>
                    <div className="btn-list">
                        <button className="btn-primary" onClick={handleReplay}>Rejouer</button>
                        <Link href="/karakaku">
                            <button className="btn-secondary">Retour choix de musiques</button>
                        </Link>
                    </div>
                </div>
            );
        }

        return lyrics.map((lyric, index) => (
            <div key={index} className={`lyric-line ${index === currentLyricIndex ? 'current' : ''}`}>
                {index === currentLyricIndex - 1 && (
                    <p className="previous">
                        {lyrics[index].text.split('').map((char, charIndex) => {
                            const userInputForLine = completedInputs[index] || ''; // Évite undefined
                            const userChar = userInputForLine[charIndex] || ''; // Évite undefined
                            const className = normalizeString(userChar) === normalizeString(char)
                                ? 'right'  // Si le caractère saisi est correct
                                : userChar === ''  // Pas encore saisi
                                    ? '' // Pas de classe si rien saisi
                                    : 'wrong'; // Si le caractère est incorrect

                            return <span key={charIndex} className={className}>{char}</span>;
                        })}
                    </p>
                )}
                {index === currentLyricIndex && (
                    <div className="current-lyric-container">
                        <p className="current-lyric">{getStyledText()}</p>
                        <input
                            type="text"
                            value={userInput}
                            onChange={handleInputChange}
                            onPaste={handlePaste}
                            className="text-input"
                            autoFocus
                            spellCheck={false}
                        />
                        <div ref={caretRef} className="caret"></div>
                    </div>
                )}
                {index === currentLyricIndex + 1 && <p className="next">{lyrics[index].text}</p>}
            </div>
        ));
    };

    return (
        <div className="karakaku">
            {!isGameOver && (
                <>
                    <ReactAudioPlayer
                        src={songSrc}
                        controls
                        onListen={handleTimeUpdateWrapper}
                        ref={audioPlayerRef}
                        listenInterval={100}
                    />
                    {!isStarted && (
                        <button onClick={() => handlePlayPauseClick(audioPlayerRef, setIsStarted, setIsCountdownActive, setCountdown)}
                                className="btn-primary">
                            {audioPlayerRef.current?.audioEl.current?.paused ? 'Play' : 'Pause'}
                        </button>
                    )}
                    <div className="score">
                        <p>Score : {score} ({lastScoreChange > 0 ? '+' : ''}{lastScoreChange})</p>
                    </div>
                    {isCountdownActive && <p className="countdown">Compte à rebours : {countdown}</p>}
                </>
            )}
            <div className="lyrics">
                {renderLyrics()}
            </div>
        </div>
    );
};

export default Karakaku;