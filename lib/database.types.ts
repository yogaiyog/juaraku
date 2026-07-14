export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          sort_index: number;
          title: string;
          hero_image: string;
          description: string;
          meta_title: string | null;
          meta_description: string | null;
          pdf: string | null;
          listed: boolean;
          copyedit: boolean;
          last_tested: string;
          version: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          sort_index: number;
          title: string;
          hero_image?: string;
          description?: string;
          meta_title?: string | null;
          meta_description?: string | null;
          pdf?: string | null;
          listed?: boolean;
          copyedit?: boolean;
          last_tested?: string;
          version?: number | null;
        };
        Update: {
          id?: string;
          sort_index?: number;
          title?: string;
          hero_image?: string;
          description?: string;
          meta_title?: string | null;
          meta_description?: string | null;
          pdf?: string | null;
          listed?: boolean;
          copyedit?: boolean;
          last_tested?: string;
          version?: number | null;
        };
      };
      steps: {
        Row: {
          id: number;
          project_id: string;
          step_number: number;
          title: string;
          content: string;
          completion: string[];
          knowledge_quiz: Record<string, unknown> | null;
          challenge: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          project_id: string;
          step_number: number;
          title: string;
          content?: string;
          completion?: string[];
          knowledge_quiz?: Record<string, unknown> | null;
          challenge?: boolean;
        };
        Update: {
          title?: string;
          content?: string;
          completion?: string[];
          knowledge_quiz?: Record<string, unknown> | null;
          challenge?: boolean;
        };
      };
    };
  };
  storage: {
    buckets: {
      project_assets: {
        project_id: string;
        path: string;
      };
    };
  };
};
