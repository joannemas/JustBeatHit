'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import { LyricLine, parseLRC } from '@/utils/LrcParser';
import '@/stylesheets/karakaku.scss';
import Link from 'next/link';
import Image from 'next/image';

import { lyricsDisplayUtils, normalizeString } from './utils/lyricsDisplayUtils';
import { caretUtils } from "./utils/caretUtils";
import {
    calculateWPM,
    calculateAccuracy,
    calculatePauseCount,
    calculateErrorsAndTotal
} from './utils/scoreUtils';
import { handlePlayPauseClick, handleTimeUpdate } from "./utils/timeManagerUtils";
import { handleInputChange as handleInputChangeUtil, handlePaste } from './utils/inputManagerUtils';

interface KarakakuProps {
    songSrc: string;
    lyricSrc: string;
    title?: string;
    singer?: string;
}


const Karakaku: React.FC<KarakakuProps> = ({ songSrc, lyricSrc, title, singer }) => {
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
    const { totalErrors, totalChars } = calculateErrorsAndTotal(completedInputs, lyrics);

    console.log('songSrc' + songSrc);

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
            isValidated,
            setIsValidated,
            completedInputs,
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
        setIsCountdownActive(false);
        audioPlayerRef.current?.audioEl.current?.load();
    };
    const isHandlingLineSwitch = useRef(false);

    // Compte à rebours si ligne incomplète
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (isCountdownActive && !isHandlingLineSwitch.current && !isValidated) {
            isHandlingLineSwitch.current = true; // Active le verrou
            setCountdown(10);
            setPauseCount(prevCount => calculatePauseCount(prevCount));
            const points = -500;
            setScore(prevScore => {
                const newScore = Math.max(prevScore + points, 0);
                setLastScoreChange(points);
                return newScore;
            });

            timer = setInterval(() => {
                setCountdown((prev) => {

                    if (prev <= 1) {
                        clearInterval(timer);
                        setCountdown(10);
                        setIsCountdownActive(false);

                        if (currentLyricIndex < lyrics.length - 1) {
                            setCurrentLyricIndex((prevIndex) => {
                                // +0.5 car ça s'effectue 2 fois (bizarrement). A fix plus tard
                                return prevIndex + (process.env.NODE_ENV === 'development' ? 0.5 : 1);
                            });

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
                    <p>Précision d&apos;écriture : {calculateAccuracy(completedInputs, lyrics)}%</p>
                    <p>Nombre de fautes : {totalErrors} / {totalChars}</p>
                    <div className="btn-list">
                        <button className="btn-primary" onClick={handleReplay}>Rejouer</button>
                        <Link href="/karakaku">
                            <button className="btn-secondary">Retour choix de musiques</button>
                        </Link>
                    </div>
                </div>
            );
        }

        return lyrics.map((lyric, index) => {
            const isFirstLine = index !== currentLyricIndex && index === Math.max(0, currentLyricIndex - 5);
            const isLastLine = index !== currentLyricIndex && index === Math.min(lyrics.length - 1, currentLyricIndex + 5);
            const isBeforeFirst = index !== currentLyricIndex && index === Math.max(0, currentLyricIndex - 4);
            const isBeforeLast = index !== currentLyricIndex && index === Math.min(lyrics.length - 1, currentLyricIndex + 4);

            // Vérifie si l'index est dans la plage affichée (5 lignes avant et après)
            if (index < currentLyricIndex - 5 || index > currentLyricIndex + 5) {
                return null; // N'affiche pas la ligne si hors de la plage
            }

            return (
                <div key={index} className={`lyric-line ${index === currentLyricIndex ? 'current' : ''}`}>
                    {/* Lignes précédentes */}
                    {index < currentLyricIndex && (
                        <p
                            className={`previous 
                            ${index === currentLyricIndex ? 'current' : ''}
                            ${isBeforeFirst ? '--before-line' : ''}
                            ${isFirstLine ? '--first-line' : ''}`
                            }
                        >
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

                    {/* Ligne actuelle */}
                    {index === currentLyricIndex && (
                        <div className="current-lyric-container">
                            <Image priority
                                src="/assets/img/icon/arrow-right.svg"
                                alt="Music svg"
                                width={40}
                                height={40}
                                className="arrow-icon"
                            />
                            {isCountdownActive &&
                                <div className="countdown">
                                    <Image priority
                                        src="/assets/img/icon/timer.svg"
                                        alt="Music svg"
                                        width={40}
                                        height={40}
                                        className="countdown__icon"
                                    />
                                    <span className="highlight">{countdown}&nbsp;</span>
                                    {countdown === 1 ? 'seconde' : 'secondes'}
                                </div>
                            }
                            <p className="current-lyric">
                                {getStyledText()}
                            </p>
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

                    {/* Lignes suivantes */}
                    {index > currentLyricIndex && (
                        <p className={`next 
                            ${isLastLine ? '--last-line' : ''}
                            ${isBeforeLast ? '--before-line' : ''}`
                        }>
                            {lyrics[index].text}
                        </p>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="karakaku">
            {!isGameOver && (
                <>
                    <div className="animated-background"></div>
                    <div className="animated-background --inverse"></div>

                    <Image priority
                        src="/assets/img/logo-jbh.png"
                        alt="Logo Just Beat Hit"
                        width={1000}
                        height={1000}
                        className="logo-jbh"
                    />
                    <ReactAudioPlayer
                        src={songSrc}
                        controls
                        onListen={handleTimeUpdateWrapper}
                        ref={audioPlayerRef}
                        listenInterval={100}
                    />
                    {/*Opacity 0 car si on retire le bouton, le player ne se lance pas*/}
                    {!isStarted && (
                        <button
                            onClick={() => handlePlayPauseClick(audioPlayerRef, setIsStarted, setIsCountdownActive, setCountdown)}
                            className="btn-primary" style={{ opacity: 0 }}>
                            {audioPlayerRef.current?.audioEl.current?.paused ? 'Play' : 'Pause'}
                        </button>
                    )}
                    <div className="title-song">
                        <h5>{singer} - {title}</h5>
                    </div>
                    <Image priority
                        src="/assets/img/vinyl-jbh.svg"
                        alt="Vinyl svg"
                        width={1000}
                        height={1000}
                        className={`vinyl-player ${isStarted && !isCountdownActive ? '--playing' : '--paused'}`}
                    />
                </>
            )}
            <div className="lyrics">
                {renderLyrics()}
            </div>

            <div className="score">
                <p
                    className='change-score'
                    key={lastScoreChange}
                    style={{ display: lastScoreChange === 0 ? 'none' : 'inline-block' }} >
                    {lastScoreChange > 0 ? `+${lastScoreChange}` : lastScoreChange}
                </p>                
                <div className='score-line'>
                    <Image src="/assets/img/icon/score-line.svg" alt="Score" width={24} height={24} />
                    <Image src="/assets/img/icon/score-line.svg" alt="Score" width={24} height={24} className='score-decorator'/>
                    <p className='actual-score'>{score}</p>
                </div>
                <p className='label'>Score</p>
            </div>
        </div>
    );
};

export default Karakaku;