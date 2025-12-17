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
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      yearly_goals: {
        Row: {
          id: string;
          user_id: string;
          year: number;
          title: string;
          description: string | null;
          status: "not_started" | "in_progress" | "completed" | "postponed";
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          year: number;
          title: string;
          description?: string | null;
          status?: "not_started" | "in_progress" | "completed" | "postponed";
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          year?: number;
          title?: string;
          description?: string | null;
          status?: "not_started" | "in_progress" | "completed" | "postponed";
          color?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "yearly_goals_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      monthly_goals: {
        Row: {
          id: string;
          user_id: string;
          yearly_goal_id: string | null;
          year: number;
          month: number;
          title: string;
          status: "not_started" | "in_progress" | "completed" | "postponed";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          yearly_goal_id?: string | null;
          year: number;
          month: number;
          title: string;
          status?: "not_started" | "in_progress" | "completed" | "postponed";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          yearly_goal_id?: string | null;
          year?: number;
          month?: number;
          title?: string;
          status?: "not_started" | "in_progress" | "completed" | "postponed";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "monthly_goals_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "monthly_goals_yearly_goal_id_fkey";
            columns: ["yearly_goal_id"];
            referencedRelation: "yearly_goals";
            referencedColumns: ["id"];
          },
        ];
      };
      weekly_goals: {
        Row: {
          id: string;
          user_id: string;
          monthly_goal_id: string | null;
          year: number;
          week: number;
          title: string;
          status: "not_started" | "in_progress" | "completed" | "postponed";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          monthly_goal_id?: string | null;
          year: number;
          week: number;
          title: string;
          status?: "not_started" | "in_progress" | "completed" | "postponed";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          monthly_goal_id?: string | null;
          year?: number;
          week?: number;
          title?: string;
          status?: "not_started" | "in_progress" | "completed" | "postponed";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "weekly_goals_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "weekly_goals_monthly_goal_id_fkey";
            columns: ["monthly_goal_id"];
            referencedRelation: "monthly_goals";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_goals: {
        Row: {
          id: string;
          user_id: string;
          weekly_goal_id: string | null;
          date: string;
          title: string;
          status: "not_started" | "in_progress" | "completed" | "postponed";
          priority: "low" | "medium" | "high";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          weekly_goal_id?: string | null;
          date?: string;
          title: string;
          status?: "not_started" | "in_progress" | "completed" | "postponed";
          priority?: "low" | "medium" | "high";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          weekly_goal_id?: string | null;
          date?: string;
          title?: string;
          status?: "not_started" | "in_progress" | "completed" | "postponed";
          priority?: "low" | "medium" | "high";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_goals_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "daily_goals_weekly_goal_id_fkey";
            columns: ["weekly_goal_id"];
            referencedRelation: "weekly_goals";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_intents: {
        Row: {
          id: string;
          user_id: string;
          week_goal_id: string | null;
          date: string;
          intent_text: string;
          energy_level: "low" | "medium" | "high";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_goal_id?: string | null;
          date?: string;
          intent_text: string;
          energy_level?: "low" | "medium" | "high";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_goal_id?: string | null;
          date?: string;
          intent_text?: string;
          energy_level?: "low" | "medium" | "high";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_intents_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "daily_intents_week_goal_id_fkey";
            columns: ["week_goal_id"];
            referencedRelation: "weekly_goals";
            referencedColumns: ["id"];
          },
        ];
      };
      focus_blocks: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          task_name: string;
          block_type: "deep" | "light" | "admin";
          status: "planned" | "active" | "done" | "abandoned";
          position: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          task_name: string;
          block_type?: "deep" | "light" | "admin";
          status?: "planned" | "active" | "done" | "abandoned";
          position?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          task_name?: string;
          block_type?: "deep" | "light" | "admin";
          status?: "planned" | "active" | "done" | "abandoned";
          position?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "focus_blocks_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      focus_sessions: {
        Row: {
          id: string;
          user_id: string;
          block_id: string | null;
          duration_seconds: number;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          block_id?: string | null;
          duration_seconds: number;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          block_id?: string | null;
          duration_seconds?: number;
          completed_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "focus_sessions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "focus_sessions_block_id_fkey";
            columns: ["block_id"];
            referencedRelation: "focus_blocks";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_reflections: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          what_went_well: string | null;
          energy_drains: string | null;
          intent_respected: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          what_went_well?: string | null;
          energy_drains?: string | null;
          intent_respected?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          what_went_well?: string | null;
          energy_drains?: string | null;
          intent_respected?: boolean | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_reflections_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          razorpay_subscription_id: string | null;
          plan: "free" | "pro";
          status: "created" | "active" | "paused" | "cancelled" | "past_due";
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          razorpay_subscription_id?: string | null;
          plan?: "free" | "pro";
          status?: "created" | "active" | "paused" | "cancelled" | "past_due";
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          razorpay_subscription_id?: string | null;
          plan?: "free" | "pro";
          status?: "created" | "active" | "paused" | "cancelled" | "past_due";
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      plans: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          active: boolean;
          trial_days: number | null;
          razorpay_plan_id: string | null;
          features: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          active?: boolean;
          trial_days?: number | null;
          razorpay_plan_id?: string | null;
          features?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          active?: boolean;
          trial_days?: number | null;
          razorpay_plan_id?: string | null;
          features?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      subscription_plan: "free" | "pro";
      subscription_status:
        | "created"
        | "active"
        | "paused"
        | "cancelled"
        | "past_due";
      energy_level: "low" | "medium" | "high";
      focus_block_type: "deep" | "light" | "admin";
      focus_block_status: "planned" | "active" | "done" | "abandoned";
      goal_status: "not_started" | "in_progress" | "completed" | "postponed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
