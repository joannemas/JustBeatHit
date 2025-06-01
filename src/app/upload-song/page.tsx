'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {useEffect, useState} from 'react';
import { supabase } from '@/lib/supabase/client';
import { trimMp3 } from '@/lib/ffmpeg/trimMp3';
import { trimLrc } from '@/lib/lrc/trimLrc';

// Schéma Zod pour valider le formulaire
const songSchema = z.object({
    title: z.string().min(1, 'Le titre est requis'),
    singer: z.string().min(1, 'Le nom de l’artiste est requis'),
    is_explicit: z.boolean(),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    status: z.enum(['Live', 'Draft']),
    mp3: z.any().refine((file) => file?.length === 1, 'Le fichier MP3 est requis'),
    lrc: z.any().refine((file) => file?.length === 1, 'Le fichier LRC est requis'),
    cover: z.any().refine((file) => file?.length === 1, 'L’image de couverture est requise'),
});

type SongFormData = z.infer<typeof songSchema>;

export default function UploadSongPage() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SongFormData>({
        resolver: zodResolver(songSchema),
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioDuration, setAudioDuration] = useState<number>(0);
    const [range, setRange] = useState({ min: 0, max: 90 });
    const [lyrics, setLyrics] = useState<{ time: number; text: string }[]>([]);
    const [originalMp3File, setOriginalMp3File] = useState<File | null>(null);
    const [trimmedAudioUrl, setTrimmedAudioUrl] = useState<string | null>(null);
    const [isTrimming, setIsTrimming] = useState(false);
    const [hasInitialTrim, setHasInitialTrim] = useState(false);
    const [isPreparing, setIsPreparing] = useState(false);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);


    const onSubmit = async (data: SongFormData) => {
        setIsSubmitting(true);

        const { title, singer, is_explicit, difficulty, status, mp3, lrc, cover } = data;
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
            setOriginalMp3File(file); // <-- ici
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

    return (
        <main className="upload">
            <h1 className="text-3xl font-bold mb-6">Uploader une chanson</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="upload-form">
                <div className="upload-form__input">
                    <label>Titre</label>
                    <input
                        type="text"
                        {...register('title')}
                    />
                    {errors.title && <p>{errors.title.message}</p>}
                </div>

                <div className="upload-form__input">
                    <label>Artiste</label>
                    <input
                        type="text"
                        {...register('singer')}
                    />
                    {errors.singer && <p>{errors.singer.message}</p>}
                </div>

                <div className="upload-form__input">
                    <label>
                        <input type="checkbox" {...register('is_explicit')} />
                        <span>Contenu explicite</span>
                    </label>
                </div>

                <div className="upload-form__input">
                    <label>Difficulté</label>
                    <select {...register('difficulty')}>
                        <option value="">-- Choisir --</option>
                        <option value="Easy">Facile</option>
                        <option value="Medium">Moyenne</option>
                        <option value="Hard">Difficile</option>
                    </select>
                    {errors.difficulty && <p>{errors.difficulty.message}</p>}
                </div>

                <div className="upload-form__input">
                    <label>Statut</label>
                    <select {...register('status')}>
                        <option value="">-- Choisir --</option>
                        <option value="Live">Live</option>
                        <option value="Draft">Brouillon</option>
                    </select>
                    {errors.status && <p>{errors.status.message}</p>}
                </div>

                <div className="upload-form__input">
                    <label>Image de couverture</label>
                    <input
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        {...register('cover')}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setCoverPreview(URL.createObjectURL(file));
                        }}
                    />
                    {typeof errors.cover?.message === 'string' && (
                        <p className="text-red-500">{errors.cover.message}</p>
                    )}
                </div>

                {coverPreview && (
                    <div className="cover-preview">
                        <img src={coverPreview} alt="Prévisualisation de la cover" width="150"/>
                    </div>
                )}

                <div>
                    <label className="upload-form__input">Fichier MP3</label>
                    <input type="file" accept=".mp3" {...register('mp3')} onChange={onMP3Change}/>
                    {typeof errors.mp3?.message === 'string' && (
                        <p>{errors.mp3?.message}</p>
                    )}
                </div>

                <div className="upload-form__input">
                    <label>Fichier LRC</label>
                    <input
                        type="file"
                        accept=".lrc"
                        {...register('lrc')}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) parseLRC(file);
                        }}
                    />
                    {typeof errors.lrc?.message === 'string' && (
                        <p className="text-red-500">{errors.lrc?.message}</p>
                    )}
                </div>

                {audioUrl && (
                    <div className="audio-preview">
                        {isPreparing ? (
                            <p>Préparation de l'extrait...</p>
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

                {lyrics.length > 0 && (
                    <div className="lyrics-preview">
                        {lyrics.map(({time, text}, i) => {
                            const isInRange = time >= range.min && time <= range.max;
                            return (
                                <div
                                    key={i}
                                    className={isInRange ? 'highlight' : 'deleted'}
                                >
                                    [{time.toFixed(2)}] {text}
                                </div>
                            );
                        })}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="submit-btn"
                >
                    {isSubmitting ? 'Envoi en cours...' : 'Ajouter la chanson'}
                </button>
            </form>
        </main>
    );
}