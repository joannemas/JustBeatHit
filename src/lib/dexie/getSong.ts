import { localDb } from "./db";
import { LocalSong } from "./types";

/**
 * Retrieve a song from IndexedDB by using the song's ID
 * @returns {Promise<LocalSong | null>} Song with the provided ID or null if not found
 */
export async function getSong(id: string): Promise<LocalSong | null> {
    try {
      // Retrieve song by using the song's uuid
      const song = await localDb.song.get(id)
      return song?? null;
    } catch (error) {
      console.error("Error while retrieving songs :", error);
      return null;
    }
}