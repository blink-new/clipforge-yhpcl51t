import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import App from './App'
import './index.css'

// Suppress browser extension errors that don't affect our app
window.addEventListener('error', (event) => {
  if (event.error?.message?.includes('solana') || 
      event.error?.stack?.includes('chrome-extension')) {
    event.preventDefault()
    return false
  }
})

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('solana') || 
      event.reason?.stack?.includes('chrome-extension')) {
    event.preventDefault()
    return false
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Toaster position="top-right" />
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
) 