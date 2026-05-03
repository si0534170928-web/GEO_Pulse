import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// הוספת סימן הקריאה בסוף השורה פותרת את השגיאה
const rootElement = document.getElementById('root')!; 

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)