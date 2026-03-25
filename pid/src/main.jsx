import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initializeApp } from 'firebase/app'
import './index.css'
import App from './App.jsx'
import { getConsent } from './lib/consent.js'
import { enableAnalytics } from './lib/firebaseAnalytics.js'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
}
if (
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
) {
  const app = initializeApp(firebaseConfig)
  if (getConsent() === 'accepted') {
    enableAnalytics(app)
  }
  globalThis.__firebaseApp = app
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
