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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ad_campaigns: {
        Row: {
          bid_strategy: string | null
          budget_type: string | null
          campaign_id: string
          created_at: string | null
          daily_budget: number | null
          end_date: string | null
          id: string
          lifetime_budget: number | null
          name: string
          notes: string | null
          objective: string | null
          platform: string
          spent: number | null
          start_date: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bid_strategy?: string | null
          budget_type?: string | null
          campaign_id: string
          created_at?: string | null
          daily_budget?: number | null
          end_date?: string | null
          id?: string
          lifetime_budget?: number | null
          name: string
          notes?: string | null
          objective?: string | null
          platform: string
          spent?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bid_strategy?: string | null
          budget_type?: string | null
          campaign_id?: string
          created_at?: string | null
          daily_budget?: number | null
          end_date?: string | null
          id?: string
          lifetime_budget?: number | null
          name?: string
          notes?: string | null
          objective?: string | null
          platform?: string
          spent?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_campaigns_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_creatives: {
        Row: {
          ad_id: string
          created_at: string | null
          creative_id: string
          id: string
          position: number | null
        }
        Insert: {
          ad_id: string
          created_at?: string | null
          creative_id: string
          id?: string
          position?: number | null
        }
        Update: {
          ad_id?: string
          created_at?: string | null
          creative_id?: string
          id?: string
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_creatives_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_creatives_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_exports: {
        Row: {
          ad_count: number | null
          ad_ids: string[] | null
          campaign_id: string | null
          created_at: string
          export_format: string | null
          file_name: string | null
          id: string
          platform: string
          user_id: string
        }
        Insert: {
          ad_count?: number | null
          ad_ids?: string[] | null
          campaign_id?: string | null
          created_at?: string
          export_format?: string | null
          file_name?: string | null
          id?: string
          platform?: string
          user_id: string
        }
        Update: {
          ad_count?: number | null
          ad_ids?: string[] | null
          campaign_id?: string | null
          created_at?: string
          export_format?: string | null
          file_name?: string | null
          id?: string
          platform?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_exports_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_sets: {
        Row: {
          ad_campaign_id: string
          bid_amount: number | null
          bid_strategy: string | null
          budget_type: string | null
          created_at: string | null
          daily_budget: number | null
          end_date: string | null
          id: string
          lifetime_budget: number | null
          name: string
          notes: string | null
          optimization_goal: string | null
          placements: Json | null
          spent: number | null
          start_date: string | null
          status: string
          targeting: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ad_campaign_id: string
          bid_amount?: number | null
          bid_strategy?: string | null
          budget_type?: string | null
          created_at?: string | null
          daily_budget?: number | null
          end_date?: string | null
          id?: string
          lifetime_budget?: number | null
          name: string
          notes?: string | null
          optimization_goal?: string | null
          placements?: Json | null
          spent?: number | null
          start_date?: string | null
          status?: string
          targeting?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ad_campaign_id?: string
          bid_amount?: number | null
          bid_strategy?: string | null
          budget_type?: string | null
          created_at?: string | null
          daily_budget?: number | null
          end_date?: string | null
          id?: string
          lifetime_budget?: number | null
          name?: string
          notes?: string | null
          optimization_goal?: string | null
          placements?: Json | null
          spent?: number | null
          start_date?: string | null
          status?: string
          targeting?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_sets_ad_campaign_id_fkey"
            columns: ["ad_campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          ad_format: string | null
          ad_set_id: string | null
          audience_type: string | null
          body_copy_index: number | null
          campaign_id: string
          created_at: string
          creative_id: string | null
          cta_index: number | null
          headline_index: number | null
          id: string
          landing_page_id: string | null
          messaging_id: string | null
          platform: string | null
          status: string
          updated_at: string
          user_id: string
          version: string | null
        }
        Insert: {
          ad_format?: string | null
          ad_set_id?: string | null
          audience_type?: string | null
          body_copy_index?: number | null
          campaign_id: string
          created_at?: string
          creative_id?: string | null
          cta_index?: number | null
          headline_index?: number | null
          id?: string
          landing_page_id?: string | null
          messaging_id?: string | null
          platform?: string | null
          status?: string
          updated_at?: string
          user_id: string
          version?: string | null
        }
        Update: {
          ad_format?: string | null
          ad_set_id?: string | null
          audience_type?: string | null
          body_copy_index?: number | null
          campaign_id?: string
          created_at?: string
          creative_id?: string | null
          cta_index?: number | null
          headline_index?: number | null
          id?: string
          landing_page_id?: string | null
          messaging_id?: string | null
          platform?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_ad_set_id_fkey"
            columns: ["ad_set_id"]
            isOneToOne: false
            referencedRelation: "ad_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_messaging_id_fkey"
            columns: ["messaging_id"]
            isOneToOne: false
            referencedRelation: "messaging"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_variants: {
        Row: {
          brand_headlines: string[] | null
          copy: string[] | null
          created_at: string
          id: string
          messaging_id: string
          sort_order: number | null
          taglines: string[] | null
          updated_at: string
          user_id: string
          value_props: string[] | null
          variant_name: string
        }
        Insert: {
          brand_headlines?: string[] | null
          copy?: string[] | null
          created_at?: string
          id?: string
          messaging_id: string
          sort_order?: number | null
          taglines?: string[] | null
          updated_at?: string
          user_id: string
          value_props?: string[] | null
          variant_name: string
        }
        Update: {
          brand_headlines?: string[] | null
          copy?: string[] | null
          created_at?: string
          id?: string
          messaging_id?: string
          sort_order?: number | null
          taglines?: string[] | null
          updated_at?: string
          user_id?: string
          value_props?: string[] | null
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_variants_messaging_id_fkey"
            columns: ["messaging_id"]
            isOneToOne: false
            referencedRelation: "messaging"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_creatives: {
        Row: {
          campaign_id: string
          created_at: string
          creative_id: string
          id: string
          is_primary: boolean | null
        }
        Insert: {
          campaign_id: string
          created_at?: string
          creative_id: string
          id?: string
          is_primary?: boolean | null
        }
        Update: {
          campaign_id?: string
          created_at?: string
          creative_id?: string
          id?: string
          is_primary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_creatives_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_creatives_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_landing_pages: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          is_primary: boolean | null
          landing_page_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          landing_page_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          landing_page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_landing_pages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_landing_pages_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_links: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          link_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          link_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          link_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_links_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_links_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_messaging: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          messaging_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          messaging_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          messaging_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_messaging_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_messaging_messaging_id_fkey"
            columns: ["messaging_id"]
            isOneToOne: false
            referencedRelation: "messaging"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          budget: number | null
          created_at: string
          end_date: string | null
          goal: string | null
          id: string
          name: string
          notes: string | null
          spent: number | null
          start_date: string | null
          status: string
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          end_date?: string | null
          goal?: string | null
          id?: string
          name: string
          notes?: string | null
          spent?: number | null
          start_date?: string | null
          status?: string
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          end_date?: string | null
          goal?: string | null
          id?: string
          name?: string
          notes?: string | null
          spent?: number | null
          start_date?: string | null
          status?: string
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      creatives: {
        Row: {
          created_at: string
          creative_type: string
          id: string
          image_urls: string[] | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          creative_type: string
          id?: string
          image_urls?: string[] | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          creative_type?: string
          id?: string
          image_urls?: string[] | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_variants: {
        Row: {
          body_copy: string[] | null
          created_at: string
          ctas: string[] | null
          id: string
          messaging_id: string
          preview_texts: string[] | null
          sort_order: number | null
          subject_lines: string[] | null
          updated_at: string
          user_id: string
          variant_name: string
        }
        Insert: {
          body_copy?: string[] | null
          created_at?: string
          ctas?: string[] | null
          id?: string
          messaging_id: string
          preview_texts?: string[] | null
          sort_order?: number | null
          subject_lines?: string[] | null
          updated_at?: string
          user_id: string
          variant_name: string
        }
        Update: {
          body_copy?: string[] | null
          created_at?: string
          ctas?: string[] | null
          id?: string
          messaging_id?: string
          preview_texts?: string[] | null
          sort_order?: number | null
          subject_lines?: string[] | null
          updated_at?: string
          user_id?: string
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_variants_messaging_id_fkey"
            columns: ["messaging_id"]
            isOneToOne: false
            referencedRelation: "messaging"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_pages: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      links: {
        Row: {
          ad_id: string | null
          additional_params: Json | null
          base_url: string
          created_at: string
          full_url: string | null
          id: string
          link_name: string | null
          link_type: string
          notes: string | null
          template: string | null
          updated_at: string
          user_id: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          ad_id?: string | null
          additional_params?: Json | null
          base_url: string
          created_at?: string
          full_url?: string | null
          id?: string
          link_name?: string | null
          link_type: string
          notes?: string | null
          template?: string | null
          updated_at?: string
          user_id: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          ad_id?: string | null
          additional_params?: Json | null
          base_url?: string
          created_at?: string
          full_url?: string | null
          id?: string
          link_name?: string | null
          link_type?: string
          notes?: string | null
          template?: string | null
          updated_at?: string
          user_id?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "links_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging: {
        Row: {
          body_copy: string[] | null
          created_at: string
          ctas: string[] | null
          headlines: string[] | null
          id: string
          messaging_type: string
          name: string
          notes: string | null
          subject_lines: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body_copy?: string[] | null
          created_at?: string
          ctas?: string[] | null
          headlines?: string[] | null
          id?: string
          messaging_type: string
          name: string
          notes?: string | null
          subject_lines?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body_copy?: string[] | null
          created_at?: string
          ctas?: string[] | null
          headlines?: string[] | null
          id?: string
          messaging_type?: string
          name?: string
          notes?: string | null
          subject_lines?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          referrer_url: string | null
          signup_ip: unknown
          signup_user_agent: string | null
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          referrer_url?: string | null
          signup_ip?: unknown
          signup_user_agent?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          referrer_url?: string | null
          signup_ip?: unknown
          signup_user_agent?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      backfill_ad_landing_page_ids: { Args: never; Returns: undefined }
      generate_utm_url: {
        Args: {
          base_url: string
          utm_campaign: string
          utm_content?: string
          utm_medium: string
          utm_source: string
        }
        Returns: string
      }
      get_utm_content: { Args: { ad_format: string }; Returns: string }
      slugify_utm: { Args: { text: string }; Returns: string }
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
