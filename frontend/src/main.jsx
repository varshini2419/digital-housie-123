import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Always enforce clean white / light theme across the application
if (typeof document !== 'undefined') {
  document.documentElement.classList.remove('dark');
  document.documentElement.classList.add('light');
  try {
    localStorage.setItem('theme', 'light');
  } catch (_) {}
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

