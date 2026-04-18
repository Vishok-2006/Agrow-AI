import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Frontend render error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-agrow-dark px-4 text-agrow-text">
          <div className="glass-card max-w-xl p-8 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-agrow-accent">Agrow AI</p>
            <h1 className="mt-4 text-3xl font-bold text-white">Something went wrong</h1>
            <p className="mt-4 text-sm leading-7 text-agrow-text/80">
              The frontend hit a runtime error, but the app stayed mounted and showed this fallback instead of a blank screen.
            </p>
            {this.state.error?.message && (
              <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-left text-sm text-red-200">
                {this.state.error.message}
              </p>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-agrow-primary px-5 py-3 font-semibold text-white transition hover:bg-agrow-primary/90"
            >
              Reload Frontend
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
