// --- הטיפוסים שכבר יש לנו ---

export enum ScanEventType {
  PROGRESS = 'PROGRESS',
  AI_THOUGHT = 'AI_THOUGHT',
  ZONE_COMPLETE = 'ZONE_COMPLETE',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface RawQuery {
  engine: string;
  query: string;
  answer: string;
}

export interface Category {
  id: string;
  name: string;
  positive_pct: number;
  ai_verdict: string;
  action_item: string;
  raw_queries?: RawQuery[];
}

export interface StreamEvent {
  event: ScanEventType;
  data: any;
}

// --- החדש: האינטרפייס של ה-Store עצמו ---

export interface ScanState {
  // נתונים (Variables)
  categories: Category[];
  progress: number;
  statusMessage: string;
  isScanning: boolean;
  error: string | null;

  // פונקציות (Actions)
  executeScan: () => Promise<void>;
  resetScan: () => void;
  setFullScanData: (data: any) => void
}
