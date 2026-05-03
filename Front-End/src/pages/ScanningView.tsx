import React, { useEffect, useState } from 'react';
import { useScanStore } from '../store/useScan.store';
import { 
  Tag, ShieldCheck, Headphones, Clock, 
  MousePointer2, Zap, FileSearch, BarChart3, Car, 
  Users, Sparkles, Umbrella, ChevronLeft, ArrowRight 
} from 'lucide-react';

export interface ScanningViewProps {
  onComplete: () => void;
}

const CATEGORY_MAP: Record<string, { label: string, icon: any }> = {
  pricing: { label: 'מחיר אטרקטיבי', icon: Tag },
  reliability: { label: 'אמינות בתביעות', icon: ShieldCheck },
  service: { label: 'שירות מקצועי', icon: Headphones },
  availability: { label: 'זמינות הנציגים', icon: Clock },
  digital: { label: 'נוחות דיגיטלית', icon: MousePointer2 },
  speed: { label: 'מהירות טיפול', icon: Zap },
  transparency: { label: 'שקיפות מלאה', icon: FileSearch },
  competition: { label: 'תחרותיות בשוק', icon: BarChart3 },
  car: { label: 'ביטוח רכב משתלם', icon: Car },
  retention: { label: 'שימור לקוחות', icon: Users },
  innovation: { label: 'חדשנות וטכנולוגיה', icon: Sparkles },
  coverage: { label: 'כיסוי מקיף', icon: Umbrella },
};

const ALL_CATEGORY_IDS = Object.keys(CATEGORY_MAP);

