'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {useEffect, useState} from 'react';
import { trimMp3 } from '@/lib/ffmpeg/trimMp3';
import { trimLrc } from '@/lib/lrc/trimLrc';
import styles from "@/stylesheets/uploadSong.module.scss";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import {
    RangeSlider,
    RangeSliderTrack,
    RangeSliderFilledTrack,
    RangeSliderThumb, ChakraProvider,
} from '@chakra-ui/react'
import { songSchema } from './lib/schema';
import { ACCEPTED_IMAGE_TYPES, difficultyLevels, musicStyles, statusOptions } from './lib/constants';
import { uploadLocalSong } from '@/lib/dexie/uploadLocalSong';
import { supabase } from '@/lib/supabase/client';

type SongFormData = z.infer<typeof songSchema>;

export default function UploadSongPage() {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        watch,
        trigger,
    } = useForm<SongFormData>({
        resolver: zodResolver(songSchema),
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioDuration, setAudioDuration] = useState<number>(0);
    const [lyrics, setLyrics] = useState<{ time: number; text: string }[]>([]);
    const [originalMp3File, setOriginalMp3File] = useState<File | null>(null);
    const [lrcFile, setLrcFile] = useState<File | null>(null);
    const [trimmedAudioUrl, setTrimmedAudioUrl] = useState<string | null>(null);
    const [isTrimming, setIsTrimming] = useState(false);
    const [hasInitialTrim, setHasInitialTrim] = useState(false);
    const [isPreparing, setIsPreparing] = useState(false);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingArtist, setIsEditingArtist] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isMounted, setIsMounted] = useState(false);
    const [rangeIndex, setRangeIndex] = useState<[number, number]>([1, 5]);
    const [startIndex, endIndex] = rangeIndex;
    const startTime = lyrics[startIndex]?.time ?? 0;
    const endTime = lyrics[endIndex]?.time ?? audioDuration;
    const [adjustedStartTime, setAdjustedStartTime] = useState(startTime);
    const [adjustedEndTime, setAdjustedEndTime] = useState(endTime);
    const min = 1;
    const max = lyrics.length > 0 ? lyrics.length : 10; // Protection contre lyrics vide
    const [musicStyleInput, setMusicStyleInput] = useState('');
    const [filteredStyles, setFilteredStyles] = useState<string[]>(musicStyles);
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

