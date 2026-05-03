import React, { useState } from 'react';
import LandingView from './pages/LandingView';
import ScanningView from './pages/ScanningView';
import DashboardView from './pages/DashboardView';
import ContentCreatorView from './pages/ContentCreatorView'; 

type AppStep = 'landing' | 'scanning' | 'dashboard' | 'content-creator';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('landing');
  
  // הסטייט הזה שומר את הנתונים שאנחנו רוצים להעביר למסך יצירת התוכן
  const [contentData, setContentData] = useState({ id: '', name: '', action: '' });

  const appStyle: React.CSSProperties = {
    backgroundColor: '#020617',
    minHeight: '100vh',
    width: '100vw',
    margin: 0,
    padding: 0,
    overflowX: 'hidden',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  };

  return (
    <div style={appStyle}>
      {currentStep === 'landing' && (
        <LandingView 
          onStart={() => setCurrentStep('scanning')} 
          onDirectToDashboard={() => setCurrentStep('dashboard')}
        />
      )}
      
      {currentStep === 'scanning' && (
        <ScanningView onComplete={() => setCurrentStep('dashboard')} />
      )}
      
      {currentStep === 'dashboard' && (
        <DashboardView 
          onBack={() => setCurrentStep('landing')} 
          onGenerateContent={(id, name, action) => {
            setContentData({ id, name, action });
            setCurrentStep('content-creator'); // כאן מתבצע המעבר כשלוחצים על הכפתור!
          }}
        />
      )}

      {currentStep === 'content-creator' && (
        <ContentCreatorView 
          categoryId={contentData.id}
          categoryName={contentData.name}
          actionItem={contentData.action}
          onBack={() => setCurrentStep('dashboard')}
        />
      )}
    </div>
  );
};

export default App;