// types.ts
export interface DashboardItem {
  id: string; // שינוי מ-number ל-string
  category_name: string;
  status: string; 
  stats: {
    positive_pct: number;
    negative_pct: number; // הוספנו
    competitor_pct: number; // הוספנו
  };
  sources: { // הוספנו
    positive: string[];
    negative: string[];
  };
  ai_verdict: string;
  competitor_to_beat: {
    name: string;
    strength: string;
  };
  content_gap: string;
  action_item: string;
  full_report_url: string;
}