import apiClient from '../api/api.client';
import { ScanEventType, StreamEvent } from '../types/api.types';

export const scanService = {
  
  /**
   * 1. יריית פתיחה - שליחת בקשה להתחלת הסריקה
   */
  startScan: async (): Promise<string> => {
    try {
      // תיקון נתיב ל- /scan/start ותיקון מפתח ל- target_brand
      const response = await apiClient.post('/scan/start', { 
        target_brand: "ביטוח ישיר" 
      });
      
      // תיקון מפתח ל- taskId (כפי שמופיע ב-Return של הפייתון)
      return response.data.taskId;
    } catch (error) {
      console.error("Failed to start scan for Direct Insurance:", error);
      throw error;
    }
  },

  /**
   * 2. האזנה לזרם הנתונים (SSE)
   */
  listenToStream: (
    taskId: string, 
    onMessage: (data: StreamEvent) => void, 
    onError: (err: any) => void
  ): (() => void) => {
    
    // תיקון נתיב הסטרים ל- /scan/stream/
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const url = `${apiUrl}/scan/stream/${taskId}`;
    const eventSource = new EventSource(url);

    console.log(`[SSE] Connected to: ${url}`);

    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const parsedData: StreamEvent = JSON.parse(event.data);
        onMessage(parsedData); 

        if (parsedData.event === ScanEventType.COMPLETE || parsedData.event === ScanEventType.ERROR) {
          eventSource.close();
        }
      } catch (err) {
        console.error("[SSE] Parsing error:", err);
        onError(err);
      }
    };

    eventSource.onerror = (err: Event) => {
      console.error("[SSE] Stream Error:", err);
      onError(err);
      eventSource.close();
    };

    return () => {
      if (eventSource.readyState !== eventSource.CLOSED) {
        eventSource.close();
      }
    };
  }
};