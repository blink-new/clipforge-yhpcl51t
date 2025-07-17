import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import App from './App'
import './index.css'

// Comprehensive browser extension error suppression
const isExtensionError = (error: any) => {
  const message = error?.message || ''
  const stack = error?.stack || ''
  
  return (
    message.includes('solana') ||
    message.includes('Cannot redefine property') ||
    message.includes('ethereum') ||
    message.includes('web3') ||
    stack.includes('chrome-extension://') ||
    stack.includes('moz-extension://') ||
    stack.includes('safari-extension://') ||
    stack.includes('extension')
  )
}

// Prevent property redefinition conflicts
const originalDefineProperty = Object.defineProperty
Object.defineProperty = function(obj: any, prop: string, descriptor: PropertyDescriptor) {
  try {
    return originalDefineProperty.call(this, obj, prop, descriptor)
  } catch (error: any) {
    if (error.message?.includes('Cannot redefine property') && 
        (prop === 'solana' || prop === 'ethereum' || prop === 'web3')) {
      // Silently ignore extension property conflicts
      console.debug(`Extension property conflict ignored: ${prop}`)
      return obj
    }
    throw error
  }
}

// Global error handling
window.addEventListener('error', (event) => {
  if (isExtensionError(event.error)) {
    event.preventDefault()
    event.stopPropagation()
    return false
  }
})

window.addEventListener('unhandledrejection', (event) => {
  if (isExtensionError(event.reason)) {
    event.preventDefault()
    return false
  }
})

// Override console.error to filter extension errors
const originalConsoleError = console.error
console.error = function(...args: any[]) {
  const message = args.join(' ')
  if (isExtensionError({ message, stack: new Error().stack })) {
    return // Silently ignore extension errors
  }
  originalConsoleError.apply(console, args)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Toaster position="top-right" />
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
) 