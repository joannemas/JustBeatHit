import { localDb } from "./db"
import { LocalSong } from "./types"

/**
 * Addd song (MP3 and LRC) to the IndexedDB DB
 * @param {File} mp3File - The audio .mp3 file
 * @param {File} lrcFile - The lyrics .lrc file
 * @param {string} singer - The artist of the song
 * @param {string} title - The title of the song
 * @returns {Promise<number>} Id of added song
 */
export async function uploadLocalSong(mp3File: Blob, lrcFile: Blob, coverFile: File, singer: string, title: string): Promise<number> {
  if (!mp3File || !lrcFile) {
    throw new Error("Veuillez fournir un fichier MP3 et un fichier LRC.")
  }
  
  try {
    console.log(`Adding song : ${singer} - ${title}`)
    const id = await localDb.song.add({
      title,
      singer,
      mp3File,
      lrcFile,
      coverFile,
      created_at: new Date()
    })

    console.log(`Song added successfully width ID : ${id}`)
    return id
  } catch (error) {
    console.error("Error while adding song to the IndexedDB :", error)
    throw error
  }
}

/**
 * Récupère toutes les chansons de la base de données, triées par date d'ajout.
 * @returns {Promise<Musique[]>} Une promesse qui se résout avec un tableau de chansons.
 */
export async function listSongs(): Promise<LocalSong[]> {
  try {
    // On récupère les musiques, on les trie par 'dateAjout' et on inverse
    // l'ordre pour avoir les plus récentes en premier, puis on les convertit en tableau.
    const toutesLesMusiques = await localDb.song.orderBy('dateAjout').reverse().toArray();
    console.log("Musiques récupérées avec succès :", toutesLesMusiques);
    return toutesLesMusiques;
  } catch (error) {
    console.error("Erreur lors de la récupération des musiques :", error);
    // On retourne un tableau vide en cas d'erreur pour éviter de faire planter l'UI
    return [];
  }
}
  