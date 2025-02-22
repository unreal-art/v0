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
      follows: {
        Row: {
          created_at: string
          followee_id: string | null
          follower_id: string | null
          id: number
        }
        Insert: {
          created_at?: string
          followee_id?: string | null
          follower_id?: string | null
          id?: number
        }
        Update: {
          created_at?: string
          followee_id?: string | null
          follower_id?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "follows_followee_id_fkey"
            columns: ["followee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          author: string | null
          created_at: string
          id: number
          post_id: number | null
        }
        Insert: {
          author?: string | null
          created_at?: string
          id?: number
          post_id?: number | null
        }
        Update: {
          author?: string | null
          created_at?: string
          id?: number
          post_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "likes_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author: string
          caption: string | null
          category: string | null
          cpu: number | null
          createdAt: string
          device: string | null
          id: number
          ipfsImages: Json | null
          isDraft: boolean | null
          isPinned: boolean | null
          isPrivate: boolean | null
          like_count: number | null
          n: number | null
          prompt: string | null
          seed: number | null
        }
        Insert: {
          author?: string
          caption?: string | null
          category?: string | null
          cpu?: number | null
          createdAt?: string
          device?: string | null
          id?: number
          ipfsImages?: Json | null
          isDraft?: boolean | null
          isPinned?: boolean | null
          isPrivate?: boolean | null
          like_count?: number | null
          n?: number | null
          prompt?: string | null
          seed?: number | null
        }
        Update: {
          author?: string
          caption?: string | null
          category?: string | null
          cpu?: number | null
          createdAt?: string
          device?: string | null
          id?: number
          ipfsImages?: Json | null
          isDraft?: boolean | null
          isPinned?: boolean | null
          isPrivate?: boolean | null
          like_count?: number | null
          n?: number | null
          prompt?: string | null
          seed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Posts_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          createdAt: string
          credit_balance: number
          email: string | null
          follower_count: number
          following_count: number
          full_name: string | null
          id: string
          likes_received: number
          location: string | null
          updated_at: string | null
          username: string | null
          wallet: Json | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          createdAt?: string
          credit_balance?: number
          email?: string | null
          follower_count?: number
          following_count?: number
          full_name?: string | null
          id: string
          likes_received?: number
          location?: string | null
          updated_at?: string | null
          username?: string | null
          wallet?: Json | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          createdAt?: string
          credit_balance?: number
          email?: string | null
          follower_count?: number
          following_count?: number
          full_name?: string | null
          id?: string
          likes_received?: number
          location?: string | null
          updated_at?: string | null
          username?: string | null
          wallet?: Json | null
          website?: string | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
