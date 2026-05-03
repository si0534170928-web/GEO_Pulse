import React, { useState, useEffect } from 'react';
import { Play, Search, Zap, Target, Clock, Calendar, ShieldCheck, ChevronDown, Archive, History, ArrowLeft } from 'lucide-react';
import { useScanStore } from '../store/useScan.store';

interface LandingProps {
  onStart: () => void;
  onDirectToDashboard?: () => void; // פרופ חדש שמאפשר קפיצה ישירה לדשבורד
}

// רכיב המספרים שרצים
const AnimatedCounter = ({ target, prefix = '', suffix = '', duration = 4000, delay = 0 }: any) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 30); 
let timer: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.ceil(start));
        }
      }, 30);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (timer) clearInterval(timer);
    };
  }, [target, duration, delay]);

  return (
    <span style={{ 
      color: '#cbd5e1', fontFamily: 'monospace', fontWeight: '900', 
      fontSize: 'clamp(5rem, 12vw, 180px)', lineHeight: '1',
      letterSpacing: '-5px', textShadow: '0 20px 40px rgba(0,0,0,0.5)'
    }}>
      {prefix}{count}{suffix}
    </span>
  );
};

const LandingView: React.FC<LandingProps> = ({ onStart, onDirectToDashboard }) => {
  const [scheduleMode, setScheduleMode] = useState<'now' | 'weekly' | 'monthly'>('now');
  const { setFullScanData } = useScanStore();
  
  // מצבים (States) להיסטוריה ודרופדאון
  const [history, setHistory] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const accentRed = '#E20613';

  // שליפת היסטוריה
  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/scans/history');
      const data = await response.json();
      setHistory(data);
      setIsDropdownOpen(!isDropdownOpen);
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
  };

  // טעינת סריקה ספציפית וקפיצה לדשבורד
  const loadSpecificScan = async (scanId: string) => {
    setIsDropdownOpen(false);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/scans/${scanId}`);
      const fullData = await response.json();
      setFullScanData(fullData); 
      
      // קופץ ישר לדשבורד (אם הוגדר) או מתחיל רגיל
      if (onDirectToDashboard) {
        onDirectToDashboard();
      } else {
        onStart();
      }
    } catch (e) {
      alert("שגיאה בטעינת נתוני סריקה");
    }
  };

  // סריקה אחרונה
  const loadLatestScan = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/scans/history');
      const data = await response.json();
      if (data && data.length > 0) {
        const latest = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        loadSpecificScan(latest.id);
      } else {
        alert("לא קיימות סריקות במערכת");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{
      backgroundColor: '#020617', color: '#ffffff', minHeight: '100vh', width: '100vw',
      display: 'flex', flexDirection: 'column', direction: 'rtl', fontFamily: "'Assistant', sans-serif",
      overflowY: 'auto', overflowX: 'hidden' // תיקון הגלילה
    }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;800;900&display=swap');
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(10px); } }
        .dropdown-item:hover { background-color: rgba(226, 6, 19, 0.1); color: #fff !important; }
      `}</style>

      {/* --- HERO SECTION --- */}
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '40px 80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  backgroundColor: accentRed, opacity: 1 - (i * 0.15),
                  boxShadow: i === 0 ? `0 0 15px ${accentRed}` : 'none'
                }} />
              ))}
            </div>
            <h2 style={{ margin: 0, fontWeight: 900, fontSize: '28px', letterSpacing: '-1px' }}>
              DIRECT <span style={{ opacity: 0.4 }}>AUDIT</span>
            </h2>
          </div>
          
          {/* כפתורי הפעולה החדשים (בסגנון גלולה) והדרופדאון */}
          <div style={{ position: 'relative', display: 'flex', gap: '15px' }}>
            <HeaderPillButton icon={<History size={16} />} label="תוצאות סריקה אחרונה" onClick={loadLatestScan} />
            <div style={{ position: 'relative' }}>
              <HeaderPillButton icon={<Archive size={16} />} label="סריקות קודמות" onClick={fetchHistory} active={isDropdownOpen} />
              
              {/* הדרופדאון */}
              {isDropdownOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, marginTop: '10px', width: '300px',
                  backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)', overflow: 'hidden', zIndex: 100
                }}>
                  <div style={{ padding: '15px', backgroundColor: '#020617', borderBottom: '1px solid #1e293b', fontSize: '14px', fontWeight: 'bold', color: '#94a3b8' }}>
                    בחר סריקה מהארכיון:
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {history.length > 0 ? history.map(scan => (
                      <div 
                        key={scan.id} 
                        className="dropdown-item"
                        onClick={() => loadSpecificScan(scan.id)}
                        style={{ 
                          padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', color: '#cbd5e1'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{new Date(scan.date).toLocaleDateString('he-IL', {day: '2-digit', month: '2-digit', year: 'numeric'})}</span>
                          <span style={{ fontSize: '12px', opacity: 0.7 }}>ביטוח ישיר</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '900', color: accentRed }}>{scan.total_score}%</span>
                          <ArrowLeft size={14} />
                        </div>
                      </div>
                    )) : (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>לא נמצאו סריקות</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '80px', padding: '0 80px 80px', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: 'clamp(4rem, 8vw, 7.5rem)', fontWeight: 900, lineHeight: 0.85, margin: '0 0 30px', letterSpacing: '-4px' }}>
              KNOW YOUR <br />
              <span style={{ color: accentRed }}>REPUTATION.</span>
            </h1>
            <p style={{ fontSize: '24px', color: '#94a3b8', fontWeight: 300, maxWidth: '600px', lineHeight: 1.3, marginBottom: '30px' }}>
              האם מנועי ה-AI ממליצים על ביטוח ישיר? <br />
              הסוכן החכם סורק את הרשת ומזקק את המציאות.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '70px' }}>
            <StepItem icon={<Search size={80} strokeWidth={1} />} title="Deep Scan" desc="סריקת מקורות AI בזמן אמת." />
            <StepItem icon={<Zap size={80} strokeWidth={1} />} title="AI Reasoning" desc="ניתוח לוגיקה וסנטימנט." />
            <StepItem icon={<Target size={80} strokeWidth={1} />} title="Verdict" desc="זיקוק תובנות אסטרטגיות." />
          </div>
        </main>

        <div style={{ textAlign: 'center', paddingBottom: '30px', color: '#64748b', animation: 'bounce 2s infinite' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '3px', display: 'block', marginBottom: '10px' }}>SCROLL FOR IMPACT</span>
          <ChevronDown size={24} style={{ margin: '0 auto' }} />
        </div>
      </div>

      {/* --- IMPACT SECTION --- */}
      <section style={{ padding: '100px 40px', display: 'flex', justifyContent: 'center', gap: '80px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1 }}>
          <AnimatedCounter target={78} suffix="%" delay={1000} />
          <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: '10px 0 5px' }}>המלצות מנועי שפה</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '16px' }}>אחוז הפעמים שהמותג מוביל כהמלצה</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1 }}>
          <AnimatedCounter target={42} prefix="-" suffix="%" delay={1000} />
          <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: '10px 0 5px' }}>דחיקת מתחרים</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '16px' }}>ירידה בנוכחות של חברות מתחרות בתשובות</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1 }}>
          <AnimatedCounter target={120} prefix="+" suffix="K" delay={1000} />
          <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: '10px 0 5px' }}>חשיפת GEO שנתית</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '16px' }}>לקוחות שייחשפו אלינו מממשקי שיחה</p>
        </div>
      </section>

      {/* --- ACTIVATION --- */}
      <section style={{ padding: '60px 40px 100px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
        <div style={{ 
          display: 'flex', backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px', 
          borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)'
        }}>
          <ScheduleButton icon={<Play size={16} />} label="הפעלה מיידית" active={scheduleMode === 'now'} onClick={() => setScheduleMode('now')} />
          <ScheduleButton icon={<Calendar size={16} />} label="תזמון שבועי" active={scheduleMode === 'weekly'} onClick={() => setScheduleMode('weekly')} />
          <ScheduleButton icon={<Clock size={16} />} label="תזמון חודשי" active={scheduleMode === 'monthly'} onClick={() => setScheduleMode('monthly')} />
        </div>
        <button 
          onClick={onStart} // הכפתור הזה תמיד מתחיל סריקה חדשה
          style={{
            padding: '20px 60px', backgroundColor: scheduleMode === 'now' ? accentRed : '#ffffff',
            color: scheduleMode === 'now' ? 'white' : '#020617', border: 'none', borderRadius: '100px',
            fontSize: '22px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px',
            transition: 'all 0.3s ease', boxShadow: scheduleMode === 'now' ? `0 20px 40px rgba(226, 6, 19, 0.4)` : `0 20px 40px rgba(255,255,255,0.1)`
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {scheduleMode === 'now' ? 'הפעל סוכן GEO עכשיו' : 'שמור והפעל אוטומציה'}
          <ShieldCheck size={24} />
        </button>
      </section>
    </div>
  );
};

// רכיבי העזר (Components)
const StepItem: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div style={{ display: 'flex', gap: '35px', alignItems: 'center' }}>
    <div style={{ color: '#ffffff', flexShrink: 0, opacity: 0.9 }}>{icon}</div>
    <div style={{ textAlign: 'right' }}>
      <h4 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{title}</h4>
      <p style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: 500 }}>{desc}</p>
    </div>
  </div>
);

