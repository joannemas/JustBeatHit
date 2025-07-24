import Dexie, { Table } from 'dexie'
import { LocalSong } from './types'

// 2. Create custom Typed Dexie class
export class TypedDexie extends Dexie {
    song!: Table<LocalSong>
  
    constructor() {
      super('song')
      this.version(1).stores({
        song: 'id, title, singer, created_at', // Primary key 'id' auto increment and index on 'name' and 'singer'
      });
    }
  }
  
  export const localDb = new TypedDexie()