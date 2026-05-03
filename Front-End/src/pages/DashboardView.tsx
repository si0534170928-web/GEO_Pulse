import React, { useState } from 'react';
import { 
  ChevronLeft, X, Target, ShieldCheck, ArrowRight, Crosshair, 
  AlertTriangle, Info, Zap, Terminal, Activity, 
  History, TrendingUp, TrendingDown, Minus, Wand2 
} from 'lucide-react';
import { useScanStore } from '../store/useScan.store';

interface DashboardItem {
  id: number | string;
  category_name: string;
  status: string;
  stats: { positive_pct: number };
  ai_verdict: string;
  action_item: string;
}

interface DashboardProps {
  onBack: () => void;
  onGenerateContent?: (categoryId: string, categoryName: string, actionItem: string) => void;
}

const DashboardView: React.FC<DashboardProps> = ({ onBack, onGenerateContent }) => {
  const { categories, isHistoricalView } = useScanStore();
  
  const [activeCategory, setActiveCategory] = useState<DashboardItem | null>(null);

  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [compareData, setCompareData] = useState<{
    categoryName: string; current: { pct: number; verdict: string };
    previous: { pct: number; verdict: string } | null;
  } | null>(null);

  const accentRed = '#E20613';
  const gridLine = 'rgba(255,255,255,0.1)';

  const gridColsTemplate = isHistoricalView ? '2fr 1fr 1.5fr 40px' : '2fr 1fr 1.5fr 140px 40px';

  const dashboardData: DashboardItem[] = categories.map(cat => ({
    id: cat.id, category_name: cat.name, status: cat.positive_pct < 50 ? 'קריטי' : 'תקין',
    stats: { positive_pct: cat.positive_pct }, ai_verdict: cat.ai_verdict, action_item: cat.action_item
  }));

  const avgSentiment = dashboardData.length > 0 
    ? Math.round(dashboardData.reduce((acc, curr) => acc + (curr?.stats?.positive_pct || 0), 0) / dashboardData.length)
    : 0;
  const criticalCount = dashboardData.filter(item => item?.status === 'קריטי').length;

  const handleCompare = async (e: React.MouseEvent, categoryId: string, categoryName: string, currentPct: number, currentVerdict: string) => {
    e.stopPropagation();
    setIsComparing(true);
    setCompareData({ categoryName, current: { pct: currentPct, verdict: currentVerdict }, previous: null });
    setCompareModalOpen(true);
    try {
      const historyRes = await fetch('http://localhost:8000/api/v1/scans/history');
      const historyList = await historyRes.json();
      const prevScanId = historyList.length > 1 ? historyList[1].id : historyList[0].id;
      const detailRes = await fetch(`http://localhost:8000/api/v1/scans/${prevScanId}`);
      const detailData = await detailRes.json();
      const prevCategory = detailData.categories.find((c: any) => c.id === categoryId);
      setCompareData({
        categoryName, current: { pct: currentPct, verdict: currentVerdict },
        previous: { pct: prevCategory?.positive_pct || 0, verdict: prevCategory?.ai_verdict || "אין נתונים קודמים להשוואה" }
      });
    } catch (e) { console.error("Failed to fetch compare data", e); } finally { setIsComparing(false); }
  };

  const renderRadarChart = () => {
    if (!dashboardData || dashboardData.length < 3) return null; 
    const size = 300, cx = size / 2, cy = size / 2, radius = 100, numAxes = dashboardData.length;
    const dataPoints = dashboardData.map((d, i) => {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const value = (d?.stats?.positive_pct || 0) / 100;
      return `${cx + radius * value * Math.cos(angle)},${cy + radius * value * Math.sin(angle)}`;
    }).join(' ');

    return (
      <svg width="100%" height="280" viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible', margin: '20px 0' }}>
        {[0.25, 0.5, 0.75, 1].map(level => {
          const pts = Array.from({ length: numAxes }).map((_, i) => {
            const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
            return `${cx + radius * level * Math.cos(angle)},${cy + radius * level * Math.sin(angle)}`;
          }).join(' ');
          return <polygon key={level} points={pts} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
        })}
        {dashboardData.map((d, i) => {
          const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
          const labelX = cx + (radius + 28) * Math.cos(angle);
          const labelY = cy + (radius + 18) * Math.sin(angle);
          const shortName = (d?.category_name || '').split(' ')[0]; 
          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={cx + radius * Math.cos(angle)} y2={cy + radius * Math.sin(angle)} stroke="rgba(255,255,255,0.1)" />
              <text x={labelX} y={labelY} fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">{shortName}</text>
            </g>
          );
        })}
        <polygon points={dataPoints} fill="rgba(226,6,19,0.15)" stroke={accentRed} strokeWidth="2" style={{ filter: `drop-shadow(0 0 8px rgba(226,6,19,0.4))` }}/>
        {dashboardData.map((d, i) => {
          const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
          const value = (d?.stats?.positive_pct || 0) / 100;
          return <circle key={`p-${i}`} cx={cx + radius * value * Math.cos(angle)} cy={cy + radius * value * Math.sin(angle)} r="4" fill="#fff" stroke={accentRed} strokeWidth="1.5" />;
        })}
      </svg>
    );
  };

  return (
    <div style={{ backgroundColor: '#020617', color: '#ffffff', minHeight: '100vh', width: '100vw', padding: '30px', direction: 'rtl', fontFamily: "'Assistant', system-ui, sans-serif" }}>
      
      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
        @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        
        @keyframes borderDance {
          0% { border-color: #ff0080; }
          25% { border-color: #7928ca; }
          50% { border-color: #0070f3; }
          75% { border-color: #10b981; }
          100% { border-color: #ff0080; }
        }

        .magic-btn {
          background-color: #ffffff;
          color: #0f172a; 
          border: 2px solid transparent; 
          animation: borderDance 4s linear infinite;
          padding: 8px 18px; 
          border-radius: 50px; 
          font-family: system-ui, -apple-system, sans-serif !important; /* פונט SYSTEM UI מעודכן */
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 15px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .magic-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(255,255,255,0.2);
        }
      `}</style>

      <div style={{ border: `1px solid ${gridLine}`, backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${gridLine}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h2 style={{ margin: 0, fontWeight: 900, fontSize: '22px', letterSpacing: '-1px', color: 'white' }}>DIRECT <span style={{ opacity: 0.4 }}>AUDIT</span></h2>
          </div>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold' }}>
            <ArrowRight size={16} /> חזור למרכז הבקרה
          </button>
        </div>
        <div style={{ display: 'flex', fontFamily: 'monospace' }}>
          <TelemetryItem label="מדד סנטימנט גלובלי" value={`${avgSentiment}%`} size="36px" highlight={avgSentiment > 70} alert={avgSentiment < 50} />
          <TelemetryItem label="התראות קריטיות" value={`0${criticalCount}`} size="36px" alert={criticalCount > 0} />
          <TelemetryItem label="קטגוריות בסריקה" value={`${dashboardData.length}`} size="36px" />
        </div>
      </div>

      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1.2fr 2.5fr', gap: '20px', height: 'calc(100vh - 200px)' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '5px' }}>
          <div style={{ border: `1px solid ${gridLine}`, backgroundColor: '#0f172a', padding: '15px', position: 'relative', flexShrink: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}><span>מכ"ם תפיסת מותג</span><Crosshair size={14} color={accentRed} /></div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>{renderRadarChart()}</div>
          </div>
        </div>

        <div style={{ border: `1px solid ${gridLine}`, backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '15px 20px', borderBottom: `2px solid ${gridLine}`, display: 'grid', gridTemplateColumns: gridColsTemplate, fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>
            <div>קטגוריה אסטרטגית</div>
            <div style={{ textAlign: 'center' }}>סטטוס סריקה</div>
            <div>סנטימנט חיובי</div>
            {!isHistoricalView && <div style={{ textAlign: 'center' }}>מגמה</div>}
            <div></div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {dashboardData.map((item) => (
              <div key={`row-${item.id}`} onClick={() => setActiveCategory(item)} style={{ display: 'grid', gridTemplateColumns: gridColsTemplate, padding: '20px', borderBottom: `1px solid ${gridLine}`, cursor: 'pointer', alignItems: 'center', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f8fafc' }}>{item?.category_name}</div>
                <div style={{ textAlign: 'center' }}><span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '2px', border: `1px solid ${item?.status === 'קריטי' ? accentRed : '#334155'}`, color: item?.status === 'קריטי' ? accentRed : '#94a3b8', fontWeight: 'bold' }}>{item?.status}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingLeft: '10px' }}><div style={{ flex: 1, height: '4px', backgroundColor: '#1e293b', borderRadius: '2px' }}><div style={{ height: '100%', backgroundColor: (item?.stats?.positive_pct || 0) > 60 ? '#4ade80' : accentRed, width: `${item?.stats?.positive_pct || 0}%` }} /></div><span style={{ fontSize: '14px', fontFamily: 'monospace', color: '#cbd5e1' }}>{item?.stats?.positive_pct || 0}%</span></div>
                
                {!isHistoricalView && (
                  <div style={{ textAlign: 'center' }}>
                    <button onClick={(e) => handleCompare(e, String(item.id), item.category_name, item.stats.positive_pct, item.ai_verdict)} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                      <History size={12} /> השוואת ביצועים
                    </button>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}><ChevronLeft size={18} color="#64748b" /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeCategory && (
        <>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2,6,23,0.85)', zIndex: 40 }} onClick={() => setActiveCategory(null)} />
          <div style={{ 
            position: 'fixed', top: 0, left: 0, width: '600px', height: '100vh', backgroundColor: '#0f172a', zIndex: 50, borderRight: `2px solid ${activeCategory?.status === 'קריטי' ? accentRed : '#334155'}`,
            animation: 'slideInLeft 0.3s ease-out', display: 'flex', flexDirection: 'column', boxShadow: '25px 0 50px rgba(0,0,0,0.5)'
          }}>
            <div style={{ padding: '30px 40px', borderBottom: `1px solid ${gridLine}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: '#020617' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Activity size={14} /> ניתוח עומק לקטגוריה</div>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.5px' }}>{activeCategory?.category_name || 'קטגוריה'}</h2>
              </div>
              <button onClick={() => setActiveCategory(null)} style={{ background: '#1e293b', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}><X size={20} /></button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ padding: '20px', backgroundColor: '#020617', border: `1px solid ${gridLine}`, borderRadius: '4px' }}>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '10px', fontWeight: 'bold' }}>מדד סנטימנט קטגוריאלי</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}><div style={{ fontSize: '32px', fontWeight: '900', fontFamily: 'monospace', color: (activeCategory?.stats?.positive_pct || 0) > 60 ? '#4ade80' : accentRed }}>{activeCategory?.stats?.positive_pct || 0}%</div></div>
                </div>
              </div>
              
              <section>
                <div style={{ color: '#94a3b8', fontSize: '15px', fontWeight: 'bold', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldCheck size={18} /> תמונת המצב במנועי ה-AI</div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '6px', borderRight: `3px solid #334155`, fontSize: '18px', lineHeight: '1.6', color: '#f1f5f9' }}>{activeCategory?.ai_verdict || 'אין מידע זמין'}</div>
              </section>
              
              <section>
                <div style={{ color: activeCategory?.status === 'קריטי' ? accentRed : '#4ade80', fontSize: '15px', fontWeight: 'bold', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}><Zap size={18} /> המלצות המומחה לשינוי המפה</div>
                <div style={{ backgroundColor: activeCategory?.status === 'קריטי' ? 'rgba(226,6,19,0.08)' : 'rgba(74, 222, 128, 0.05)', padding: '30px', borderRadius: '6px', border: `1px solid ${activeCategory?.status === 'קריטי' ? 'rgba(226,6,19,0.2)' : 'rgba(74, 222, 128, 0.2)'}`, fontSize: '16px', fontWeight: '600', lineHeight: '1.6', color: '#ffffff' }}>
                  {activeCategory?.action_item || 'אין המלצות זמינות'}
                  
                  <div style={{ marginTop: '5px' }}>
                    <button 
                      className="magic-btn"
                      onClick={() => {
                        if (onGenerateContent) {
                          onGenerateContent(String(activeCategory.id), activeCategory.category_name, activeCategory.action_item);
                        } else {
                          alert("שגיאה בהעברה - אנא ודא שהקובץ App.tsx עודכן.");
                        }
                      }}
                    >
                      <Wand2 size={16} /> קבלתי את ההמלצה, צור לי תוכן
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </>
      )}

      {compareModalOpen && compareData && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
           <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '20px', width: '90%', maxWidth: '900px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 30px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>השוואת נתונים: <span style={{ color: '#3b82f6' }}>{compareData.categoryName}</span></h2>
              <button onClick={() => setCompareModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <div style={{ display: 'flex', minHeight: '300px' }}>
              <div style={{ flex: 1, padding: '30px', borderLeft: '1px solid #1e293b', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><History size={16} /> סריקה קודמת</div>
                {isComparing || !compareData.previous ? (<div style={{ color: '#475569', textAlign: 'center', marginTop: '50px' }}>טוען נתוני עבר...</div>) : (<><div style={{ fontSize: '48px', fontWeight: '900', color: '#94a3b8', lineHeight: 1, marginBottom: '20px' }}>{compareData.previous.pct}%</div><p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6' }}>{compareData.previous.verdict}</p></>)}
              </div>
              <div style={{ flex: 1, padding: '30px' }}>
                <div style={{ color: '#3b82f6', fontSize: '14px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={16} /> סריקה נוכחית (היום)</div>
                <div style={{ fontSize: '48px', fontWeight: '900', color: '#fff', lineHeight: 1, marginBottom: '20px' }}>{compareData.current.pct}%</div><p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.6' }}>{compareData.current.verdict}</p>
              </div>
            </div>
            {!isComparing && compareData.previous && (
              <div style={{ padding: '20px 30px', borderTop: '1px solid #1e293b', backgroundColor: '#020617' }}>
                {(() => {
                  const diff = compareData.current.pct - compareData.previous.pct;
                  if (diff > 0) return (<div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', fontWeight: 'bold', fontSize: '16px' }}><div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '50%' }}><TrendingUp size={20} /></div>מגמת שיפור! האלגוריתם מזהה עלייה של {diff}% בסמכות המותג.</div>);
                  if (diff < 0) return (<div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: accentRed, fontWeight: 'bold', fontSize: '16px' }}><div style={{ background: 'rgba(226, 6, 19, 0.1)', padding: '8px', borderRadius: '50%' }}><TrendingDown size={20} /></div>מגמת ירידה. זוהתה שחיקה של {Math.abs(diff)}%. נדרשת התערבות אסטרטגית.</div>);
                  return (<div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontWeight: 'bold', fontSize: '16px' }}><div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '50%' }}><Minus size={20} /></div>יציבות. לא זוהה שינוי באחוזי ההמלצה בזירה זו.</div>);
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TelemetryItem = ({ label, value, highlight, alert, size }: any) => (
  <div style={{ flex: 1, padding: '20px 25px', borderLeft: '1px solid rgba(255,255,255,0.1)', backgroundColor: alert ? 'rgba(226,6,19,0.05)' : 'transparent', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: 'bold', letterSpacing: '1px' }}>{label}</div>
    <div style={{ fontSize: size, fontWeight: '900', color: alert ? '#E20613' : highlight ? '#4ade80' : 'white', fontFamily: 'monospace' }}>{value}</div>
  </div>
);

export default DashboardView;