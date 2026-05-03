import React, { useEffect } from 'react';
import { ChevronLeft, FileText, User, Bot, Copy, CheckCircle2, Globe, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useScanStore } from '../store/useScan.store';

interface ContentCreatorProps {
  categoryId: string;
  categoryName: string;
  actionItem: string;
  onBack: () => void;
}

const ContentCreatorView: React.FC<ContentCreatorProps> = ({ categoryId, categoryName, actionItem, onBack }) => {
  const { generatedContent, isGeneratingContent, startContentGeneration, resetContentGeneration, closeContentStream } = useScanStore();
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    resetContentGeneration();
    startContentGeneration(categoryId);

    // תיקון הבאג: פונקציית ניקוי שנסגרת כשהמסך נסגר או מתרפרש
    return () => {
      closeContentStream();
    };
  }, [categoryId, startContentGeneration, resetContentGeneration, closeContentStream]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ backgroundColor: '#020617', color: '#ffffff', minHeight: '100vh', padding: '30px', direction: 'rtl', fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      <style>{`
        .markdown-chat h2 { font-size: 22px; font-weight: 800; color: #f8fafc; margin-top: 20px; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px; }
        .markdown-chat h3 { font-size: 19px; font-weight: 700; color: #e2e8f0; margin-top: 20px; margin-bottom: 10px; }
        .markdown-chat p { margin-bottom: 15px; line-height: 1.8; font-size: 16px; }
        .markdown-chat ul { padding-right: 25px; margin-bottom: 15px; }
        .markdown-chat li { margin-bottom: 10px; line-height: 1.6; }
        .markdown-chat strong { color: #3b82f6; font-weight: 800; }
        
        .chat-scroll::-webkit-scrollbar { width: 6px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }

        @keyframes spin { 100% { transform: rotate(360deg); } }
        .bot-spinner {
          position: absolute; top: -4px; left: -4px; right: -4px; bottom: -4px;
          border: 2px solid rgba(16, 185, 129, 0.2);
          border-top-color: #10b981; border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .modern-back-btn {
          display: flex; align-items: center; gap: 12px;
          background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 100px; padding: 6px 16px 6px 6px; color: #94a3b8;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .modern-back-btn:hover {
          background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.15);
          color: #fff; transform: translateX(-5px);
        }
        .modern-back-btn .btn-icon-wrapper {
          background: rgba(0, 0, 0, 0.3); border-radius: 50%;
          width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
          transition: all 0.3s ease;
        }
        .modern-back-btn:hover .btn-icon-wrapper {
          background: #3b82f6; color: white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
      `}</style>

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText color="#94a3b8" size={24} />
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#f1f5f9' }}>אסיסטנט יצירת תוכן אסטרטגי</h1>
        </div>
        
        <button onClick={onBack} className="modern-back-btn">
          <span>חזרה לדשבורד</span>
          <div className="btn-icon-wrapper">
            <ChevronLeft size={16} />
          </div>
        </button>
      </header>

      {/* אזור מרכזי - המבנה החדש (שמאל רחב, ימין צר) */}
      <div style={{ display: 'flex', gap: '40px', marginTop: '20px', height: 'calc(100vh - 150px)' }}>
        
        {/* החלק השמאלי: הצ'אט והתוכן (עכשיו רחב מאד - flex: 2) */}
        <div className="chat-scroll" style={{ flex: '2', backgroundColor: '#020617', display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingLeft: '20px' }}>
          
          {/* בועת המשתמש */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#1e293b', padding: '25px', borderRadius: '16px', marginBottom: '25px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} color="#cbd5e1" />
              </div>
              <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#cbd5e1' }}>מנהל אסטרטגיה</span>
            </div>
            <div style={{ fontSize: '16px', color: '#f1f5f9', lineHeight: '1.6' }}>
              אנא כתוב עבורי תוכן מקצועי וממוטב עבור מנועי בינה מלאכותית, שיוכל להיות מוטמע באתר וייתן מענה לחולשה בזירת <strong>{categoryName}</strong>. 
            </div>
          </div>

          {/* בועת ה-AI (רחבה) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', marginBottom: '40px', position: 'relative' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ position: 'relative', width: '32px', height: '32px' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
                    <Bot size={20} color="white" />
                  </div>
                  {isGeneratingContent && <div className="bot-spinner" />}
                </div>
                <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#10b981' }}>GEO Agent</span>
              </div>
              
              {generatedContent && (
                <button 
                  onClick={handleCopy}
                  disabled={isGeneratingContent}
                  style={{ background: 'none', border: 'none', color: copied ? '#10b981' : '#94a3b8', cursor: 'pointer' }}
                >
                  {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                </button>
              )}
            </div>

            <div className="markdown-chat">
              <ReactMarkdown>
                {generatedContent || (isGeneratingContent ? 'מייצר תוכן אסטרטגי...' : '')}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* החלק הימני: מידע עזר (עכשיו צר מאד - flex: 0.4) */}
        <div style={{ flex: '0.4', minWidth: '250px', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 20px', color: '#e2e8f0', fontSize: '15px', fontWeight: '600', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>הקשר הבקשה</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '5px' }}>זירה נחקרת:</div>
            <div style={{ color: '#cbd5e1', fontSize: '15px', fontWeight: 'bold' }}>{categoryName}</div>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>יעד אסטרטגי:</div>
            <p style={{ color: '#cbd5e1', lineHeight: '1.5', margin: 0, fontSize: '13px' }}>{actionItem}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
              <Globe size={16} />
              <span style={{ fontSize: '13px' }}>עמוד נחיתה / בלוג</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
              <Code size={16} />
              <span style={{ fontSize: '13px' }}>Schema.org FAQ</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContentCreatorView;