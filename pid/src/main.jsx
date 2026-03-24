import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import './index.css'
import App from './App.jsx'

const firebaseConfig = {
  apiKey: 'AIzaSyBslnlWqlO4nL5fxuwel4ItCJDkBxIsdP4',
  authDomain: 'ibrahima-baby.firebaseapp.com',
  projectId: 'ibrahima-baby',
  storageBucket: 'ibrahima-baby.firebasestorage.app',
  messagingSenderId: '337846351178',
  appId: '1:337846351178:web:aeec542ed4892f1db63db3',
  measurementId: 'G-YRSLBJ7D0P',
}
const app = initializeApp(firebaseConfig)
isSupported().then((ok) => {
  if (ok) getAnalytics(app)
}).catch(() => {})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

const loader = document.getElementById('app-loader')
if (loader) {
  loader.classList.add('hidden')
  loader.addEventListener('transitionend', () => {
    loader.remove()
  }, { once: true })
}
