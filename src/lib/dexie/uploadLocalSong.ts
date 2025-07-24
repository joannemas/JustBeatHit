import { hashFile } from "@/utils/hashFile"
import { localDb } from "./db"
import { v5 as uuidV5 } from "uuid"

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
    const [mp3Hash, lrcHash] = await Promise.all([hashFile(mp3File), hashFile(lrcFile)])
    const songUUID = uuidV5(mp3Hash+lrcHash, process.env.NEXT_PUBLIC_SONG_UUID_NAMESPACE!)

    console.debug(`Adding song : ${singer} - ${title}`)
    const id = await localDb.song.add({
      id: songUUID,
      title,
      singer,
      mp3File,
      lrcFile,
      coverFile,
      created_at: new Date()
    })

    console.debug(`Song added successfully width ID : ${id}`)
    return id
  } catch (error) {
    console.error("Error while adding song to the IndexedDB :", error)
    throw error
  }
}
  