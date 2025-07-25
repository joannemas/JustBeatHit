// Defining schema interface
export interface LocalSong {
  id: string // Primary key optionnal bcause auto generated
  title: string
  singer: string
  mp3File: Blob
  lrcFile: Blob
  coverFile: File
  created_at: Date
  is_premium: boolean
}

