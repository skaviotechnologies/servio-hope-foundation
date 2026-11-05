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
      about_sections: {
        Row: {
          body: string
          created_at: string
          id: string
          image_url: string | null
          published: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      assistance_requests: {
        Row: {
          archived: boolean
          assigned_to: string
          category: string
          community_name: string | null
          consent: boolean
          country: string
          created_at: string
          description: string
          district: string | null
          email: string | null
          full_name: string
          id: string
          internal_notes: string
          outcome: string
          phone: string | null
          preferred_contact: string
          requester_type: string
          status: string
          updated_at: string
        }
        Insert: {
          archived?: boolean
          assigned_to?: string
          category: string
          community_name?: string | null
          consent?: boolean
          country?: string
          created_at?: string
          description: string
          district?: string | null
          email?: string | null
          full_name: string
          id?: string
          internal_notes?: string
          outcome?: string
          phone?: string | null
          preferred_contact?: string
          requester_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          archived?: boolean
          assigned_to?: string
          category?: string
          community_name?: string | null
          consent?: boolean
          country?: string
          created_at?: string
          description?: string
          district?: string | null
          email?: string | null
          full_name?: string
          id?: string
          internal_notes?: string
          outcome?: string
          phone?: string | null
          preferred_contact?: string
          requester_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          body: string
          created_at: string
          currency: string
          end_date: string | null
          funding_target: number | null
          id: string
          image_url: string | null
          program_id: string | null
          project_id: string | null
          published: boolean
          slug: string
          sort_order: number
          start_date: string | null
          summary: string
          title: string
          updated_at: string
          updates: Json
        }
        Insert: {
          body?: string
          created_at?: string
          currency?: string
          end_date?: string | null
          funding_target?: number | null
          id?: string
          image_url?: string | null
          program_id?: string | null
          project_id?: string | null
          published?: boolean
          slug: string
          sort_order?: number
          start_date?: string | null
          summary?: string
          title: string
          updated_at?: string
          updates?: Json
        }
        Update: {
          body?: string
          created_at?: string
          currency?: string
          end_date?: string | null
          funding_target?: number | null
          id?: string
          image_url?: string | null
          program_id?: string | null
          project_id?: string | null
          published?: boolean
          slug?: string
          sort_order?: number
          start_date?: string | null
          summary?: string
          title?: string
          updated_at?: string
          updates?: Json
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          campaign_id: string | null
          created_at: string
          currency: string
          designation: string
          donor_email: string
          donor_name: string
          donor_phone: string | null
          frequency: string
          id: string
          is_anonymous: boolean
          method: string
          notes: string | null
          program_id: string | null
          reference: string | null
          status: string
        }
        Insert: {
          amount: number
          campaign_id?: string | null
          created_at?: string
          currency?: string
          designation?: string
          donor_email: string
          donor_name: string
          donor_phone?: string | null
          frequency?: string
          id?: string
          is_anonymous?: boolean
          method?: string
          notes?: string | null
          program_id?: string | null
          reference?: string | null
          status?: string
        }
        Update: {
          amount?: number
          campaign_id?: string | null
          created_at?: string
          currency?: string
          designation?: string
          donor_email?: string
          donor_name?: string
          donor_phone?: string | null
          frequency?: string
          id?: string
          is_anonymous?: boolean
          method?: string
          notes?: string | null
          program_id?: string | null
          reference?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          kind: string
          message: string
          name: string
          phone: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          kind?: string
          message: string
          name: string
          phone?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          kind?: string
          message?: string
          name?: string
          phone?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          body: string
          cover_url: string | null
          created_at: string
          excerpt: string
          id: string
          published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          activities: string
          body: string
          calls_to_action: Json
          created_at: string
          gallery: Json
          id: string
          image_url: string | null
          impact_metrics: Json
          objectives: string
          published: boolean
          related_story_ids: string[]
          slug: string
          sort_order: number
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          activities?: string
          body?: string
          calls_to_action?: Json
          created_at?: string
          gallery?: Json
          id?: string
          image_url?: string | null
          impact_metrics?: Json
          objectives?: string
          published?: boolean
          related_story_ids?: string[]
          slug: string
          sort_order?: number
          summary?: string
          title: string
          updated_at?: string
        }
        Update: {
          activities?: string
          body?: string
          calls_to_action?: Json
          created_at?: string
          gallery?: Json
          id?: string
          image_url?: string | null
          impact_metrics?: Json
          objectives?: string
          published?: boolean
          related_story_ids?: string[]
          slug?: string
          sort_order?: number
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_finances: {
        Row: {
          beneficiaries_reached: number | null
          beneficiaries_verified: boolean
          budget: number | null
          budget_approved: boolean
          currency: string
          funding_received: number | null
          funding_target: number | null
          funding_verified: boolean
          project_id: string
        }
        Insert: {
          beneficiaries_reached?: number | null
          beneficiaries_verified?: boolean
          budget?: number | null
          budget_approved?: boolean
          currency?: string
          funding_received?: number | null
          funding_target?: number | null
          funding_verified?: boolean
          project_id: string
        }
        Update: {
          beneficiaries_reached?: number | null
          beneficiaries_verified?: boolean
          budget?: number | null
          budget_approved?: boolean
          currency?: string
          funding_received?: number | null
          funding_target?: number | null
          funding_verified?: boolean
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_finances_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          archived: boolean
          body: string
          country: string | null
          created_at: string
          district: string | null
          end_date: string | null
          gallery: Json
          id: string
          image_url: string | null
          location: string | null
          objectives: string
          program_id: string | null
          progress_updates: Json
          project_manager: string | null
          published: boolean
          related_campaigns: Json
          slug: string
          sort_order: number
          start_date: string | null
          status: string
          summary: string
          supporting_documents: Json
          title: string
          updated_at: string
        }
        Insert: {
          archived?: boolean
          body?: string
          country?: string | null
          created_at?: string
          district?: string | null
          end_date?: string | null
          gallery?: Json
          id?: string
          image_url?: string | null
          location?: string | null
          objectives?: string
          program_id?: string | null
          progress_updates?: Json
          project_manager?: string | null
          published?: boolean
          related_campaigns?: Json
          slug: string
          sort_order?: number
          start_date?: string | null
          status?: string
          summary?: string
          supporting_documents?: Json
          title: string
          updated_at?: string
        }
        Update: {
          archived?: boolean
          body?: string
          country?: string | null
          created_at?: string
          district?: string | null
          end_date?: string | null
          gallery?: Json
          id?: string
          image_url?: string | null
          location?: string | null
          objectives?: string
          program_id?: string | null
          progress_updates?: Json
          project_manager?: string | null
          published?: boolean
          related_campaigns?: Json
          slug?: string
          sort_order?: number
          start_date?: string | null
          status?: string
          summary?: string
          supporting_documents?: Json
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          abbreviation: string
          about_intro: string | null
          address: string | null
          country: string
          domain: string | null
          donate_instructions: string | null
          donate_intro: string | null
          email: string | null
          facebook_url: string | null
          favicon_url: string | null
          footer_logo_url: string | null
          header_logo_url: string | null
          hero_image_url: string | null
          hero_subtitle: string
          hero_title: string
          id: number
          instagram_url: string | null
          legal_status: string
          linkedin_url: string | null
          logo_url: string | null
          mission: string | null
          motto: string
          og_image_url: string | null
          org_name: string
          phone: string | null
          registration_number: string | null
          updated_at: string
          values: string | null
          vision: string | null
          volunteer_intro: string | null
          x_url: string | null
          youtube_url: string | null
        }
        Insert: {
          abbreviation?: string
          about_intro?: string | null
          address?: string | null
          country?: string
          domain?: string | null
          donate_instructions?: string | null
          donate_intro?: string | null
          email?: string | null
          facebook_url?: string | null
          favicon_url?: string | null
          footer_logo_url?: string | null
          header_logo_url?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string
          hero_title?: string
          id?: number
          instagram_url?: string | null
          legal_status?: string
          linkedin_url?: string | null
          logo_url?: string | null
          mission?: string | null
          motto?: string
          og_image_url?: string | null
          org_name?: string
          phone?: string | null
          registration_number?: string | null
          updated_at?: string
          values?: string | null
          vision?: string | null
          volunteer_intro?: string | null
          x_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          abbreviation?: string
          about_intro?: string | null
          address?: string | null
          country?: string
          domain?: string | null
          donate_instructions?: string | null
          donate_intro?: string | null
          email?: string | null
          facebook_url?: string | null
          favicon_url?: string | null
          footer_logo_url?: string | null
          header_logo_url?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string
          hero_title?: string
          id?: number
          instagram_url?: string | null
          legal_status?: string
          linkedin_url?: string | null
          logo_url?: string | null
          mission?: string | null
          motto?: string
          og_image_url?: string | null
          org_name?: string
          phone?: string | null
          registration_number?: string | null
          updated_at?: string
          values?: string | null
          vision?: string | null
          volunteer_intro?: string | null
          x_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          body: string
          created_at: string
          id: string
          image_url: string | null
          position: string
          published: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          image_url?: string | null
          position?: string
          published?: boolean
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          image_url?: string | null
          position?: string
          published?: boolean
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volunteer_applications: {
        Row: {
          admin_notes: string
          assigned_activities: string
          availability: string
          consent: boolean
          country: string
          created_at: string
          district: string | null
          email: string
          experience: string
          full_name: string
          id: string
          interests: string
          motivation: string
          phone: string | null
          skills: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string
          assigned_activities?: string
          availability?: string
          consent?: boolean
          country?: string
          created_at?: string
          district?: string | null
          email: string
          experience?: string
          full_name: string
          id?: string
          interests?: string
          motivation?: string
          phone?: string | null
          skills?: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string
          assigned_activities?: string
          availability?: string
          consent?: boolean
          country?: string
          created_at?: string
          district?: string | null
          email?: string
          experience?: string
          full_name?: string
          id?: string
          interests?: string
          motivation?: string
          phone?: string | null
          skills?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      volunteer_hours: {
        Row: {
          activity: string
          application_id: string
          created_at: string
          date: string
          hours: number
          id: string
          notes: string
        }
        Insert: {
          activity: string
          application_id: string
          created_at?: string
          date?: string
          hours: number
          id?: string
          notes?: string
        }
        Update: {
          activity?: string
          application_id?: string
          created_at?: string
          date?: string
          hours?: number
          id?: string
          notes?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_hours_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "volunteer_applications"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_campaign_progress: {
        Row: {
          campaign_id: string | null
          currency: string | null
          verified_count: number | null
          verified_total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      public_project_finances: {
        Row: {
          beneficiaries_reached: number | null
          budget: number | null
          currency: string | null
          funding_received: number | null
          funding_target: number | null
          project_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_finances_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor"
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
    Enums: {
      app_role: ["admin", "editor"],
    },
  },
} as const
