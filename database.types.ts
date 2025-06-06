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
      best_score: {
        Row: {
          created_at: string
          game: Database["public"]["Enums"]["game_name"]
          game_id: string
          score: number
          song_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          game: Database["public"]["Enums"]["game_name"]
          game_id: string
          score: number
          song_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          game?: Database["public"]["Enums"]["game_name"]
          game_id?: string
          score?: number
          song_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "best_score_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "best_score_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "song"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "best_score_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      friendship: {
        Row: {
          user_id_1: string | null
          user_id_2: string | null
        }
        Insert: {
          user_id_1?: string | null
          user_id_2?: string | null
        }
        Update: {
          user_id_1?: string | null
          user_id_2?: string | null
        }
        Relationships: []
      }
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
          updated_at: string | null
          user_id: string
          username: string
        }
        Insert: {
          avatar_url: string
          created_at?: string
          updated_at?: string | null
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string
          created_at?: string
          updated_at?: string | null
          user_id?: string
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
          music_style: string[] | null
          singer: string
          status: Database["public"]["Enums"]["song_status"]
          title: string
          updated_at: string | null
          music_style: string[]
        }
        Insert: {
          created_at?: string
          difficulty: Database["public"]["Enums"]["song_difficulty"]
          id?: string
          is_explicit: boolean
          music_style?: string[] | null
          singer: string
          status?: Database["public"]["Enums"]["song_status"]
          title: string
          updated_at?: string | null
          music_style: string[]
        }
        Update: {
          created_at?: string
          difficulty?: Database["public"]["Enums"]["song_difficulty"]
          id?: string
          is_explicit?: boolean
          music_style?: string[] | null
          singer?: string
          status?: Database["public"]["Enums"]["song_status"]
          title?: string
          updated_at?: string | null
          music_style: string[]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      game_name: ["karakaku", "paroles-en-tete"],
      game_status: ["configuring", "started", "abandoned", "finished"],
      song_difficulty: ["Easy", "Medium", "Hard"],
      song_status: ["Draft", "Live", "Removed"],
    },
  },
} as const
