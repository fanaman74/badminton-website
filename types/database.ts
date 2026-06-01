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
          name: string;
          email: string | null;
          role: "ADMIN" | "PLAYER";
          balance: number;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email?: string | null;
          role?: "ADMIN" | "PLAYER";
          balance?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          role?: "ADMIN" | "PLAYER";
          balance?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          date: string;
          location_name: string;
          location_maps_url: string | null;
          courts_booked: number;
          max_capacity: number;
          status: "UPCOMING" | "COMPLETED" | "CANCELLED";
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          location_name: string;
          location_maps_url?: string | null;
          courts_booked: number;
          max_capacity: number;
          status?: "UPCOMING" | "COMPLETED" | "CANCELLED";
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          location_name?: string;
          location_maps_url?: string | null;
          courts_booked?: number;
          max_capacity?: number;
          status?: "UPCOMING" | "COMPLETED" | "CANCELLED";
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      rsvps: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          status: "IN" | "OUT" | "MAYBE" | "WAITLIST";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id: string;
          status: "IN" | "OUT" | "MAYBE" | "WAITLIST";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string;
          status?: "IN" | "OUT" | "MAYBE" | "WAITLIST";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rsvps_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rsvps_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          }
        ];
      };
      expenses: {
        Row: {
          id: string;
          payer_id: string;
          amount: number;
          description: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          payer_id: string;
          amount: number;
          description: string;
          date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          payer_id?: string;
          amount?: number;
          description?: string;
          date?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          session_id: string | null;
          team1_p1_id: string;
          team1_p2_id: string;
          team2_p1_id: string;
          team2_p2_id: string;
          team1_score: number;
          team2_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          team1_p1_id: string;
          team1_p2_id: string;
          team2_p1_id: string;
          team2_p2_id: string;
          team1_score: number;
          team2_score: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          team1_p1_id?: string;
          team1_p2_id?: string;
          team2_p1_id?: string;
          team2_p2_id?: string;
          team1_score?: number;
          team2_score?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      team_config: {
        Row: {
          id: number;
          day_of_week: number;
          courts: number;
          start_time: string;
          location_name: string;
          location_maps_url: string | null;
          updated_at: string;
        };
        Insert: {
          id?: number;
          day_of_week?: number;
          courts?: number;
          start_time?: string;
          location_name?: string;
          location_maps_url?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          day_of_week?: number;
          courts?: number;
          start_time?: string;
          location_name?: string;
          location_maps_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token?: string;
          created_at?: string;
          expires_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Session = Database["public"]["Tables"]["sessions"]["Row"];
export type Rsvp = Database["public"]["Tables"]["rsvps"]["Row"];
export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type Match = Database["public"]["Tables"]["matches"]["Row"];
export type UserSession = Database["public"]["Tables"]["user_sessions"]["Row"];

export type RsvpStatus = "IN" | "OUT" | "MAYBE" | "WAITLIST";
export type SessionStatus = "UPCOMING" | "COMPLETED" | "CANCELLED";
export type UserRole = "ADMIN" | "PLAYER";