// Synchroniser avec le champ du formulaire react-hook-form
    useEffect(() => {
        setValue('music_style', selectedStyles);
    }, [selectedStyles, setValue]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMusicStyleInput(value);

        const filtered = musicStyles.filter(style =>
            style.toLowerCase().includes(value.toLowerCase()) &&
            !selectedStyles.includes(style)
        );
        setFilteredStyles(filtered);
    };

    const handleStyleSelect = (style: string) => {
        if (!selectedStyles.includes(style)) {
            setSelectedStyles(prev => [...prev, style]);
            setMusicStyleInput('');
            setFilteredStyles(musicStyles.filter(s => !selectedStyles.includes(s)));
        }
    };

    const handleRemoveStyle = (style: string) => {
        setSelectedStyles(prev => prev.filter(s => s !== style));
    };


    // Fonction pour inverser les valeurs du slider
    const invertValue = (val: number) => max - val + min;

    useEffect(() => {
        setRangeIndex([1, Math.floor(lyrics.length / 2)]);
    }, [lyrics]);

    // Calcule un début au milieu entre la ligne précédente et la ligne actuelle
    function getSmartTrimRange(
        rangeIndex: [number, number],
        lyrics: { time: number }[],
        audioDuration: number
    ) {
        const [startIndex, endIndex] = rangeIndex;

        const currentStart = lyrics[startIndex]?.time ?? 0;

        const smartStart =
            startIndex === 0
                ? 0
                : (lyrics[startIndex - 1].time + currentStart) / 2;

        setAdjustedStartTime(smartStart);

        const smartEnd =
            endIndex < lyrics.length - 1
                ? lyrics[endIndex + 1].time
                : audioDuration;

        setAdjustedEndTime(smartEnd);

        return {
            startTime: smartStart,
            endTime: smartEnd,
            duration: smartEnd - smartStart,
        };
    }

    const formatDuration = (seconds: number): string => {
        if (seconds < 60) {
            const durationText = `${Math.round(seconds)} seconde${seconds >= 2 ? 's' : ''}`;
            if (seconds < 30) {
                return `${durationText} (audio trop court !)`;
            }
            return durationText;
        }

        const mins = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        const durationText = `${mins} minute${mins > 1 ? 's' : ''}${secs > 0 ? ` ${secs}` : ''}`;

        if (seconds > 90) {
            return `${durationText} (audio trop long !)`;
        }

        return durationText;
    };

    const isValidDuration = (duration: number): boolean => {
        return duration >= 30 && duration <= 90;
    };

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const validateField = async (field: 'title' | 'singer', value: string) => {
        const trimmed = value.trim();

        // On met à jour la valeur manuellement
        setValue(field, trimmed);

        // On déclenche la validation
        const isValid = await trigger(field);

        // Si le champ est valide, on ferme l’édition
        if (isValid) {
            if (field === 'title') setIsEditingTitle(false);
            if (field === 'singer') setIsEditingArtist(false);
        }
    };

    const title = watch('title');
    const singer = watch('singer');

    const onSubmit: SubmitHandler<SongFormData> = async (data) => {

        setIsSubmitting(true);

        const { title, singer, is_explicit, difficulty, status, mp3File, lrcFile, coverFile, is_premium, music_style } = data;
        const folderPath = `${singer} - ${title}`.trim();

        const { startTime, endTime, duration } = getSmartTrimRange(rangeIndex, lyrics, audioDuration);
        const trimmedMp3Blob = await trimMp3(mp3File[0], startTime, duration);
        const trimmedLrcBlob = await trimLrc(lrcFile[0], startTime, endTime);

        if (!isValidDuration(duration)) {
            alert("La durée de l'audio doit être comprise entre 30 et 90 secondes.");
            setIsSubmitting(false);
            return;
        }

        // Upload du MP3
        const { error: mp3Error } = await supabase.storage
            .from('song')
            .upload(`${folderPath}/song.mp3`, trimmedMp3Blob, {
                cacheControl: '3600',
                upsert: true,
            });

        if (mp3Error) {
            console.error('Erreur à l’upload du MP3:', mp3Error.message);
            alert("Échec de l'upload du fichier MP3");
            setIsSubmitting(false);
            return;
        }

        // Upload du LRC
        const { error: lrcError } = await supabase.storage
            .from('song')
            .upload(`${folderPath}/lyrics.lrc`, trimmedLrcBlob, {
                cacheControl: '3600',
                upsert: true,
            });
        if (lrcError) {
            console.error('Erreur à l’upload du LRC:', lrcError.message);
            alert("Échec de l'upload du fichier LRC");
            setIsSubmitting(false);
            return;
        }

        // Upload de l'image cover
        const { error: coverError } = await supabase.storage
            .from('song')
            .upload(`${folderPath}/cover.${coverFile?.[0]?.name.split('.').pop()}`, coverFile[0], {
                cacheControl: '3600',
                upsert: true,
            });

        if (coverError) {
            console.error('Erreur à l’upload de la cover:', coverError.message);
            alert("Échec de l'upload de l’image de couverture");
            setIsSubmitting(false);
            return;
        }

        // Insertion dans la base de données
        const { error: insertError } = await supabase
            .from('song')
            .insert({
                title,
                singer,
                is_explicit,
                difficulty,
                status,
                is_premium,
                music_style,
            });

        if (insertError) {
            console.error('Erreur à l’insertion:', insertError.message);
            alert("Échec de l'insertion dans la base de données");
            setIsSubmitting(false);
            return;
        }
        // Pour des tests sur l'upload dans InedexDB
        // await uploadLocalSong(trimmedMp3Blob, trimmedLrcBlob, coverFile[0], singer, title)

        alert('Chanson ajoutée avec succès !');
        setIsSubmitting(false);
    };

    const onMP3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setOriginalMp3File(file);
            const url = URL.createObjectURL(file);
            setAudioUrl(url);
            const audio = new Audio(url);
            audio.addEventListener('loadedmetadata', () => {
                const duration = audio.duration;
                setAudioDuration(duration);
            });
        }
    };

    // Découpage automatique avec délai sauf au premier import
    useEffect(() => {
        if (!originalMp3File || lyrics.length === 0) return;

        setIsPreparing(true);

        const trim = async () => {
            setIsTrimming(true);

            const { startTime, endTime, duration } = getSmartTrimRange(rangeIndex, lyrics, audioDuration);

            try {
                const trimmedBlob = await trimMp3(originalMp3File, startTime, duration);
                const previewUrl = URL.createObjectURL(trimmedBlob);
                setTrimmedAudioUrl(previewUrl);
            } catch (err) {
                console.error("Erreur lors du découpage de prévisualisation :", err);
            } finally {
                setIsTrimming(false);
                setIsPreparing(false);
                setHasInitialTrim(true);
            }
        };

        const delay = hasInitialTrim ? 1500 : 200;
        const timeout = setTimeout(trim, delay);

        return () => clearTimeout(timeout);
    }, [rangeIndex, originalMp3File, lyrics]);

    const parseLRC = async (file: File) => {
        const text = await file.text();
        const allowedCharsRegex = /[^a-zA-Z0-9À-ÿ.,!?;:'"()\[\]{}<>«»\-–—_\/\\ \n\r]/g; // tout ce qui n'est PAS autorisé
        const parenthesisRegex = /\([^)]*\)/g;

        const lines = text
            .split('\n')
            .map((line) => {
                const match = line.match(/\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?](.*)/);
                if (!match) return null;

                const minutes = parseInt(match[1], 10);
                const seconds = parseInt(match[2], 10);
                const millis = parseInt(match[3] || '0', 10);
                const time = minutes * 60 + seconds + millis / 1000;

                let rawText = match[4].trim();

                // Supprimer les textes entre parenthèses
                rawText = rawText.replace(parenthesisRegex, '');

                // Supprimer tous les caractères non autorisés
                rawText = rawText.replace(allowedCharsRegex, '').trim();

                if (!rawText) return null;

                return { time, text: rawText };
            })
            .filter((entry): entry is { time: number; text: string } => !!entry);
        setLyrics(lines);
    };

    const handleLrcFileChange = async (file: File) => {
        if (!file) return;

        await parseLRC(file);

        setLrcFile(file);

        const text = await file.text();

        const artistMatch = text.match(/\[ar:(.*?)\]/);
        const titleMatch = text.match(/\[ti:(.*?)\]/);

        if (artistMatch) {
            setValue('singer', artistMatch[1].trim(), { shouldValidate: true });
        }

        if (titleMatch) {
            setValue('title', titleMatch[1].trim(), { shouldValidate: true });
        }
    };


    return (
        <ChakraProvider resetCSS={false}>
            <main className={styles.upload}>
                <Navbar/>
                <form onSubmit={handleSubmit(onSubmit)} className={styles.uploadForm}>
                    <div className={styles.uploadForm__display}>
                        {currentStep === 1 && (
                            <div className={styles.stepOne}>
                                <h2>Étape 1 . ajouter le fichier <span className={styles.highlightTitle}>mp3</span> et le fichier <span className={styles.highlightTitle}>lrc</span></h2>

                                <div>
                                    <div className={styles.stepOne__filesWrapper}>
                                        <div className={styles.fileInput}>
                                            <label htmlFor="mp3">Audio</label>
                                            <div className={`${styles.fileInput__display} ${originalMp3File ? styles.active : ''}`}>
                                                <input
                                                    id="mp3"
                                                    type="file"
                                                    accept=".mp3"
                                                    {...register('mp3File')}
                                                    onChange={onMP3Change}
                                                />
                                                <div className={styles.fileInput__plus}>
                                                    <Image src={
                                                        originalMp3File
                                                            ? "/assets/img/icon/check-circle.svg"
                                                            : "/assets/img/icon/add-circle.svg"
                                                    }
                                                           alt="status icon" width={50} height={50} aria-hidden="true"/>
                                                </div>
                                                <span className={styles.fileInput__extension}>
                                                {originalMp3File ? originalMp3File.name : '.mp3'}
                                            </span>
                                            </div>

                                            {typeof errors.mp3File?.message === 'string' && (
                                                <p className={styles.error}>{errors.mp3File.message}</p>
                                            )}
                                        </div>

                                        <div className={styles.fileInput}>
                                            <label htmlFor="mp3">Paroles</label>
                                            <div className={`${styles.fileInput__display} ${lrcFile ? styles.active : ''}`}>
                                                <input
                                                    type="file"
                                                    accept=".lrc"
                                                    {...register('lrcFile')}
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleLrcFileChange(file);
                                                    }}
                                                />
                                                <div className={styles.fileInput__plus}>
                                                    <Image src={
                                                        lrcFile
                                                            ? "/assets/img/icon/check-circle.svg"
                                                            : "/assets/img/icon/add-circle.svg"
                                                    }
                                                           alt="status icon" width={50} height={50} aria-hidden="true"/>
                                                </div>
                                                <span className={styles.fileInput__extension}>
                                {lrcFile ? lrcFile.name : '.lrc'}
                            </span>
                                            </div>

                                            {typeof errors.lrcFile?.message === 'string' && (
                                                <p>{errors.lrcFile?.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium amet animi
                                        architecto,
                                        asperiores blanditiis commodi deleniti dolores eos error esse est ex excepturi hic
                                        itaque
                                        laborum magni modi mollitia necessitatibus nostrum odio odit optio pariatur, qui
                                        quia.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className={styles.stepButton}
                                    onClick={() => setCurrentStep(2)}
                                >
                                    <Image src="/assets/img/icon/arrow-right.svg" alt="arrow icon" width={25} height={25} aria-hidden="true"/>
                                    Suivant
                                </button>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className={styles.stepTwo}>
                                <h2>étape 2 : ajouter des <span className={styles.highlightTitle}>informations complémentaires</span></h2>

                                <div className={styles.stepTwo__wrapper__inputs}>
                                    <div className={styles.songInfo}>
                                        <div className={styles.fileInput}>
                                            <label>Cover</label>
                                            <div className={`${styles.fileInput__display} ${coverFile ? styles.active : ''}`}>
                                                {coverPreview &&
                                                    <img src={coverPreview} alt="cover" className={styles.fileInput__background}/>}
                                                <input
                                                    type="file"
                                                    accept={ACCEPTED_IMAGE_TYPES.join(',')}
                                                    {...register('coverFile')}
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setCoverFile(file);
                                                            setCoverPreview(URL.createObjectURL(file));
                                                        }
                                                    }}
                                                />
                                                <div className={styles.fileInput__plus}>
                                                    <Image src={
                                                        coverFile
                                                            ? "/assets/img/icon/check-circle.svg"
                                                            : "/assets/img/icon/add-circle.svg"
                                                    }
                                                           alt="status icon" width={50} height={50} aria-hidden="true"/>
                                                </div>
                                                <span className={styles.fileInput__extension}>
                                                {coverFile ? coverFile.name : '.png, .jpg, .jpeg'}
                                            </span>
                                            </div>

                                            {typeof errors.coverFile?.message === 'string' && (
                                                <p>{errors.coverFile.message}</p>
                                            )}
                                        </div>

                                        <div className={styles.songTextInfos}>
                                            <div className={styles.uploadForm__display__input}>
                                                <label>Titre</label>
                                                <div className={styles.uploadForm__display__input__edit}>
                                                    {isEditingTitle || !title ? (
                                                        <>
                                                            <input
                                                                type="text"
                                                                defaultValue={title}
                                                                onBlur={(e) => validateField('title', e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        validateField('title', (e.target as HTMLInputElement).value);
                                                                    }
                                                                }}
                                                                autoFocus={isMounted && isEditingTitle}
                                                            />
                                                            <Image
                                                                src="/assets/img/icon/check-circle.svg"
                                                                alt="valider"
                                                                width={20}
                                                                height={20}
                                                                aria-hidden="true"
                                                                onClick={() => {
                                                                    const input = document.querySelector<HTMLInputElement>('input[name="title"]');
                                                                    if (input) validateField('title', input.value);
                                                                }}
                                                            />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className={styles.displayText}>{title}</span>
                                                            <Image
                                                                src="/assets/img/icon/edit-icon.svg"
                                                                alt="éditer"
                                                                width={20}
                                                                height={20}
                                                                aria-hidden="true"
                                                                onClick={() => setIsEditingTitle(true)}
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                                {errors.title && <p>{errors.title.message}</p>}
                                            </div>

                                            <div className={styles.uploadForm__display__input}>
                                                <label>Artiste</label>
                                                <div className={styles.uploadForm__display__input__edit}>
                                                    {isEditingArtist || !singer ? (
                                                        <>
                                                            <input
                                                                type="text"
                                                                defaultValue={singer}
                                                                onBlur={(e) => validateField('singer', e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        validateField('singer', (e.target as HTMLInputElement).value);
                                                                    }
                                                                }}
                                                                autoFocus={isMounted && isEditingArtist}
                                                            />
                                                            <Image
                                                                src="/assets/img/icon/check-circle.svg"
                                                                alt="valider"
                                                                width={20}
                                                                height={20}
                                                                aria-hidden="true"
                                                                onClick={() => {
                                                                    const input = document.querySelector<HTMLInputElement>('input[name="singer"]');
                                                                    if (input) validateField('singer', input.value);
                                                                }}
                                                            />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className={styles.displayText}>{singer}</span>
                                                            <Image
                                                                src="/assets/img/icon/edit-icon.svg"
                                                                alt="éditer"
                                                                width={20}
                                                                height={20}
                                                                aria-hidden="true"
                                                                onClick={() => setIsEditingArtist(true)}
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                                {errors.singer && <p>{errors.singer.message}</p>}
                                            </div>

                                            <div className={styles.uploadForm__display__checkbox}>
                                                <label>Contenu explicite</label>
                                                <input type="checkbox" {...register('is_explicit')} />
                                            </div>

                                            <div className={styles.uploadForm__display__checkbox}>
                                                <label>Musique Premium </label>
                                                <input type="checkbox" {...register('is_premium')} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.uploadForm__display__input}>
                                        <div className={styles.musicStyleWrapper}>
                                            <label htmlFor="music-style">Style(s) musical(aux)</label>

                                            <div className={styles.musicStyleInputWrapper}>
                                                <input
                                                    type="text"
                                                    value={musicStyleInput}
                                                    onChange={handleInputChange}
                                                    placeholder="Rechercher un style..."
                                                    className={styles.musicStyleInput}
                                                />
                                                {selectedStyles.map((style) => (
                                                    <span key={style} className={styles.chip}>
                                                        {style}
                                                        <button type="button" onClick={() => handleRemoveStyle(style)}>×</button>
                                                    </span>
                                                ))}
                                            </div>

                                            {musicStyleInput && filteredStyles.length > 0 && (
                                                <ul className={styles.suggestions}>
                                                    {filteredStyles.map(style => (
                                                        <li key={style} onClick={() => handleStyleSelect(style)}>
                                                            {style}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.uploadForm__display__input}>
                                        <label className={styles.uploadForm__display__label}>Difficulté</label>
                                        <div className={styles.difficultyChoices}>
                                            {difficultyLevels.map((level) => (
                                                <button
                                                    key={level}
                                                    type="button"
                                                    className={`${styles.difficultyButton} ${
                                                        watch('difficulty') === level ? styles.active : ''
                                                    } ${styles[level.toLowerCase()]}`}
                                                    onClick={() => setValue('difficulty', level)}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                        {errors.difficulty && <p>{errors.difficulty.message}</p>}
                                    </div>

                                </div>

                                <div className={styles.stepTwo__buttons}>
                                    <button
                                        type="button"
                                        className={styles.stepButton}
                                        onClick={() => setCurrentStep(1)}
                                    >
                                        <Image src="/assets/img/icon/arrow-right.svg" alt="arrow icon" width={25} height={25} aria-hidden="true" style={{transform: "rotate(180deg)"}}/>
                                        Précédent
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.stepButton}
                                        onClick={() => setCurrentStep(3)}
                                    >
                                        <Image src="/assets/img/icon/arrow-right.svg" alt="arrow icon" width={25} height={25} aria-hidden="true"/>
                                        Suivant
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className={styles.stepThree}>
                                <h2>étape 3 : choisir <span className={styles.highlightTitle}>les paroles</span> de la musique</h2>

                                <div className={styles.stepThree__wrapper}>
                                    {/*<h3>Paroles</h3>*/}

                                    <div className={styles.stepThree__wrapper__lyrics}>
                                        {lyrics.length > 0 && (
                                            <div className={styles.stepThree__wrapper__lyrics__preview}>
                                                <div className={styles.sliderContainer} style={{height: `${70 * lyrics.length}px`}}>
                                                    <RangeSlider
                                                        aria-label={['début', 'fin']}
                                                        defaultValue={[invertValue(Math.floor(lyrics.length / 2) + 2), invertValue(2)]} // Inverse les valeurs pour le slider
                                                        onChange={(val: [number, number]) => {
                                                            const inverted = [invertValue(val[1] + 1), invertValue(val[0] + 2)]; // Inverse et ajuste les valeurs
                                                            setRangeIndex([Math.min(...inverted), Math.max(...inverted)]); // Respecte Début ≤ Fin
                                                        }}
                                                        orientation="vertical"
                                                        min={0}
                                                        max={lyrics.length}
                                                        step={1}
                                                    >
                                                        <RangeSliderTrack>
                                                            <RangeSliderFilledTrack/>
                                                        </RangeSliderTrack>
                                                        <RangeSliderThumb boxSize={6} index={1}>
                                                            <div className={styles.sliderThumbContainer}>
                                                                <div className={`${styles.sliderThumb} ${styles.start}`}>
                                                                    Début
                                                                </div>
                                                                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M14.4129 14.3371C14.779 14.7032 14.779 15.2971 14.4129 15.6633L10.0379 20.0383C9.6718 20.4044 9.07786 20.4044 8.71174 20.0383C8.34563 19.6721 8.34563 19.0782 8.71174 18.7121L12.4237 15.0002L8.71174 11.2883C8.34562 10.9221 8.34562 10.3282 8.71174 9.96209C9.07786 9.59597 9.6718 9.59597 10.0379 9.96209L14.4129 14.3371ZM21.9129 14.3371C22.279 14.7032 22.279 15.2971 21.9129 15.6633L17.5379 20.0383C17.1718 20.4044 16.5779 20.4044 16.2117 20.0383C15.8456 19.6721 15.8456 19.0782 16.2117 18.7121L19.9237 15.0002L16.2117 11.2883C15.8456 10.9221 15.8456 10.3282 16.2117 9.96209C16.5779 9.59597 17.1718 9.59597 17.5379 9.96209L21.9129 14.3371Z" fill="#2CC448"/>
                                                                </svg>
                                                            </div>
                                                        </RangeSliderThumb>
                                                        <RangeSliderThumb boxSize={6} index={0}>
                                                            <div className={styles.sliderThumbContainer}>
                                                                <div className={`${styles.sliderThumb} ${styles.end}`}>
                                                                    Fin
                                                                </div>
                                                                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M14.4129 14.3371C14.779 14.7032 14.779 15.2971 14.4129 15.6633L10.0379 20.0383C9.6718 20.4044 9.07786 20.4044 8.71174 20.0383C8.34563 19.6721 8.34563 19.0782 8.71174 18.7121L12.4237 15.0002L8.71174 11.2883C8.34562 10.9221 8.34562 10.3282 8.71174 9.96209C9.07786 9.59597 9.6718 9.59597 10.0379 9.96209L14.4129 14.3371ZM21.9129 14.3371C22.279 14.7032 22.279 15.2971 21.9129 15.6633L17.5379 20.0383C17.1718 20.4044 16.5779 20.4044 16.2117 20.0383C15.8456 19.6721 15.8456 19.0782 16.2117 18.7121L19.9237 15.0002L16.2117 11.2883C15.8456 10.9221 15.8456 10.3282 16.2117 9.96209C16.5779 9.59597 17.1718 9.59597 17.5379 9.96209L21.9129 14.3371Z" fill="#F1203C"/>
                                                                </svg>
                                                            </div>
                                                        </RangeSliderThumb>
                                                    </RangeSlider>
                                                </div>
                                                <div className={styles.lyricsDisplay}>
                                                    {lyrics.map(({time, text}, i) => {
                                                        const isInRange = i >= rangeIndex[0] && i <= rangeIndex[1];
                                                        return (
                                                            <div
                                                                key={i}
                                                                className={`${styles.lyricLine} ${isInRange ? styles.highlight : styles.deleted}`}
                                                            >
                                                                [{time.toFixed(2)}] {text}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.stepThree__wrapper__info}>
                                        <p> Il faut que la durée de la musique soit comprise entre 30 secondes et 1 minute 30.</p>

                                        <p>Pour changer les paroles il suffit de glisser les deux boutons <span style={{color: '#2CC448'}}>début</span> et <span style={{color: '#F1203C'}}>fin</span> entre les paroles voulues</p>

                                        <div className={styles.uploadForm__display__input}>
                                            <label>Temps</label>
                                            <p>{formatDuration(adjustedEndTime - adjustedStartTime)}</p>
                                        </div>

                                        <div className={styles.uploadForm__display__input}>
                                            <label>Preview</label>
                                            {audioUrl && (
                                                <div className={styles.audioPreview}>
                                                    {isPreparing ? (
                                                        <p>Préparation de l&apos;extrait...</p>
                                                    ) : (
                                                        <audio controls src={trimmedAudioUrl || audioUrl}/>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.uploadForm__display__input}>
                                            <label className={styles.uploadForm__display__label}>Statut</label>
                                            <div className={styles.difficultyChoices}>
                                                {statusOptions.map((statusLabel) => (
                                                    <button
                                                        key={statusLabel}
                                                        type="button"
                                                        className={`${styles.difficultyButton} ${
                                                            watch('status') === statusLabel ? styles.active : ''
                                                        } ${styles[statusLabel.toLowerCase()]}`}
                                                        onClick={() => setValue('status', statusLabel)}
                                                    >
                                                        {statusLabel === 'Live' ? 'En ligne' : 'Brouillon'}
                                                    </button>
                                                ))}
                                            </div>
                                            {errors.status && <p>{errors.status.message}</p>}
                                        </div>

                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className={styles.stepButton}
                                    onClick={() => setCurrentStep(2)}
                                >
                                    <Image src="/assets/img/icon/arrow-right.svg" alt="arrow icon" width={25} height={25} aria-hidden="true" style={{transform: "rotate(180deg)"}}/>
                                    Précédent
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={styles.stepper}>

                        <h2 className={styles.highlightTitle}>Étape 1 . ajouter les fichiers MP3 et LRC</h2>
                        <div className={styles.lineBreak}></div>
                        <h2 className={currentStep > 1 ? styles.highlightTitle : ''}>Étape 2 . ajouter des informations complémentaires</h2>
                        <div className={styles.lineBreak}></div>
                        <h2 className={currentStep === 3 ? styles.highlightTitle : ''}>Étape 3 . choisir les paroles de la musique</h2>

                        <button
                            type="submit"
                            disabled={currentStep !== 3 || isSubmitting || !watch('mp3File') || !watch('lrcFile') || !watch('coverFile') || !watch('title') || !watch('singer') || !watch('status') || !watch('difficulty') || watch('music_style')?.length === 0}
                            className={`${styles.submitButton}`}
                        >
                            {watch('mp3File') && watch('lrcFile') && watch('coverFile') && watch('title') && watch('singer') && watch('status') && watch('difficulty') && watch('music_style')?.length !== 0 &&
                                <Image src="/assets/img/icon/check-icon.svg" alt="check icon" width={25} height={25} aria-hidden="true"/>}

                            {isSubmitting ? 'Envoi en cours...' : 'Terminer'}
                        </button>
                    </div>
                </form>
            </main>
        </ChakraProvider>
    );
}