import { localDb } from "./db";
import { LocalSong } from "./types";

/**
 * Retrieve all songs from IndexedDB and order them from recent to old by created_at
 * @returns {Promise<LocalSong[]>} Array of songs in IndexedDB
 */
export async function listLocalSongs(): Promise<LocalSong[]> {
    try {
      // Retrieve songs and order them from recent to old by created_at
      const toutesLesMusiques = await localDb.song.orderBy('dateAjout').reverse().toArray();
      console.debug("Song retrieved successfully :", toutesLesMusiques);
      return toutesLesMusiques;
    } catch (error) {
      console.error("Error while retrieving songs :", error);
      return [];
    }
}