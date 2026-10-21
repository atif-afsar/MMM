export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      weddings: {
        Row: {
          id: string;
          owner_user_id: string;
          bride_name: string;
          groom_name: string;
          wedding_date: string | null;
          wedding_time: string | null;
          timezone: string;
          venue_name: string | null;
          venue_address: string | null;
          venue_map_url: string | null;
          total_budget_paise: number;
          cover_image_path: string | null;
          invitation_slug: string | null;
          invitation_published: boolean;
          rsvp_enabled: boolean;
          invitation_heading: string | null;
          invitation_message: string | null;
          invitation_theme: Json;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_user_id: string;
          bride_name: string;
          groom_name: string;
          wedding_date?: string | null;
          wedding_time?: string | null;
          timezone?: string;
          venue_name?: string | null;
          venue_address?: string | null;
          venue_map_url?: string | null;
          total_budget_paise?: number;
          cover_image_path?: string | null;
          invitation_slug?: string | null;
          invitation_published?: boolean;
          rsvp_enabled?: boolean;
          invitation_heading?: string | null;
          invitation_message?: string | null;
          invitation_theme?: Json;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_user_id?: string;
          bride_name?: string;
          groom_name?: string;
          wedding_date?: string | null;
          wedding_time?: string | null;
          timezone?: string;
          venue_name?: string | null;
          venue_address?: string | null;
          venue_map_url?: string | null;
          total_budget_paise?: number;
          cover_image_path?: string | null;
          invitation_slug?: string | null;
          invitation_published?: boolean;
          rsvp_enabled?: boolean;
          invitation_heading?: string | null;
          invitation_message?: string | null;
          invitation_theme?: Json;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      wedding_members: {
        Row: {
          id: string;
          wedding_id: string;
          user_id: string;
          family_side: 'groom' | 'bride' | 'shared';
          role: 'owner' | 'admin' | 'editor' | 'viewer';
          created_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          user_id: string;
          family_side: 'groom' | 'bride' | 'shared';
          role?: 'owner' | 'admin' | 'editor' | 'viewer';
          created_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          user_id?: string;
          family_side?: 'groom' | 'bride' | 'shared';
          role?: 'owner' | 'admin' | 'editor' | 'viewer';
          created_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          wedding_id: string;
          title: string;
          description: string | null;
          category: string;
          total_amount_paise: number;
          amount_paid_paise: number;
          expense_date: string;
          paying_side: 'groom' | 'bride' | 'shared';
          payee_name: string | null;
          due_date: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          title: string;
          description?: string | null;
          category: string;
          total_amount_paise: number;
          amount_paid_paise?: number;
          expense_date?: string;
          paying_side: 'groom' | 'bride' | 'shared';
          payee_name?: string | null;
          due_date?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          total_amount_paise?: number;
          amount_paid_paise?: number;
          expense_date?: string;
          paying_side?: 'groom' | 'bride' | 'shared';
          payee_name?: string | null;
          due_date?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          wedding_id: string;
          name: string;
          event_date: string;
          start_time: string | null;
          venue: string | null;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          name: string;
          event_date: string;
          start_time?: string | null;
          venue?: string | null;
          notes?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          name?: string;
          event_date?: string;
          start_time?: string | null;
          venue?: string | null;
          notes?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          wedding_id: string;
          title: string;
          description: string | null;
          due_date: string | null;
          assigned_member_id: string | null;
          priority: 'low' | 'medium' | 'high';
          status: 'todo' | 'in_progress' | 'completed';
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          assigned_member_id?: string | null;
          priority?: 'low' | 'medium' | 'high';
          status?: 'todo' | 'in_progress' | 'completed';
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          title?: string;
          description?: string | null;
          due_date?: string | null;
          assigned_member_id?: string | null;
          priority?: 'low' | 'medium' | 'high';
          status?: 'todo' | 'in_progress' | 'completed';
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      discussions: {
        Row: {
          id: string;
          wedding_id: string;
          author_user_id: string;
          title: string | null;
          content: string;
          entry_type: 'announcement' | 'discussion' | 'decision';
          decision_status: 'open' | 'decided' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          author_user_id: string;
          title?: string | null;
          content: string;
          entry_type?: 'announcement' | 'discussion' | 'decision';
          decision_status?: 'open' | 'decided' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          author_user_id?: string;
          title?: string | null;
          content?: string;
          entry_type?: 'announcement' | 'discussion' | 'decision';
          decision_status?: 'open' | 'decided' | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      guests: {
        Row: {
          id: string;
          wedding_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          family_side: 'groom' | 'bride' | 'shared';
          invitation_status: 'not_sent' | 'shared';
          rsvp_status: 'pending' | 'attending' | 'not_attending';
          attendees_count: number;
          dietary_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          family_side?: 'groom' | 'bride' | 'shared';
          invitation_status?: 'not_sent' | 'shared';
          rsvp_status?: 'pending' | 'attending' | 'not_attending';
          attendees_count?: number;
          dietary_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          family_side?: 'groom' | 'bride' | 'shared';
          invitation_status?: 'not_sent' | 'shared';
          rsvp_status?: 'pending' | 'attending' | 'not_attending';
          attendees_count?: number;
          dietary_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rsvp_submissions: {
        Row: {
          id: string;
          wedding_id: string;
          guest_name: string;
          phone: string | null;
          email: string | null;
          response: 'attending' | 'not_attending';
          attendees_count: number;
          notes: string | null;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          guest_name: string;
          phone?: string | null;
          email?: string | null;
          response: 'attending' | 'not_attending';
          attendees_count?: number;
          notes?: string | null;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          guest_name?: string;
          phone?: string | null;
          email?: string | null;
          response?: 'attending' | 'not_attending';
          attendees_count?: number;
          notes?: string | null;
          submitted_at?: string;
        };
      };
    };
    Views: {
      public_wedding_invitations: {
        Row: {
          id: string;
          bride_name: string;
          groom_name: string;
          wedding_date: string | null;
          wedding_time: string | null;
          timezone: string;
          venue_name: string | null;
          venue_address: string | null;
          venue_map_url: string | null;
          cover_image_path: string | null;
          invitation_slug: string | null;
          invitation_heading: string | null;
          invitation_message: string | null;
          invitation_theme: Json;
          rsvp_enabled: boolean;
          published_at: string | null;
        };
      };
    };
    Functions: {
      is_wedding_member: {
        Args: { lookup_wedding_id: string };
        Returns: boolean;
      };
      has_wedding_role: {
        Args: { lookup_wedding_id: string; allowed_roles: string[] };
        Returns: boolean;
      };
      is_wedding_owner: {
        Args: { lookup_wedding_id: string };
        Returns: boolean;
      };
    };
  };
}
