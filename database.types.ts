export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      plan_permissions: {
        Row: {
          created_at: string
          id: number
          permission: Database["public"]["Enums"]["app_permission"]
          plan: Database["public"]["Enums"]["app_plan"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          permission: Database["public"]["Enums"]["app_permission"]
          plan: Database["public"]["Enums"]["app_plan"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          permission?: Database["public"]["Enums"]["app_permission"]
          plan?: Database["public"]["Enums"]["app_plan"]
          updated_at?: string
        }
        Relationships: []
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
      role_permissions: {
        Row: {
          created_at: string
          id: number
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          permission?: Database["public"]["Enums"]["app_permission"]
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
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
          uploader: string | null
          is_premium: boolean
        }
        Insert: {
          created_at?: string
          difficulty: Database["public"]["Enums"]["song_difficulty"]
          id?: string
          is_explicit?: boolean
          music_style?: string[] | null
          singer: string
          status?: Database["public"]["Enums"]["song_status"]
          title: string
          updated_at?: string | null
          uploader?: string | null
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
          uploader?: string | null
        }
        Relationships: []
      }
      user_plans: {
        Row: {
          created_at: string
          ended_at: string | null
          id: number
          plan: Database["public"]["Enums"]["app_plan"]
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: number
          plan: Database["public"]["Enums"]["app_plan"]
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: number
          plan?: Database["public"]["Enums"]["app_plan"]
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: number
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      current_user_permissions: {
        Row: {
          permission: Database["public"]["Enums"]["app_permission"] | null
          user_id: string | null
        }
        Relationships: []
      }
      current_user_roles: {
        Row: {
          role: Database["public"]["Enums"]["app_role"] | null
          user_id: string | null
        }
        Insert: {
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
        }
        Update: {
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      authorize: {
        Args: {
          requested_permission: Database["public"]["Enums"]["app_permission"]
        }
        Returns: boolean
      }
      custom_access_token_hook: {
        Args: { event: Json }
        Returns: Json
      }
      has_permission: {
        Args: { perm: Database["public"]["Enums"]["app_permission"] }
        Returns: boolean
      }
    }
    Enums: {
      app_permission:
        | "song.create"
        | "song.read"
        | "song.update"
        | "song.delete"
        | "song.delete.all"
        | "song.update.all"
      app_plan: "Premium" | "Freemium"
      app_role: "admin" | "user"
      game_name: "karakaku" | "paroles-en-tete"
      game_status: "configuring" | "started" | "abandoned" | "finished"
      song_difficulty: "Facile" | "Moyen" | "Difficile"
      song_status: "Draft" | "Live" | "Removed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_permission: [
        "song.create",
        "song.read",
        "song.update",
        "song.delete",
        "song.delete.all",
        "song.update.all",
      ],
      app_plan: ["Premium", "Freemium"],
      app_role: ["admin", "user"],
      game_name: ["karakaku", "paroles-en-tete"],
      game_status: ["configuring", "started", "abandoned", "finished"],
      song_difficulty: ["Facile", "Moyen", "Difficile"],
      song_status: ["Draft", "Live", "Removed"],
    },
  },
} as const
