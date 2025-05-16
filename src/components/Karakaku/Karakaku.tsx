'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { endGame, replayGame, startGame } from "@/app/game/actions";

interface KarakakuProps {
  songSrc: string;
  lyricSrc: string;
  title?: string;
  singer?: string;
  gameId: string;
  gameName: string;
}

const Karakaku: React.FC<KarakakuProps> = ({ songSrc, lyricSrc, title, singer, gameId, gameName }) => {
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
  const [isPausedMenuOpen, setIsPausedMenuOpen] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [volume, setVolume] = useState<number>(0.8);
  const [linePoints, setLinePoints] = useState<number>(0);
  const [showLinePoints, setShowLinePoints] = useState<boolean>(false);
  const linePointsTimerRef = useRef<NodeJS.Timeout | null>(null); 
  const wasValidatedRef = useRef<boolean>(false);

  console.log('songSrc' + songSrc);

  useEffect(() => {
    lyricsDisplayUtils(lyricSrc, charRefs, parseLRC, setLyrics, setTotalLines)
  }, [lyricSrc, charRefs]);

  useEffect(() => {
    caretUtils({
      userInput,
      currentLyricIndex,
      lyrics,
      charRefs,
      caretRef
    });
  }, [userInput, currentLyricIndex, lyrics, charRefs, caretRef]);

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
    if (audioPlayerRef.current && audioPlayerRef.current.audioEl.current) {
      const currentTime = audioPlayerRef.current.audioEl.current.currentTime;
      const duration = audioPlayerRef.current.audioEl.current.duration;
      setProgress((currentTime / duration) * 100);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioPlayerRef.current?.audioEl.current) {
      audioPlayerRef.current.audioEl.current.volume = newVolume;
    }
  };

  const calculateLinePoints = (input: string, lyricText: string, hasErrors: boolean, currentMultiplier: number) => {
    if (!lyricText) return 0;
    const basePoints = lyricText.length * 10;
    const perfectBonus = hasErrors ? 0 : basePoints * 0.5;
    return Math.round((basePoints + perfectBonus) * currentMultiplier);
  };

  const showLinePointsWithTimer = (points: number) => {
    if (linePointsTimerRef.current) {
      clearTimeout(linePointsTimerRef.current);
    }
    setLinePoints(points);
    setShowLinePoints(true);
    linePointsTimerRef.current = setTimeout(() => {
      setShowLinePoints(false);
      linePointsTimerRef.current = null;
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (linePointsTimerRef.current) {
        clearTimeout(linePointsTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isValidated && !wasValidatedRef.current) {
      const points = calculateLinePoints(
        userInput,
        lyrics[currentLyricIndex]?.text || '',
        hasErrors,
        multiplier
      );
      showLinePointsWithTimer(points);
    }
    wasValidatedRef.current = isValidated;
  }, [isValidated, currentLyricIndex, userInput, lyrics, hasErrors, multiplier]);

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

  const getStyledText = () => {
    const currentLyric = lyrics[currentLyricIndex]?.text || '';
    return currentLyric.split('').map((char, index) => {
      let className = '';
      if (index < userInput.length) {
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

  useEffect(() => {
    if (currentLyricIndex === lyrics.length - 1 && (isValidated && isMusicFinished)) {
      setIsStarted(false);
      setIsGameOver(true);
    }
  }, [currentLyricIndex, isValidated, lyrics.length, isMusicFinished]);

  const handleReplay = () => {
    replayGame(gameId);
    setIsPausedMenuOpen(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 200);
  };

  const isHandlingLineSwitch = useRef(false);

  useEffect(() => {
    if (isCountdownActive) {
      setCountdown(10);
      setPauseCount(prevCount => calculatePauseCount(prevCount));
      const points = -500;
      setScore(prevScore => {
        const newScore = Math.max(prevScore + points, 0);
        setLastScoreChange(points);
        return newScore;
      });
    }
  }, [isCountdownActive]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCountdownActive && !isHandlingLineSwitch.current && !isValidated && !isPausedMenuOpen) {
      isHandlingLineSwitch.current = true;
      setCountdown((prev) => prev > 0 ? prev : 10);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsCountdownActive(false);
            if (currentLyricIndex < lyrics.length - 1) {
              setShowLinePoints(false);
              if (linePointsTimerRef.current) {
                clearTimeout(linePointsTimerRef.current);
                linePointsTimerRef.current = null;
              }
              wasValidatedRef.current = false;
              setCurrentLyricIndex((prevIndex) => {
                return prevIndex + (process.env.NODE_ENV === 'development' ? 0.5 : 1);
              });
              setUserInput('');
              setLockedChars('');
              setHasErrors(false);
              setIsValidated(false);
              if (audioPlayerRef.current?.audioEl.current?.paused) {
                audioPlayerRef.current.audioEl.current.play();
              }
            } else if (currentLyricIndex === lyrics.length - 1 && !isValidated) {
              audioPlayerRef.current?.audioEl.current?.play();
            }
            if (currentLyricIndex === lyrics.length - 1) {
              setIsStarted(false);
              setIsGameOver(true);
              setIsValidated(true);
            }
            isHandlingLineSwitch.current = false;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (currentLyricIndex === lyrics.length - 1 && isValidated && isMusicFinished) {
      setIsStarted(false);
      setIsGameOver(true);
      setIsValidated(true);
    }
    return () => {
      clearInterval(timer);
      isHandlingLineSwitch.current = false;
    };
  }, [isCountdownActive, lyrics.length, audioPlayerRef, isValidated, isPausedMenuOpen]);

  useEffect(() => {
    if (isStarted) { startGame(gameId) }
  }, [isStarted, gameId])

  useEffect(() => {
    if ((currentLyricIndex === lyrics.length - 1 && isValidated) && isGameOver) {
      const word_speed = calculateWPM(startTime, endTime, lyrics)
      const typing_accuracy = calculateAccuracy(completedInputs, lyrics)
      endGame({ score, mistakes: totalErrors, typing_accuracy, word_speed }, gameName, gameId)
    }
  }, [isValidated, isGameOver, currentLyricIndex, lyrics.length])

  // Affiche les paroles et le score final
  const renderLyrics = () => {
    return lyrics.map((lyric, index) => {
      const isFirstLine = index !== currentLyricIndex && index === Math.max(0, currentLyricIndex - 5);
      const isLastLine = index !== currentLyricIndex && index === Math.min(lyrics.length - 1, currentLyricIndex + 5);
      const isBeforeFirst = index !== currentLyricIndex && index === Math.max(0, currentLyricIndex - 4);
      const isBeforeLast = index !== currentLyricIndex && index === Math.min(lyrics.length - 1, currentLyricIndex + 4);

      if (index < currentLyricIndex - 5 || index > currentLyricIndex + 5) {
        return null;
      }

      return (
        <div key={index} className={`${styles.lyricLine} ${index === currentLyricIndex ? styles.current : ''}`}>
          {index < currentLyricIndex && (
            <p
              className={`
                ${styles.previous} 
                ${index === currentLyricIndex ? styles.current : ''}
                ${isBeforeFirst ? styles['--before-line'] : ''}
                ${isFirstLine ? styles['--first-line'] : ''}
              `}
            >
              {lyrics[index].text.split('').map((char, charIndex) => {
                const userInputForLine = completedInputs[index] || '';
                const userChar = userInputForLine[charIndex] || '';
                const className = normalizeString(userChar) === normalizeString(char)
                  ? styles.right
                  : userChar === ''
                    ? ''
                    : styles.wrong;
                return <span key={charIndex} className={className}>{char}</span>;
              })}
            </p>
          )}

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
                ref={inputRef}
              />
              <div ref={caretRef} className={styles.caret}></div>
              {showLinePoints && (
                <div className={styles.linePoints}>
                  +{linePoints} points
                </div>
              )}
            </div>
          )}

          {index > currentLyricIndex && (
            <p className={`
                ${styles.next}
                ${isLastLine ? styles['--last-line'] : ''}
                ${isBeforeLast ? styles['--before-line'] : ''}
              `}>
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

  const roundToOneDecimals = (num: number) => {
    if (!num) return "";
    if (num >= 4) return num;
    const match = num.toString().match(/^-?\d+(?:\.\d)?/);
    return match ? match[0] : "";
  }

  // Pause ECHAP
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isGameOver) {
        setIsPausedMenuOpen((prev) => {
          if (prev) {
            document.querySelector(`.${styles.echapInfoText}`)?.setAttribute("style", "display: block;");
            const audio = audioPlayerRef.current?.audioEl.current;
            if (audio) {
              const isMusicFinished = audio.ended;
              if (!isCountdownActive && !isMusicFinished) {
                audio.play();
              }
            }
            inputRef.current?.focus();
          } else {
            document.querySelector(`.${styles.echapInfoText}`)?.setAttribute("style", "display: none;");
            audioPlayerRef.current?.audioEl.current?.pause();
            inputRef.current?.blur();
          }
          return !prev;
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGameOver, currentLyricIndex, isCountdownActive, lyrics.length]);

  // ---- ADDED: Handle "R" for replay when sidebar is open ----
  useEffect(() => {
    if (!isPausedMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'r' || event.key === 'R')) {
        event.preventDefault();
        handleReplay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPausedMenuOpen]);
  // ----------------------------------------------------------

  // Bouton Reprendre
  const handleResume = () => {
    setIsPausedMenuOpen(false);
    const audio = audioPlayerRef.current?.audioEl.current;
    if (audio) {
      const isMusicFinished = audio.ended;
      if (!isCountdownActive && !isMusicFinished) {
        audio.play();
      }
    }
    inputRef.current?.focus();
  };

  return (
    <div className={styles.karakaku}>
      <div className={`${styles.pauseMenu} ${isPausedMenuOpen ? styles.pauseMenuVisible : ''}`}>
        <Image
          src="/assets/img/MusicBar.svg"
          alt="Music Bar"
          width={300}
          height={300}
          className={styles.musicBarEchap}
        />
        <div className={`${styles.animatedEchap}`}></div>
        <div className={styles.pauseMenuContent}>
          <div>
            <Image
              src="/assets/img/icon/icon-echap.svg"
              alt="Pause"
              width={100}
              height={24}
              className={styles.pauseTextIcon}
            />
            <button className={styles.btnEchap} onClick={handleResume}>
              <Image
                src="/assets/img/icon/arrow-right-black.svg"
                alt="Play"
                width={24}
                height={24}
                className={styles.playIcon}
              />
              Reprendre
            </button>
          </div>
          <div>
            <Image
              src="/assets/img/icon/icon-r.svg"
              alt="Reprendre"
              width={100}
              height={24}
              className={styles.pauseTextIcon}
            />
            <button className={styles.btnEchap} onClick={handleReplay}>
              <Image
                src="/assets/img/icon/refresh.svg"
                alt="Play"
                width={24}
                height={24}
                className={styles.playIcon}
              />
              Recommencer
            </button>
          </div>
          <Link href="/">
            <button className={styles.btnEchap}>
              <Image
                src="/assets/img/icon/settings.svg"
                alt="Play"
                width={24}
                height={24}
                className={styles.playIcon}
              />
              Options
            </button>
          </Link>
          <Link href="/">
            <button className={styles.btnEchap}>
              <Image
                src="/assets/img/icon/arrow-left.svg"
                alt="Play"
                width={24}
                height={24}
                className={styles.playIcon}
              />
              Quitter
            </button>
          </Link>
          {/* Volume Control */}
          <div className={styles.volumeControl}>
            <Image 
              src="/assets/img/icon/volume.svg" 
              alt="Volume" 
              width={20} 
              height={20} 
            />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className={styles.volumeSlider}
            />
          </div>
        </div>
      </div>

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
          <div className={styles.echapInfoText}>
            <span>
              <Image
                src="/assets/img/icon/echap-key.svg"
                alt="Music svg"
                width={50}
                height={50}
              />
              <span>pour mettre en pause la partie</span>
            </span>
          </div>
          <ReactAudioPlayer
            src={songSrc}
            controls
            onListen={handleTimeUpdateWrapper}
            ref={audioPlayerRef}
            listenInterval={100}
          />
          {/* Opacity 0 car si on retire le bouton, le player ne se lance pas */}
          {!isStarted && (
            <div className={styles.btnContainer}>
              <button
                onClick={() => handlePlayPauseClick(audioPlayerRef, setIsStarted, setIsCountdownActive, setCountdown)}
                className={styles.btnPrimary} style={{ display: 'none' }}>
                {audioPlayerRef.current?.audioEl.current?.paused ? 'Play' : 'Pause'}
              </button>
            </div>
          )}
          <div className={styles.progressBarBackground}>
            <div className={styles.progressBar} style={{ height: `${progress}%` }}></div>
          </div>
          <div className={styles.titleSong}>
            <Image
              src="/assets/img/icon/down-round-arrow.svg"
              alt="Arrow svg"
              width={30}
              height={30}
              className={styles.musicIcon}
            />
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
            style={{ display: lastScoreChange === 0 ? 'none' : 'inline-block' }}>
            {lastScoreChange > 0 ? `+${lastScoreChange}` : lastScoreChange}
          </p>
          <div className={styles.score_display}>
            <div className={`${styles.multiplier} ${speedClass} ${isStarted ? styles['playing'] : ''}`}>
              <svg className={styles.spin_multiplier} viewBox="0 0 66 66"
                xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gradient-default">
                    <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                    <stop offset="80%" stopColor="#fff" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="gradient-medium">
                    <stop offset="0%" stopColor="#FFAB36" stopOpacity="1" />
                    <stop offset="80%" stopColor="#FFAB36" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="gradient-fast">
                    <stop offset="0%" stopColor="#FF6026" stopOpacity="1" />
                    <stop offset="80%" stopColor="#FF6026" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="gradient-faster">
                    <stop offset="0%" stopColor="#F1203C" stopOpacity="1" />
                    <stop offset="80%" stopColor="#F1203C" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <circle className="path" fill="transparent" strokeWidth="4" cx="33" cy="33" r="30"
                  stroke={`url(#${getGradientId()})`}
                  strokeLinecap="round" strokeDasharray="143, 188" />
                <circle className={styles.spin_multiplier_dot} cx="33" cy="3" r="3" />
              </svg>
              <span>x {roundToOneDecimals(multiplier)}</span>
            </div>
            <div className={styles.scoreLine}>
              <Image src="/assets/img/icon/score-line.svg" alt="Score" width={24} height={24} />
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