const ScheduleButton = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
      backgroundColor: active ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none',
      borderRadius: '100px', color: active ? '#ffffff' : '#64748b', fontSize: '15px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s'
    }}
  >
    {icon} {label}
  </button>
);

// הכפתור החדש למעלה (בסגנון Pill)
const HeaderPillButton = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
      backgroundColor: active ? 'rgba(226, 6, 19, 0.1)' : 'rgba(255,255,255,0.03)', 
      border: `1px solid ${active ? '#E20613' : 'rgba(255,255,255,0.05)'}`,
      borderRadius: '100px', color: active ? '#fff' : '#94a3b8', fontSize: '14px', 
      fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(10px)'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'rgba(226, 6, 19, 0.1)';
      e.currentTarget.style.color = '#fff';
      e.currentTarget.style.borderColor = '#E20613';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = active ? 'rgba(226, 6, 19, 0.1)' : 'rgba(255,255,255,0.03)';
      e.currentTarget.style.color = active ? '#fff' : '#94a3b8';
      e.currentTarget.style.borderColor = active ? '#E20613' : 'rgba(255,255,255,0.05)';
    }}
  >
    {icon} {label} {active !== undefined && <ChevronDown size={14} style={{ transition: 'transform 0.3s', transform: active ? 'rotate(180deg)' : 'rotate(0deg)' }}/>}
  </button>
);

export default LandingView;