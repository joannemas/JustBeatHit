export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      games: {
        Row: {
          created_at: string
          game_ended_at: string | null
          game_name: Database["public"]["Enums"]["game_name"]
          game_started_at: string | null
          id: string
          mistakes: number | null
          score: number | null
          song_id: string | null
          status: Database["public"]["Enums"]["game_status"]
          typing_accuracy: number | null
          updated_at: string
          user_id: string
          word_speed: number | null
        }
        Insert: {
          created_at?: string
          game_ended_at?: string | null
          game_name: Database["public"]["Enums"]["game_name"]
          game_started_at?: string | null
          id?: string
          mistakes?: number | null
          score?: number | null
          song_id?: string | null
          status?: Database["public"]["Enums"]["game_status"]
          typing_accuracy?: number | null
          updated_at?: string
          user_id: string
          word_speed?: number | null
        }
        Update: {
          created_at?: string
          game_ended_at?: string | null
          game_name?: Database["public"]["Enums"]["game_name"]
          game_started_at?: string | null
          id?: string
          mistakes?: number | null
          score?: number | null
          song_id?: string | null
          status?: Database["public"]["Enums"]["game_status"]
          typing_accuracy?: number | null
          updated_at?: string
          user_id?: string
          word_speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "games_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "song"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string
          created_at: string
          id: string
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url: string
          created_at?: string
          id: string
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string
          created_at?: string
          id?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      song: {
        Row: {
          created_at: string
          difficulty: Database["public"]["Enums"]["song_difficulty"]
          id: string
          is_explicit: boolean
          singer: string
          status: Database["public"]["Enums"]["song_status"]
          title: string
        }
        Insert: {
          created_at?: string
          difficulty: Database["public"]["Enums"]["song_difficulty"]
          id?: string
          is_explicit: boolean
          singer: string
          status?: Database["public"]["Enums"]["song_status"]
          title: string
        }
        Update: {
          created_at?: string
          difficulty?: Database["public"]["Enums"]["song_difficulty"]
          id?: string
          is_explicit?: boolean
          singer?: string
          status?: Database["public"]["Enums"]["song_status"]
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      game_name: "karakaku" | "paroles-en-tete"
      game_status: "configuring" | "started" | "abandoned" | "finished"
      song_difficulty: "Easy" | "Medium" | "Hard"
      song_status: "Draft" | "Live" | "Removed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
