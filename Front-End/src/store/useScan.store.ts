import { create } from 'zustand';
import { scanService } from '../services/scan.service';
import { ScanState, Category, ScanEventType } from '../types/api.types';

// משתנה גלובלי לשמירת ה-EventSource כדי שנוכל לסגור אותו מכל מקום
let contentEventSource: EventSource | null = null;

interface ExtendedScanState extends ScanState {
  generatedContent: string;
  isGeneratingContent: boolean;
  isHistoricalView: boolean;
  startContentGeneration: (categoryId: string) => void;
  closeContentStream: () => void; // פונקציית התיקון לכפילות
  resetContentGeneration: () => void;
}

export const useScanStore = create<ExtendedScanState>((set) => ({
  categories: [],
  progress: 0,
  statusMessage: "מוכן להתחלת סריקה...",
  isScanning: false,
  error: null,
  generatedContent: "",
  isGeneratingContent: false,
  isHistoricalView: false,

  resetScan: () => set({ 
    categories: [], progress: 0, statusMessage: "מערכת מאופסת", 
    error: null, isScanning: false, generatedContent: "", isGeneratingContent: false,
    isHistoricalView: false 
  }),

  resetContentGeneration: () => set({ generatedContent: "", isGeneratingContent: false }),

  // סגירת הזרם הקיים
  closeContentStream: () => {
    if (contentEventSource) {
      contentEventSource.close();
      contentEventSource = null;
    }
  },

  startContentGeneration: (categoryId: string) => {
    // תיקון הבאג: סגירת חיבור קודם אם קיים לפני פתיחת חדש
    if (contentEventSource) {
      contentEventSource.close();
    }

    set({ generatedContent: "", isGeneratingContent: true });
    
    contentEventSource = new EventSource(`http://localhost:8000/api/v1/generate-content/${categoryId}`);

    contentEventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.done) {
        set({ isGeneratingContent: false });
        if (contentEventSource) contentEventSource.close();
      } else if (data.chunk) {
        set((state) => ({ generatedContent: state.generatedContent + data.chunk }));
      }
    };

    contentEventSource.onerror = () => {
      set({ isGeneratingContent: false });
      if (contentEventSource) contentEventSource.close();
    };
  },

  setFullScanData: (data: any) => {
    set({
      categories: data.categories || [], progress: 100, isScanning: false,
      statusMessage: "נתוני ארכיון נטענו בהצלחה", error: null, isHistoricalView: true
    });
  },

  executeScan: async () => {
    set({ isScanning: true, error: null, categories: [], progress: 0, isHistoricalView: false });
    try {
      const taskId = await scanService.startScan();
      if (!taskId) throw new Error("לא התקבל מזהה סריקה.");

      scanService.listenToStream(
        taskId,
        (payload) => {
          const { event, data } = payload;
          switch (event) {
            case ScanEventType.PROGRESS:
              set({ progress: data.percent, statusMessage: data.message });
              break;
            case ScanEventType.AI_THOUGHT:
              set({ statusMessage: data.text });
              break;
            case ScanEventType.ZONE_COMPLETE:
              set((state) => {
                const newCategory: Category = {
                  id: data.id || data.category, name: data.category, positive_pct: data.score_before * 10, 
                  ai_verdict: data.vulnerability, action_item: data.action_item || data.action_plan?.marketing
                };
                const existingIndex = state.categories.findIndex(c => c.id === newCategory.id);
                let updatedCategories = existingIndex !== -1 ? [...state.categories] : [...state.categories, newCategory];
                if (existingIndex !== -1) updatedCategories[existingIndex] = newCategory;
                return { categories: updatedCategories };
              });
              break;
            case ScanEventType.COMPLETE:
              set({ isScanning: false, progress: 100, statusMessage: "הושלם." });
              break;
          }
        },
        (err) => set({ error: "נפל.", isScanning: false })
      );
    } catch (err: any) { set({ error: "שגיאה.", isScanning: false }); }
  }
}));