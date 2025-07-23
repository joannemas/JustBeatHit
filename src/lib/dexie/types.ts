// Defining schema interface
export interface LocalSong {
  uuid: string // Primary key optionnal bcause auto generated
  title: string
  singer: string
  mp3File: Blob
  lrcFile: Blob
  coverFile: File
  created_at: Date
}

