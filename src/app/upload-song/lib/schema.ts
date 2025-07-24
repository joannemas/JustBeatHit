import { z } from "zod";
import { ACCEPTED_IMAGE_TYPES, difficultyLevels, MAX_COVER_SIZE_MB, MAX_LRC_SIZE_MB, MAX_MP3_SIZE_MB, statusOptions } from "./constants";

const singleFileSchema = z
  .custom<FileList>()
  .refine(files => files?.length === 1, 'Ce champ est requis.')
//   .transform(files => files?.[0] as File);

// Schéma Zod pour valider le formulaire
export const songSchema = z.object({
    title: z.string().min(1, 'Le titre est requis'),
    singer: z.string().min(1, 'Le nom de l’artiste est requis'),
    is_explicit: z.boolean(),
    difficulty: z.enum(difficultyLevels),
    status: z.enum(statusOptions).optional(),
    is_premium: z.boolean().optional(),
    music_style: z.array(z.string()).min(1, 'Veuillez choisir au moins un style'),

    // ✅ Validation du fichier MP3
  mp3File: singleFileSchema.refine(
    (file) => file?.[0]?.type === 'audio/mpeg',
    'Le fichier doit être au format MP3.'
  ).refine(
    (file) => file?.[0]?.size <= MAX_MP3_SIZE_MB * 1024 * 1024,
    `La taille maximale du fichier MP3 est de ${MAX_MP3_SIZE_MB} Mo.`
  ),

  // ✅ Validation du fichier LRC
  lrcFile: singleFileSchema.refine(
    (file) => file?.[0]?.name.toLowerCase().endsWith('.lrc'),
    'Le fichier doit être au format LRC.'
  ).refine(
    (file) => file?.[0]?.size <= MAX_LRC_SIZE_MB * 1024 * 1024,
    `La taille maximale du fichier LRC est de ${MAX_LRC_SIZE_MB} Mo.`
  ),

  coverFile: singleFileSchema.refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file?.[0]?.type),
    'L’image doit être au format JPEG, PNG ou WebP.'
  ).refine(
    (file) => file?.[0]?.size <= MAX_COVER_SIZE_MB * 1024 * 1024,
    `La taille maximale de l'image est de ${MAX_COVER_SIZE_MB} Mo.`
  ),
});