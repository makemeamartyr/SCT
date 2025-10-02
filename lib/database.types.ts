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
      notification_preferences: {
        Row: {
          id: number;
          email: boolean;
          sms: boolean;
          slack_webhook: string | null;
        };
        Insert: {
          id?: number;
          email?: boolean;
          sms?: boolean;
          slack_webhook?: string | null;
        };
        Update: {
          id?: number;
          email?: boolean;
          sms?: boolean;
          slack_webhook?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