const ScanningView: React.FC<ScanningViewProps> = ({ onComplete }) => {
  const { categories, progress, statusMessage, isScanning, executeScan, error } = useScanStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // סטייט חדש לשליטה בפופ-אפ הסיום
  const [showFinishPopup, setShowFinishPopup] = useState(false);

  useEffect(() => {
    executeScan();
  }, [executeScan]);

  // שונה: במקום לעבור אוטומטית, אנחנו מקפיצים את הפופ-אפ לאחר חצי שנייה
useEffect(() => {
    // הסרנו את בדיקת הקטגוריות. כעת הפופ-אפ יקפוץ תמיד כשהמד על 100%!
    if (progress === 100 && !isScanning) {
      const timer = setTimeout(() => setShowFinishPopup(true), 500);
      return () => clearTimeout(timer);
    }
  }, [progress, isScanning]);

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: '#020617', 
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      direction: 'rtl',
      overflow: 'hidden',
      position: 'relative' // חשוב כדי שהפופ-אפ ישב מעל
    }}>
      
      {/* --- Header Section with GEOPulse Logo --- */}
      <div style={{ padding: '40px 60px 10px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="geo-pill">{isScanning ? 'סריקה פעילה' : 'סריקה הושלמה'}</div>
          {/* לוגו GEOPulse עבה במיוחד */}
          <div style={{ 
            fontSize: '42px', 
            fontWeight: 950, 
            letterSpacing: '-2px', 
            display: 'flex', 
            lineHeight: '1' 
          }}>
            <span style={{ color: '#fff' }}>GEO</span>
            <span style={{ color: '#E20613' }}>Pulse</span>
          </div>
        </div>
        <div style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', fontFamily: 'monospace' }}>{progress}%</div>
      </div>

      {/* Laser Scanner */}
      <div style={{ width: '100%', height: '2px', backgroundColor: 'rgba(226, 6, 19, 0.1)', position: 'relative', overflow: 'hidden' }}>
        {isScanning && <div className="laser-scanner-line"></div>}
      </div>

      {/* Reasoning Area */}
      <div className="chat-flow-container">
        <div className="thought-label">GEO_AGENT_REASONING</div>
        <div className="thought-bubble">
          <div 
            key={statusMessage} 
            className={`thought-content ${isScanning ? 'thought-content-active' : ''}`}
          >
            {error ? `ERROR: ${error}` : (statusMessage || "מאתחל רצפי חשיבה...")}
          </div>
        </div>
      </div>

      {/* --- Main Grid Layout --- */}
      <div style={{ flex: 1, padding: '0 60px 40px 60px', overflowY: 'auto' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto',
          direction: 'ltr' // הופך את הסדר כך שהאלמנט הראשון יהיה משמאל
        }}>
          
          {/* מיתוג KNOW YOUR REPUTATION - עבר לצד שמאל */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            padding: '20px',
            lineHeight: '0.9',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff', letterSpacing: '1px' }}>KNOW YOUR</div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#E20613', letterSpacing: '1px' }}>REPUTATION</div>
          </div>

          {/* הצגת כרטיסי הקטגוריות (במבנה LTR כדי שהמותג יהיה משמאל) */}
          {ALL_CATEGORY_IDS.map((id) => {
            const catData = categories.find(c => c.id === id);
            const info = CATEGORY_MAP[id];
            const isDone = !!catData?.ai_verdict;
            const isActive = isScanning && !isDone && progress > 0;
            const isExpanded = expandedId === id;

            let fillPercent = 0;
            if (isActive) fillPercent = 40;
            if (isDone) fillPercent = 100;

            return (
              <div 
                key={id} 
                style={{ direction: 'rtl' }} // מחזיר את תוכן הכרטיס לעברית/RTL
                className={`stealth-card ${isExpanded ? 'expanded' : ''}`}
                onClick={() => setExpandedId(isExpanded ? null : id)}
              >
                <div className="stealth-card-inner">
                  <div style={{ 
                    position: 'absolute', top: 16, left: 0, width: '3px', 
                    height: `${fillPercent * 0.7}%`, borderRadius: '0 2px 2px 0', 
                    background: '#E20613', transition: 'height 1s ease' 
                  }} />

                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <div className={`icon-unit ${isDone ? 'done' : ''} ${isActive ? 'pulse' : ''}`}>
                        <info.icon size={22} />
                      </div>
                      {isDone && <span className="pct-val">{catData.positive_pct}%</span>}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div className="label-text">{info.label}</div>
                      {isActive && <div className="mini-loader">סורק נתונים...</div>}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <ChevronLeft size={16} className={`chevron ${isExpanded ? 'active' : ''}`} />
                    </div>

                    {isExpanded && (
                      <div className="detail-pane">
                        <p>{catData?.ai_verdict || "מבצע ניתוח..."}</p>
                      </div>
                    )}
                  </div>

                  <div className="bottom-progress-bar">
                    <div style={{ 
                      height: '100%', width: `${fillPercent}%`, 
                      background: '#E20613', transition: 'width 1.2s' 
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- פופ-אפ (MODAL) סיום הסריקה --- */}
      {showFinishPopup && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(2, 6, 23, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.4s ease-out'
        }}>
          <div style={{
            backgroundColor: '#0f172a',
            border: `1px solid rgba(226, 6, 19, 0.3)`,
            borderRadius: '16px',
            width: '90%', maxWidth: '450px',
            padding: '45px',
            textAlign: 'center',
            position: 'relative',
            boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(226, 6, 19, 0.15)`,
            direction: 'rtl'
          }}>
            
            {/* אייקון הצלחה מעוצב */}
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', 
              backgroundColor: `rgba(226, 6, 19, 0.15)`, border: `1px solid #E20613`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 25px',
              boxShadow: `0 0 20px rgba(226, 6, 19, 0.3)`
            }}>
              <ShieldCheck color="#E20613" size={40} />
            </div>

            <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '15px', color: '#fff' }}>הסריקה הושלמה</h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.6', marginBottom: '35px' }}>
              הסוכן סיים לנתח את כל מקורות המידע והפיק דוח אסטרטגי מלא עבור ביטוח ישיר.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* כפתור צפה בתוצאות */}
              <button 
                onClick={onComplete} // הקריאה לפונקציה שמעבירה לדשבורד
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                style={{
                  padding: '18px', backgroundColor: '#E20613', color: 'white',
                  border: 'none', borderRadius: '100px', fontSize: '18px', fontWeight: '900',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '12px', transition: 'all 0.2s ease',
                  boxShadow: `0 10px 20px rgba(226, 6, 19, 0.4)`
                }}
              >
                צפה בתוצאות <ArrowRight size={20} />
              </button>

              {/* אפשרות מאוחר יותר */}
              <button 
                onClick={() => setShowFinishPopup(false)}
                style={{
                  padding: '12px', backgroundColor: 'transparent', color: '#64748b',
                  border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#cbd5e1'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
              >
                מאוחר יותר
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes laserMove {
          0% { transform: translateX(100%); }
          50% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .laser-scanner-line {
          position: absolute; top: 0; left: 0; width: 40%; height: 100%;
          background: linear-gradient(90deg, transparent, #E20613, transparent);
          box-shadow: 0 0 15px #E20613;
          animation: laserMove 3s infinite linear;
        }

        @keyframes strongFlash {
          0%, 100% { opacity: 1; text-shadow: 0 0 12px rgba(226, 6, 19, 0.9); transform: scale(1); }
          50% { opacity: 0.05; text-shadow: none; transform: scale(0.98); }
        }
        .thought-content-active {
          animation: strongFlash 0.8s infinite ease-in-out;
          color: #ffffff !important;
        }

        .chat-flow-container { padding: 10px 60px 20px 60px; display: flex; flex-direction: column; align-items: flex-start; }
        .thought-label { font-size: 9px; font-weight: 800; color: #E20613; margin-bottom: 6px; letter-spacing: 1.5px; }
        .thought-bubble {
          background-color: rgba(15, 23, 42, 0.9);
          padding: 10px 20px;
          border-radius: 8px;
          width: fit-content;
          max-width: 80%;
          box-shadow: 0 8px 20px rgba(0,0,0,0.4);
        }
        .thought-content { font-size: 19px; color: #f1f5f9; line-height: 1.4; font-weight: 400; }

        .stealth-card { border-radius: 16px; min-height: 130px; cursor: pointer; transition: all 0.3s; }
        .stealth-card.expanded { min-height: 220px; }
        .stealth-card-inner {
          background: #0b1120; border-radius: 14px; border: 1px solid #1e293b;
          padding: 20px; height: 100%; position: relative; overflow: hidden;
        }
        .stealth-card:hover .stealth-card-inner { border-color: #334155; transform: translateY(-2px); }

        .icon-unit { color: #475569; transition: color 0.4s; }
        .icon-unit.done { color: #E20613; }
        .icon-unit.pulse { animation: iconPulse 2s infinite; color: #E20613; }
        
        .label-text { font-size: 16px; font-weight: 600; color: #cbd5e1; }
        .pct-val { color: #10b981; font-weight: 800; font-size: 18px; }
        .mini-loader { font-size: 10px; color: #475569; margin-top: 5px; font-weight: bold; }
        .chevron { color: #334155; transition: transform 0.3s; }
        .chevron.active { transform: rotate(-90deg); color: #E20613; }
        .detail-pane { margin-top: 15px; padding-top: 15px; border-top: 1px solid #1e293b; font-size: 13px; color: #94a3b8; }
        .geo-pill { font-size: 10px; background: rgba(226, 6, 19, 0.1); color: #E20613; padding: 3px 10px; border-radius: 20px; font-weight: 800; }
        .bottom-progress-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: #1e293b; }

        @keyframes iconPulse { 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
};

export default ScanningView;