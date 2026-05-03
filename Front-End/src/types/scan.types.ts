// המבנה של מקור מידע (לינק)
export interface Source {
  url: string;
  impact: 'positive' | 'negative' | 'neutral';
}

// המבנה של קטגוריה בודדת מתוך ה-12
export interface Category {
  id: number;
  category_name: string;
  status: 'critical' | 'stable' | 'strong'; // איגוד ערכים (Union) במקום סתם string
  positive_pct: number;
  ai_verdict: string;
  action_item: string;
  sources: Source[];
}

// המבנה של תוצאת סריקה מלאה
export interface ScanResult {
  scan_id: string;
  global_sentiment_score: number;
  categories: Category[];
  timestamp: string;
}
