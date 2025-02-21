'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import { LyricLine, parseLRC } from '@/utils/LrcParser';
import styles from '@/stylesheets/karakaku.module.scss';
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
    const [progress, setProgress] = useState(0);
    const [multiplier, setMultiplier] = useState(1);

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

        // Mise à jour de la barre de progression
        if (audioPlayerRef.current && audioPlayerRef.current.audioEl.current) {
            const currentTime = audioPlayerRef.current.audioEl.current.currentTime;
            const duration = audioPlayerRef.current.audioEl.current.duration;
            setProgress((currentTime / duration) * 100);
        }
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
            hasErrors,
            multiplier,
            setMultiplier
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
                    ? styles.right
                    : styles.wrong;
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
        setMultiplier(1);
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

            setMultiplier(1);
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
                <div className={styles.finalScore}>
                    <p>Score final: {score}</p>
                    <p>Nombre de lignes en pause : {pauseCount} pauses / {totalLines} lignes</p>
                    <p>Vitesse de frappe : {calculateWPM(startTime, endTime, lyrics)} mots par minute</p>
                    <p>Précision d&apos;écriture : {calculateAccuracy(completedInputs, lyrics)}%</p>
                    <p>Nombre de fautes : {totalErrors} / {totalChars}</p>
                    <div className={styles.btnList}>
                        <button className={styles.btnPrimary} onClick={handleReplay}>Rejouer</button>
                        <Link href="/karakaku">
                            <button className={styles.btnSecondary}>Retour choix de musiques</button>
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
                <div key={index} className={`${styles.lyricLine} ${index === currentLyricIndex ? styles.current : ''}`}>
                    {/* Lignes précédentes */}
                    {index < currentLyricIndex && (
                        <p
                            className={`${styles.previous} 
                            ${index === currentLyricIndex ? styles.current : ''}
                            ${isBeforeFirst ? styles['--before-line'] : ''}
                            ${isFirstLine ? styles['--first-line'] : ''}`
                            }
                        >
                            {lyrics[index].text.split('').map((char, charIndex) => {
                                const userInputForLine = completedInputs[index] || ''; // Évite undefined
                                const userChar = userInputForLine[charIndex] || ''; // Évite undefined
                                const className = normalizeString(userChar) === normalizeString(char)
                                    ? styles.right  // Si le caractère saisi est correct
                                    : userChar === ''  // Pas encore saisi
                                        ? '' // Pas de classe si rien saisi
                                        : styles.wrong; // Si le caractère est incorrect

                                return <span key={charIndex} className={className}>{char}</span>;
                            })}
                        </p>
                    )}

                    {/* Ligne actuelle */}
                    {index === currentLyricIndex && (
                        <div className={styles.currentLyricContainer}>
                            <Image priority
                                src="/assets/img/icon/arrow-right.svg"
                                alt="Music svg"
                                width={40}
                                height={40}
                                className={styles.arrowIcon}
                            />
                            {isCountdownActive &&
                                <div className={styles.countdown}>
                                    <Image priority
                                        src="/assets/img/icon/timer.svg"
                                        alt="Music svg"
                                        width={40}
                                        height={40}
                                        className="countdown__icon"
                                    />
                                    <span className={styles.highlight}>{countdown}&nbsp;</span>
                                    {countdown === 1 ? 'seconde' : 'secondes'}
                                </div>
                            }
                            <p className={styles.currentLyric}>
                                {getStyledText()}
                            </p>
                            <input
                                type="text"
                                value={userInput}
                                onChange={handleInputChange}
                                onPaste={handlePaste}
                                className={styles.textInput}
                                autoFocus
                                spellCheck={false}
                            />
                            <div ref={caretRef} className={styles.caret}></div>
                        </div>
                    )}

                    {/* Lignes suivantes */}
                    {index > currentLyricIndex && (
                        <p className={`${styles.next}
                            ${isLastLine ? styles['--last-line'] : ''}
                            ${isBeforeLast ? styles['--before-line'] : ''}`
                        }>
                            {lyrics[index].text}
                        </p>
                    )}
                </div>
            );
        });
    };

    const speedClass = multiplier === 4 ? styles.faster :
        multiplier >= 3 ? styles.fast :
            multiplier >= 2 ? styles.medium : "";

    const getGradientId = () => {
        if (multiplier === 4) return "gradient-faster";
        if (multiplier >= 3) return "gradient-fast";
        if (multiplier >= 2) return "gradient-medium";
        return "gradient-default";
    };

    return (
        <div className={styles.karakaku}>
            {!isGameOver && (
                <>
                    <div className={styles.animatedBackground}></div>
                    <div className={`${styles.animatedBackground} ${styles['--inverse']}`}></div>

                    <Image priority
                        src="/assets/img/logo-jbh.png"
                        alt="Logo Just Beat Hit"
                        width={1000}
                        height={1000}
                        className={styles.logoJbh}
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
                        <div className={styles.btnContainer}>
                            <button
                                onClick={() => handlePlayPauseClick(audioPlayerRef, setIsStarted, setIsCountdownActive, setCountdown)}
                                className={styles.btnPrimary} style={{ display: 'none' }}>
                                {audioPlayerRef.current?.audioEl.current?.paused ? 'Play' : 'Pause'}
                            </button>
                            <a href="/karakaku" className={styles.btnSecondary}>
                                Quit
                            </a>
                        </div>
                    )}
                    <div className={styles.progressBarBackground}>
                        <div className={styles.progressBar} style={{ height: `${progress}%` }}></div>
                    </div>

                    <div className={styles.titleSong}>
                        <h5>{singer} - {title}</h5>
                    </div>
                    <Image priority
                        src="/assets/img/vinyl-jbh.svg"
                        alt="Vinyl svg"
                        width={1000}
                        height={1000}
                        className={`${styles.vinylPlayer} ${isStarted && !isCountdownActive ? styles['--playing'] : styles['--paused']}`}
                    />
                </>
            )}
            <div className={styles.lyrics}>
                {renderLyrics()}
            </div>

            {!isGameOver && (
                <div className={styles.score}>
                    <p
                        className={styles.changeScore}
                        key={lastScoreChange}
                        style={{display: lastScoreChange === 0 ? 'none' : 'inline-block'}}>
                        {lastScoreChange > 0 ? `+${lastScoreChange}` : lastScoreChange}
                    </p>
                    <div className={styles.score_display}>
                        <div className={`${styles.multiplier} ${speedClass} ${isStarted ? styles['playing'] : ''}`}>
                            <svg className={styles.spin_multiplier} viewBox="0 0 66 66"
                                 xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="gradient-default">
                                        <stop offset="0%" stopColor="#fff" stopOpacity="1"/>
                                        <stop offset="80%" stopColor="#fff" stopOpacity="0"/>
                                    </linearGradient>

                                    <linearGradient id="gradient-medium">
                                        <stop offset="0%" stopColor="#FFAB36" stopOpacity="1"/>
                                        <stop offset="80%" stopColor="#FFAB36" stopOpacity="0"/>
                                    </linearGradient>

                                    <linearGradient id="gradient-fast">
                                        <stop offset="0%" stopColor="#FF6026" stopOpacity="1"/>
                                        <stop offset="80%" stopColor="#FF6026" stopOpacity="0"/>
                                    </linearGradient>

                                    <linearGradient id="gradient-faster">
                                        <stop offset="0%" stopColor="#F1203C" stopOpacity="1"/>
                                        <stop offset="80%" stopColor="#F1203C" stopOpacity="0"/>
                                    </linearGradient>
                                </defs>

                                <circle className="path" fill="transparent" strokeWidth="4" cx="33" cy="33" r="30"
                                        stroke={`url(#${getGradientId()})`}
                                        strokeLinecap="round" strokeDasharray="143, 188"/>

                                <circle className={styles.spin_multiplier_dot} cx="33" cy="3" r="3"/>
                            </svg>
                            <span>x {multiplier}</span>
                        </div>
                        <div className={styles.scoreLine}>
                            <Image src="/assets/img/icon/score-line.svg" alt="Score" width={24} height={24}/>
                            <Image src="/assets/img/icon/score-line.svg" alt="Score" width={24} height={24}
                                   className={styles.scoreDecoration}/>
                            <p className={styles.actualScore}>{score}</p>
                        </div>
                    </div>
                    <p className={styles.label}>Score</p>
                </div>
            )}
        </div>
    );
};

export default Karakaku;