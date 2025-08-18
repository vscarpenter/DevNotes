import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

// Handle PWA shortcuts and deep linking
const handleURLParameters = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  const guide = urlParams.get('guide');
  
  if (action) {
    // Store the action to be handled by the app after initialization
    sessionStorage.setItem('pwa-action', action);
    
    // Clean up the URL
    const url = new URL(window.location.href);
    url.searchParams.delete('action');
    window.history.replaceState({}, '', url.toString());
  }
  
  // Handle guide deep linking - don't clean up these parameters
  // as they will be handled by the UserGuideStore
  if (guide === 'true') {
    // The UserGuideStore will handle opening the guide with the correct section
    console.log('Deep link to user guide detected');
  }
};

// Handle URL parameters on app load
handleURLParameters();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)