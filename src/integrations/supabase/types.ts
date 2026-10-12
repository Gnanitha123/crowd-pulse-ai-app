export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      crowd_history: {
        Row: {
          created_at: string
          crowd_level: string
          date: string
          hour: number
          id: string
          source: string
          temple_id: string
          visitor_count: number
          waiting_time_minutes: number
        }
        Insert: {
          created_at?: string
          crowd_level: string
          date: string
          hour: number
          id?: string
          source?: string
          temple_id: string
          visitor_count: number
          waiting_time_minutes: number
        }
        Update: {
          created_at?: string
          crowd_level?: string
          date?: string
          hour?: number
          id?: string
          source?: string
          temple_id?: string
          visitor_count?: number
          waiting_time_minutes?: number
        }
        Relationships: [
          {
            foreignKeyName: "crowd_history_temple_id_fkey"
            columns: ["temple_id"]
            isOneToOne: false
            referencedRelation: "temples"
            referencedColumns: ["id"]
          },
        ]
      }
      festivals: {
        Row: {
          end_date: string
          festival_name: string
          id: string
          importance: number
          start_date: string
          temple_id: string | null
        }
        Insert: {
          end_date: string
          festival_name: string
          id?: string
          importance?: number
          start_date: string
          temple_id?: string | null
        }
        Update: {
          end_date?: string
          festival_name?: string
          id?: string
          importance?: number
          start_date?: string
          temple_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "festivals_temple_id_fkey"
            columns: ["temple_id"]
            isOneToOne: false
            referencedRelation: "temples"
            referencedColumns: ["id"]
          },
        ]
      }
      holidays: {
        Row: {
          date: string
          holiday_type: string
          id: string
          name: string
        }
        Insert: {
          date: string
          holiday_type?: string
          id?: string
          name: string
        }
        Update: {
          date?: string
          holiday_type?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      prediction_feedback: {
        Row: {
          actual_crowd: number | null
          created_at: string
          id: string
          prediction_id: string
          user_id: string
          user_rating: number | null
        }
        Insert: {
          actual_crowd?: number | null
          created_at?: string
          id?: string
          prediction_id: string
          user_id: string
          user_rating?: number | null
        }
        Update: {
          actual_crowd?: number | null
          created_at?: string
          id?: string
          prediction_id?: string
          user_id?: string
          user_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prediction_feedback_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions: {
        Row: {
          confidence: number
          created_at: string
          crowd_level: string
          crowd_score: number
          estimated_max: number
          estimated_min: number
          id: string
          model_version: string
          prediction_date: string
          prediction_hour: number
          temple_id: string
          user_id: string
          waiting_max: number
          waiting_min: number
        }
        Insert: {
          confidence: number
          created_at?: string
          crowd_level: string
          crowd_score: number
          estimated_max: number
          estimated_min: number
          id?: string
          model_version: string
          prediction_date: string
          prediction_hour: number
          temple_id: string
          user_id: string
          waiting_max: number
          waiting_min: number
        }
        Update: {
          confidence?: number
          created_at?: string
          crowd_level?: string
          crowd_score?: number
          estimated_max?: number
          estimated_min?: number
          id?: string
          model_version?: string
          prediction_date?: string
          prediction_hour?: number
          temple_id?: string
          user_id?: string
          waiting_max?: number
          waiting_min?: number
        }
        Relationships: [
          {
            foreignKeyName: "predictions_temple_id_fkey"
            columns: ["temple_id"]
            isOneToOne: false
            referencedRelation: "temples"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      temples: {
        Row: {
          city: string
          country: string
          created_at: string
          id: string
          image_url: string | null
          is_sample: boolean
          latitude: number | null
          longitude: number | null
          name: string
          popularity_score: number
          state: string
        }
        Insert: {
          city: string
          country?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_sample?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          popularity_score?: number
          state: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_sample?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          popularity_score?: number
          state?: string
        }
        Relationships: []
      }
      video_analysis: {
        Row: {
          analysis_summary: string | null
          average_people: number | null
          confidence: number | null
          created_at: string
          crowd_level: string | null
          density_score: number | null
          id: string
          maximum_people: number | null
          status: string
          total_frames: number | null
          user_id: string
          video_url: string
        }
        Insert: {
          analysis_summary?: string | null
          average_people?: number | null
          confidence?: number | null
          created_at?: string
          crowd_level?: string | null
          density_score?: number | null
          id?: string
          maximum_people?: number | null
          status?: string
          total_frames?: number | null
          user_id: string
          video_url: string
        }
        Update: {
          analysis_summary?: string | null
          average_people?: number | null
          confidence?: number | null
          created_at?: string
          crowd_level?: string | null
          density_score?: number | null
          id?: string
          maximum_people?: number | null
          status?: string
          total_frames?: number | null
          user_id?: string
          video_url?: string
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
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
