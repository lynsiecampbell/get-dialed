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
      ad_creatives: {
        Row: {
          ad_id: string
          created_at: string
          creative_id: string
          id: string
          position: number | null
        }
        Insert: {
          ad_id: string
          created_at?: string
          creative_id: string
          id?: string
          position?: number | null
        }
        Update: {
          ad_id?: string
          created_at?: string
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
      ads: {
        Row: {
          ad_format: string
          ad_name: string | null
          ad_set_name: string | null
          audience_type: string
          body: string | null
          campaign_budget: number | null
          campaign_id: string
          caption: string | null
          created_at: string | null
          creative_filename: string | null
          creative_group_id: string | null
          creative_id: string | null
          creative_type: string
          cta_label: string | null
          display_link: string | null
          headline: string | null
          id: string
          landing_page_id: string | null
          landing_page_url: string
          landing_page_url_with_utm: string | null
          medium: string | null
          meta_creative_id: string | null
          objective: string | null
          source: string | null
          start_time: string | null
          status: string
          updated_at: string | null
          user_id: string
          utm_link: string | null
          version: string
        }
        Insert: {
          ad_format?: string
          ad_name?: string | null
          ad_set_name?: string | null
          audience_type: string
          body?: string | null
          campaign_budget?: number | null
          campaign_id: string
          caption?: string | null
          created_at?: string | null
          creative_filename?: string | null
          creative_group_id?: string | null
          creative_id?: string | null
          creative_type?: string
          cta_label?: string | null
          display_link?: string | null
          headline?: string | null
          id?: string
          landing_page_id?: string | null
          landing_page_url: string
          landing_page_url_with_utm?: string | null
          medium?: string | null
          meta_creative_id?: string | null
          objective?: string | null
          source?: string | null
          start_time?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          utm_link?: string | null
          version: string
        }
        Update: {
          ad_format?: string
          ad_name?: string | null
          ad_set_name?: string | null
          audience_type?: string
          body?: string | null
          campaign_budget?: number | null
          campaign_id?: string
          caption?: string | null
          created_at?: string | null
          creative_filename?: string | null
          creative_group_id?: string | null
          creative_id?: string | null
          creative_type?: string
          cta_label?: string | null
          display_link?: string | null
          headline?: string | null
          id?: string
          landing_page_id?: string | null
          landing_page_url?: string
          landing_page_url_with_utm?: string | null
          medium?: string | null
          meta_creative_id?: string | null
          objective?: string | null
          source?: string | null
          start_time?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          utm_link?: string | null
          version?: string
        }
        Relationships: [
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
            referencedRelation: "messaging_matrix"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_assets: {
        Row: {
          asset_id: string
          asset_type: string
          campaign_id: string
          created_at: string
          id: string
        }
        Insert: {
          asset_id: string
          asset_type: string
          campaign_id: string
          created_at?: string
          id?: string
        }
        Update: {
          asset_id?: string
          asset_type?: string
          campaign_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_assets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_landing_pages: {
        Row: {
          campaign_id: string
          created_at: string | null
          id: string
          landing_page_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          id?: string
          landing_page_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          id?: string
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
          created_at: string | null
          id: string
          link_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          id?: string
          link_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
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
          created_at: string | null
          id: string
          messaging_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          id?: string
          messaging_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
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
          assets: Json | null
          buying_type: string | null
          campaign_type: Database["public"]["Enums"]["campaign_type"]
          created_at: string
          daily_budget: number | null
          end_date: string | null
          id: string
          messaging: Json | null
          name: string
          notes: string | null
          objective: string | null
          start_date: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assets?: Json | null
          buying_type?: string | null
          campaign_type?: Database["public"]["Enums"]["campaign_type"]
          created_at?: string
          daily_budget?: number | null
          end_date?: string | null
          id?: string
          messaging?: Json | null
          name: string
          notes?: string | null
          objective?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assets?: Json | null
          buying_type?: string | null
          campaign_type?: Database["public"]["Enums"]["campaign_type"]
          created_at?: string
          daily_budget?: number | null
          end_date?: string | null
          id?: string
          messaging?: Json | null
          name?: string
          notes?: string | null
          objective?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      creatives: {
        Row: {
          campaign: string | null
          created_at: string
          creative_group_type: string
          creative_name: string
          creative_type: string
          file_size_mb: number | null
          file_url: string | null
          format_dimensions: string | null
          id: string
          mime_type: string | null
          name: string | null
          notes: string | null
          parent_creative_id: string | null
          status: string
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign?: string | null
          created_at?: string
          creative_group_type?: string
          creative_name: string
          creative_type: string
          file_size_mb?: number | null
          file_url?: string | null
          format_dimensions?: string | null
          id?: string
          mime_type?: string | null
          name?: string | null
          notes?: string | null
          parent_creative_id?: string | null
          status?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign?: string | null
          created_at?: string
          creative_group_type?: string
          creative_name?: string
          creative_type?: string
          file_size_mb?: number | null
          file_url?: string | null
          format_dimensions?: string | null
          id?: string
          mime_type?: string | null
          name?: string | null
          notes?: string | null
          parent_creative_id?: string | null
          status?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creatives_parent_creative_id_fkey"
            columns: ["parent_creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_pages: {
        Row: {
          campaigns: string[] | null
          created_at: string
          id: string
          name: string | null
          notes: string | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          campaigns?: string[] | null
          created_at?: string
          id?: string
          name?: string | null
          notes?: string | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          campaigns?: string[] | null
          created_at?: string
          id?: string
          name?: string | null
          notes?: string | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      links: {
        Row: {
          ad_id: string | null
          audience: string | null
          campaign: string
          created_at: string
          creative_id: string | null
          generated_utm_url: string | null
          id: string
          landing_page_url: string
          link_name: string
          medium: string
          notes: string | null
          source: string
          updated_at: string
          user_id: string
          utm_medium_manual: string | null
          utm_source_manual: string | null
        }
        Insert: {
          ad_id?: string | null
          audience?: string | null
          campaign: string
          created_at?: string
          creative_id?: string | null
          generated_utm_url?: string | null
          id?: string
          landing_page_url: string
          link_name: string
          medium: string
          notes?: string | null
          source: string
          updated_at?: string
          user_id: string
          utm_medium_manual?: string | null
          utm_source_manual?: string | null
        }
        Update: {
          ad_id?: string | null
          audience?: string | null
          campaign?: string
          created_at?: string
          creative_id?: string | null
          generated_utm_url?: string | null
          id?: string
          landing_page_url?: string
          link_name?: string
          medium?: string
          notes?: string | null
          source?: string
          updated_at?: string
          user_id?: string
          utm_medium_manual?: string | null
          utm_source_manual?: string | null
        }
        Relationships: []
      }
      messaging: {
        Row: {
          body_copy: string[] | null
          campaign_id: string | null
          created_at: string | null
          cta_labels: string[] | null
          headlines: string[] | null
          id: string
          messaging_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body_copy?: string[] | null
          campaign_id?: string | null
          created_at?: string | null
          cta_labels?: string[] | null
          headlines?: string[] | null
          id?: string
          messaging_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body_copy?: string[] | null
          campaign_id?: string | null
          created_at?: string | null
          cta_labels?: string[] | null
          headlines?: string[] | null
          id?: string
          messaging_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messaging_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_ads: {
        Row: {
          ad_id: string
          created_at: string
          id: string
          messaging_id: string
        }
        Insert: {
          ad_id: string
          created_at?: string
          id?: string
          messaging_id: string
        }
        Update: {
          ad_id?: string
          created_at?: string
          id?: string
          messaging_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messaging_ads_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messaging_ads_messaging_id_fkey"
            columns: ["messaging_id"]
            isOneToOne: false
            referencedRelation: "messaging_matrix"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_creatives: {
        Row: {
          created_at: string
          creative_id: string
          id: string
          messaging_id: string
        }
        Insert: {
          created_at?: string
          creative_id: string
          id?: string
          messaging_id: string
        }
        Update: {
          created_at?: string
          creative_id?: string
          id?: string
          messaging_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messaging_creatives_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messaging_creatives_messaging_id_fkey"
            columns: ["messaging_id"]
            isOneToOne: false
            referencedRelation: "messaging_matrix"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_landing_pages: {
        Row: {
          created_at: string
          id: string
          landing_page_id: string
          messaging_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          landing_page_id: string
          messaging_id: string
        }
        Update: {
          created_at?: string
          id?: string
          landing_page_id?: string
          messaging_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messaging_landing_pages_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messaging_landing_pages_messaging_id_fkey"
            columns: ["messaging_id"]
            isOneToOne: false
            referencedRelation: "messaging_matrix"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_matrix: {
        Row: {
          campaign: string
          campaign_type: Database["public"]["Enums"]["campaign_type"]
          created_at: string | null
          headline: string | null
          headlines: string[] | null
          id: string
          notes: string | null
          primary_text: string | null
          primary_texts: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          campaign: string
          campaign_type?: Database["public"]["Enums"]["campaign_type"]
          created_at?: string | null
          headline?: string | null
          headlines?: string[] | null
          id?: string
          notes?: string | null
          primary_text?: string | null
          primary_texts?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          campaign?: string
          campaign_type?: Database["public"]["Enums"]["campaign_type"]
          created_at?: string | null
          headline?: string | null
          headlines?: string[] | null
          id?: string
          notes?: string | null
          primary_text?: string | null
          primary_texts?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          campaign: string | null
          copy: string | null
          created_at: string
          creative_id: string | null
          id: string
          notes: string | null
          platform: string
          post_id: string
          posted_url: string | null
          scheduled_date: string | null
          status: string
          updated_at: string
          user_id: string
          utm_link: string | null
        }
        Insert: {
          campaign?: string | null
          copy?: string | null
          created_at?: string
          creative_id?: string | null
          id?: string
          notes?: string | null
          platform: string
          post_id: string
          posted_url?: string | null
          scheduled_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
          utm_link?: string | null
        }
        Update: {
          campaign?: string | null
          copy?: string | null
          created_at?: string
          creative_id?: string | null
          id?: string
          notes?: string | null
          platform?: string
          post_id?: string
          posted_url?: string | null
          scheduled_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          utm_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
        ]
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
      campaign_type: "evergreen" | "product" | "content" | "promo" | "launch"
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
      campaign_type: ["evergreen", "product", "content", "promo", "launch"],
    },
  },
} as const
