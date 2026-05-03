// src/store/runMockScan.ts

export const runMockScan = async (set: any) => {
  const categoryIds = [
    'pricing', 'reliability', 'service', 'availability', 
    'digital', 'speed', 'transparency', 'competition', 
    'car', 'retention', 'innovation', 'coverage'
  ];

  const categoryNames: Record<string, string> = {
    pricing: 'מחיר אטרקטיבי?', reliability: 'אמינות בתביעות?', service: 'שירות מקצועי?',
    availability: 'זמינות הנציגים?', digital: 'נוחות דיגיטלית?', speed: 'מהירות טיפול?',
    transparency: 'שקיפות מלאה?', competition: 'תחרותיות בשוק?', car: 'ביטוח רכב משתלם?',
    retention: 'שימור לקוחות?', innovation: 'חדשנות וטכנולוגיה?', coverage: 'כיסוי מקיף?'
  };

  // שלב 1: אתחול
  set({ statusMessage: "סוכן GEO מתחבר למקורות מידע...", progress: 5 });
  await new Promise(r => setTimeout(r, 1200));

  // שלב 2: ריצה מקבילית על הקטגוריות
  for (let i = 0; i < categoryIds.length; i++) {
    const id = categoryIds[i];
    const name = categoryNames[id];
    
    // אחוז התקדמות מצטבר
    const currentProgress = Math.round(((i + 1) / categoryIds.length) * 100);

    // א. עדכון על מציאת נתונים גולמיים (ממלא חצי שעון)
    set((state: any) => ({
      statusMessage: `סורק מקורות: ${name}`,
      categories: [
        ...state.categories,
        { 
          id, 
          name, 
          raw_queries: [{ engine: 'GEO-Bot', query: `Search ${id}`, answer: 'Found data...' }],
          positive_pct: 0,
          ai_verdict: "",
          action_item: ""
        }
      ]
    }));

    await new Promise(r => setTimeout(r, 800)); // השהייה קלה בין שלב לשלב

    // ב. עדכון על סיום ניתוח AI (ממלא שעון שלם)
    set((state: any) => ({
      progress: currentProgress,
      statusMessage: `מגבש פסיקה אסטרטגית: ${name}`,
      categories: state.categories.map((c: any) => 
        c.id === id ? { 
          ...c, 
          positive_pct: Math.floor(Math.random() * 45) + 50, // ציון רנדומלי בין 50-95
          ai_verdict: "ניתוח ה-GEO מזהה מגמת שביעות רצון יציבה במקורות הגלויים.",
          action_item: "מומלץ לשמר את רמת המענה הנוכחית."
        } : c
      )
    }));

    await new Promise(r => setTimeout(r, 500));
  }

  // שלב 3: סיום סופי
  set({ 
    isScanning: false, 
    progress: 100, 
    statusMessage: "הסריקה הושלמה בהצלחה! מעבד דוח סופי..." 
  });
};