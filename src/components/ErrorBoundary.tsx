import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Filter out browser extension errors that don't affect our app
    const isExtensionError = (
      error.message?.includes('solana') ||
      error.message?.includes('Cannot redefine property') ||
      error.message?.includes('ethereum') ||
      error.message?.includes('web3') ||
      error.stack?.includes('chrome-extension://') ||
      error.stack?.includes('moz-extension://') ||
      error.stack?.includes('safari-extension://') ||
      error.stack?.includes('extension')
    )
    
    if (isExtensionError) {
      console.debug('Browser extension error (ignored):', error.message)
      this.setState({ hasError: false })
      return
    }
    
    console.error('Application error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Don't show error UI for extension conflicts
      const isExtensionError = (
        this.state.error.message?.includes('solana') ||
        this.state.error.message?.includes('Cannot redefine property') ||
        this.state.error.message?.includes('ethereum') ||
        this.state.error.message?.includes('web3') ||
        this.state.error.stack?.includes('chrome-extension://') ||
        this.state.error.stack?.includes('moz-extension://') ||
        this.state.error.stack?.includes('safari-extension://') ||
        this.state.error.stack?.includes('extension')
      )
      
      if (isExtensionError) {
        return this.props.children
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <div className="h-16 w-16 rounded-lg bg-red-500/10 flex items-center justify-center mx-auto">
              <span className="text-red-500 font-bold text-xl">!</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Something went wrong</h1>
              <p className="text-muted-foreground">
                An unexpected error occurred. Please refresh the page to try again.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}