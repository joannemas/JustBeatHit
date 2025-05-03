'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';


// Schéma Zod pour valider le formulaire
const songSchema = z.object({
    title: z.string().min(1, 'Le titre est requis'),
    singer: z.string().min(1, 'Le nom de l’artiste est requis'),
    is_explicit: z.boolean(),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    status: z.enum(['Live', 'Draft']),
    mp3: z
        .any()
        .refine((file) => file?.length === 1, 'Le fichier MP3 est requis'),
    lrc: z
        .any()
        .refine((file) => file?.length === 1, 'Le fichier LRC est requis'),
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

    const onSubmit = async (data: SongFormData) => {
        setIsSubmitting(true);

        const { title, singer, is_explicit, difficulty, status, mp3, lrc } = data;
        const folderPath = `${singer} - ${title}`.trim();

        const mp3File = mp3[0];
        const lrcFile = lrc[0];

        // Upload du MP3
        const { error: mp3Error } = await supabase.storage
            .from('song')
            .upload(`${folderPath}/song.mp3`, mp3File, {
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
            .upload(`${folderPath}/lyrics.lrc`, lrcFile, {
                cacheControl: '3600',
                upsert: true,
            });

        if (lrcError) {
            console.error('Erreur à l’upload du LRC:', lrcError.message);
            alert("Échec de l'upload du fichier LRC");
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



    return (
        <main className="max-w-xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-6">Uploader une chanson</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label className="block font-semibold">Titre</label>
                    <input
                        type="text"
                        {...register('title')}
                        className="w-full border p-2 rounded"
                    />
                    {errors.title && <p className="text-red-500">{errors.title.message}</p>}
                </div>

                <div>
                    <label className="block font-semibold">Artiste</label>
                    <input
                        type="text"
                        {...register('singer')}
                        className="w-full border p-2 rounded"
                    />
                    {errors.singer && <p className="text-red-500">{errors.singer.message}</p>}
                </div>

                <div>
                    <label className="inline-flex items-center space-x-2">
                        <input type="checkbox" {...register('is_explicit')} />
                        <span>Contenu explicite</span>
                    </label>
                </div>

                <div>
                    <label className="block font-semibold">Difficulté</label>
                    <select {...register('difficulty')} className="w-full border p-2 rounded">
                        <option value="">-- Choisir --</option>
                        <option value="Easy">Facile</option>
                        <option value="Medium">Moyenne</option>
                        <option value="Hard">Difficile</option>
                    </select>
                    {errors.difficulty && <p className="text-red-500">{errors.difficulty.message}</p>}
                </div>

                <div>
                    <label className="block font-semibold">Statut</label>
                    <select {...register('status')} className="w-full border p-2 rounded">
                        <option value="">-- Choisir --</option>
                        <option value="Live">Live</option>
                        <option value="Draft">Brouillon</option>
                    </select>
                    {errors.status && <p className="text-red-500">{errors.status.message}</p>}
                </div>

                <div>
                    <label className="block font-semibold">Fichier MP3</label>
                    <input type="file" accept=".mp3" {...register('mp3')} />
                    {typeof errors.mp3?.message === 'string' && (
                        <p className="text-red-500">{errors.mp3?.message}</p>
                    )}
                </div>

                <div>
                    <label className="block font-semibold">Fichier LRC</label>
                    <input type="file" accept=".lrc" {...register('lrc')} />
                    {typeof errors.lrc?.message === 'string' && (
                        <p className="text-red-500">{errors.lrc?.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {isSubmitting ? 'Envoi en cours...' : 'Ajouter la chanson'}
                </button>
            </form>
        </main>
    );
}