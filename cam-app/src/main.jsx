import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import MobileApp from './MobileApp.jsx'
import './index.css'

// Check if this is a mobile device or if mobile route is requested
const isMobile = window.location.pathname === '/mobile' || 
                 /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isMobile ? <MobileApp /> : <App />}
  </React.StrictMode>,
)
