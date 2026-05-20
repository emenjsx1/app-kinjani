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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          channel: string
          client_id: string | null
          created_at: string
          id: string
          instance_id: string | null
          messages_handled: number
          name: string
          prompt: string | null
          status: string
          type: string
          type_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          channel?: string
          client_id?: string | null
          created_at?: string
          id?: string
          instance_id?: string | null
          messages_handled?: number
          name: string
          prompt?: string | null
          status?: string
          type?: string
          type_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          channel?: string
          client_id?: string | null
          created_at?: string
          id?: string
          instance_id?: string | null
          messages_handled?: number
          name?: string
          prompt?: string | null
          status?: string
          type?: string
          type_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          accent_color: string
          company: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          monthly_value: number
          name: string
          phone: string | null
          plan: string
          primary_color: string
          secondary_color: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_color?: string
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          monthly_value?: number
          name: string
          phone?: string | null
          plan?: string
          primary_color?: string
          secondary_color?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_color?: string
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          monthly_value?: number
          name?: string
          phone?: string | null
          plan?: string
          primary_color?: string
          secondary_color?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          action: string
          amount: number
          created_at: string
          description: string | null
          id: string
          user_id: string
        }
        Insert: {
          action: string
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          credits_balance: number
          email: string | null
          full_name: string | null
          id: string
          plan: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          credits_balance?: number
          email?: string | null
          full_name?: string | null
          id?: string
          plan?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          credits_balance?: number
          email?: string | null
          full_name?: string | null
          id?: string
          plan?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_api_keys: {
        Row: {
          api_key_encrypted: string
          created_at: string
          id: string
          is_valid: boolean
          provider: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key_encrypted: string
          created_at?: string
          id?: string
          is_valid?: boolean
          provider: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key_encrypted?: string
          created_at?: string
          id?: string
          is_valid?: boolean
          provider?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      websites: {
        Row: {
          chat_history: Json
          client_id: string | null
          config: Json | null
          created_at: string
          generated_html: string | null
          id: string
          name: string
          published_url: string | null
          status: string
          template: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chat_history?: Json
          client_id?: string | null
          config?: Json | null
          created_at?: string
          generated_html?: string | null
          id?: string
          name: string
          published_url?: string | null
          status?: string
          template?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chat_history?: Json
          client_id?: string | null
          config?: Json | null
          created_at?: string
          generated_html?: string | null
          id?: string
          name?: string
          published_url?: string | null
          status?: string
          template?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "websites_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_instances: {
        Row: {
          agent_id: string | null
          client_token: string | null
          connected_at: string | null
          created_at: string
          id: string
          instance_key: string | null
          instance_name: string
          is_for_client: boolean
          phone_number: string | null
          qr_code: string | null
          status: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          agent_id?: string | null
          client_token?: string | null
          connected_at?: string | null
          created_at?: string
          id?: string
          instance_key?: string | null
          instance_name: string
          is_for_client?: boolean
          phone_number?: string | null
          qr_code?: string | null
          status?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          agent_id?: string | null
          client_token?: string | null
          connected_at?: string | null
          created_at?: string
          id?: string
          instance_key?: string | null
          instance_name?: string
          is_for_client?: boolean
          phone_number?: string | null
          qr_code?: string | null
          status?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_instances_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
