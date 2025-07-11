'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {useEffect, useState} from 'react';
import { supabase } from '@/lib/supabase/client';
import { trimMp3 } from '@/lib/ffmpeg/trimMp3';
import { trimLrc } from '@/lib/lrc/trimLrc';
import styles from "@/stylesheets/uploadSong.module.scss";
import Image from "next/image";
import Navbar from "@/components/Navbar";

const difficultyLevels = ['Facile', 'Moyen', 'Difficile', 'Impossible'] as const;

// Schéma Zod pour valider le formulaire
const songSchema = z.object({
    title: z.string().min(1, 'Le titre est requis'),
    singer: z.string().min(1, 'Le nom de l’artiste est requis'),
    is_explicit: z.boolean(),
    difficulty: z.enum(difficultyLevels),
    status: z.enum(['Live', 'Draft']),
    mp3: z.any().refine((file) => file?.length === 1, 'Le fichier MP3 est requis'),
    lrc: z.any().refine((file) => file?.length === 1, 'Le fichier LRC est requis'),
    cover: z.any().refine((file) => file?.length === 1, 'L’image de couverture est requise'),
    is_premium: z.boolean(),
});

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
    const [range, setRange] = useState({ min: 0, max: 90 });
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

    const onSubmit = async (data: SongFormData) => {
        setIsSubmitting(true);

        const { title, singer, is_explicit, difficulty, status, mp3, lrc, cover, is_premium } = data;
        const folderPath = `${singer} - ${title}`.trim();

        const mp3File = mp3[0];
        const lrcFile = lrc[0];
        const coverFile = cover[0];
        const duration = range.max - range.min;
        const trimmedMp3Blob = await trimMp3(mp3File, range.min, duration);
        const trimmedLrcBlob = await trimLrc(lrcFile, range.min, range.max);


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
            .upload(`${folderPath}/cover.${coverFile.name.split('.').pop()}`, coverFile, {
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
                is_premium
            });

        if (insertError) {
            console.error('Erreur à l’insertion:', insertError.message);
            alert("Échec de l'insertion dans la base de données");
            setIsSubmitting(false);
            return;
        }

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
                const defaultEnd = Math.min(duration, 90);
                setRange({ min: 0, max: defaultEnd });
            });
        }
    };

    // Découpage automatique avec délai sauf au premier import
    useEffect(() => {
        if (!originalMp3File) return;

        // On affiche immédiatement "Préparation..." dès que range change
        setIsPreparing(true);

        const trim = async () => {
            setIsTrimming(true);
            try {
                const trimmedBlob = await trimMp3(originalMp3File, range.min, range.max - range.min);
                const previewUrl = URL.createObjectURL(trimmedBlob);
                setTrimmedAudioUrl(previewUrl);
            } catch (err) {
                console.error('Erreur lors du découpage de prévisualisation :', err);
            } finally {
                setIsTrimming(false);
                setIsPreparing(false);
                setHasInitialTrim(true);
            }
        };

        const delay = hasInitialTrim ? 1500 : 200;
        const timeout = setTimeout(trim, delay);

        return () => clearTimeout(timeout);
    }, [range, originalMp3File]);

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
        <main className={styles.upload}>
            <Navbar/>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.uploadForm}>
                <div className={styles.uploadForm__display}>
                    {currentStep === 1 && (
                        <div className={styles.stepOne}>
                            <h2>Étape 1 . ajouter le fichier <span className={styles.highlightTitle}>mp3</span> et le
                                fichier <span className={styles.highlightTitle}>lrc</span></h2>

                            <div>
                                <div className={styles.stepOne__filesWrapper}>
                                    <div className={styles.fileInput}>
                                        <label htmlFor="mp3">Audio</label>
                                        <div className={`${styles.fileInput__display} ${originalMp3File ? styles.active : ''}`}>
                                            <input
                                                id="mp3"
                                                type="file"
                                                accept=".mp3"
                                                {...register('mp3')}
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

                                        {typeof errors.mp3?.message === 'string' && (
                                            <p className={styles.error}>{errors.mp3.message}</p>
                                        )}
                                    </div>

                                    <div className={styles.fileInput}>
                                        <label htmlFor="mp3">Paroles</label>
                                        <div className={`${styles.fileInput__display} ${lrcFile ? styles.active : ''}`}>
                                            <input
                                                type="file"
                                                accept=".lrc"
                                                {...register('lrc')}
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

                                        {typeof errors.lrc?.message === 'string' && (
                                            <p>{errors.lrc?.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.uploadForm__display__input}>
                                    <label>Statut</label>
                                    <select {...register('status')}>
                                        <option value="" disabled selected hidden>-- Choisir --</option>
                                        <option value="Live">Live</option>
                                        <option value="Draft">Brouillon</option>
                                    </select>
                                    {errors.status && <p>{errors.status.message}</p>}
                                </div>

                                <div className={styles.uploadForm__display__checkbox}>
                                    <label>Chanson Premium ?</label>
                                    <input type="checkbox" {...register('is_premium')} />
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
                            <h2>étape 2 : ajouter des <span className={styles.highlightTitle}>informations complémentaires</span>
                            </h2>

                            <div className={styles.stepTwo__wrapper}>
                                <div className={styles.stepTwo__wrapper__inputs}>
                                    <div className={styles.fileInput}>
                                        <label>Cover</label>
                                        <div className={`${styles.fileInput__display} ${coverFile ? styles.active : ''}`}>
                                            {coverPreview &&
                                                <img src={coverPreview} alt="cover" className={styles.fileInput__background}/>}
                                            <input
                                                type="file"
                                                accept=".png,.jpg,.jpeg"
                                                {...register('cover')}
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

                                        {typeof errors.cover?.message === 'string' && (
                                            <p>{errors.cover.message}</p>
                                        )}
                                    </div>

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

                                    {audioUrl && (
                                        <div className={styles.audioPreview}>
                                            {isPreparing ? (
                                                <p>Préparation de l&apos;extrait...</p>
                                            ) : (
                                                <audio controls src={trimmedAudioUrl || audioUrl}/>
                                            )}
                                        </div>
                                    )}

                                    {audioUrl && (
                                        <div className="double_range_slider_box">
                                            <div className="double_range_slider">
                            <span
                                className="range_track"
                                style={{
                                    left: `${(range.min / audioDuration) * 100}%`,
                                    width: `${((range.max - range.min) / audioDuration) * 100}%`,
                                }}
                            ></span>

                                                <input
                                                    type="range"
                                                    className="min"
                                                    min={0}
                                                    max={Math.max(audioDuration - 30, 1)}
                                                    value={range.min}
                                                    step={0.1}
                                                    onChange={(e) => {
                                                        const newMin = Number(e.target.value);
                                                        if (newMin < range.max - 30) {
                                                            setRange((prev) => ({...prev, min: newMin}));
                                                        }
                                                    }}
                                                />
                                                <input
                                                    type="range"
                                                    className="max"
                                                    min={30}
                                                    max={audioDuration}
                                                    value={range.max}
                                                    step={0.1}
                                                    onChange={(e) => {
                                                        const newMax = Number(e.target.value);
                                                        if (newMax > range.min + 30 && newMax <= audioDuration && newMax - range.min <= 90) {
                                                            setRange((prev) => ({...prev, max: newMax}));
                                                        }
                                                    }}
                                                />

                                                <div className="minvalue">Début : {range.min.toFixed(2)}s</div>
                                                <div className="maxvalue">Fin : {range.max.toFixed(2)}s</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.stepTwo__wrapper__lyrics}>
                                    {lyrics.length > 0 && (
                                        <div className={styles.stepTwo__wrapper__lyrics__preview}>
                                            <h3>Paroles</h3>
                                            {lyrics.map(({time, text}, i) => {
                                                const isInRange = time >= range.min && time <= range.max;
                                                return (
                                                    <div
                                                        key={i}
                                                        className={isInRange ? styles.highlight : styles.deleted}
                                                    >
                                                        [{time.toFixed(2)}] {text}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="button"
                                className={styles.stepButton}
                                onClick={() => setCurrentStep(1)}
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
                    <h2 className={currentStep === 2 ? styles.highlightTitle : ''}>Étape 2 . ajouter des informations
                        complémentaires</h2>

                    <button
                        type="submit"
                        disabled={isSubmitting || !watch('mp3') || !watch('lrc') || !watch('cover') || !watch('title') || !watch('singer') || !watch('status') || !watch('difficulty')}
                        className={`${styles.submitButton}`}
                    >
                        {watch('mp3') && watch('lrc') && watch('cover') && watch('title') && watch('singer') && watch('status') && watch('difficulty') &&
                            <Image src="/assets/img/icon/check-icon.svg" alt="check icon" width={25} height={25} aria-hidden="true"/>}

                        {isSubmitting ? 'Envoi en cours...' : 'Terminer'}
                    </button>
                </div>

            </form>

        </main>
    );
}