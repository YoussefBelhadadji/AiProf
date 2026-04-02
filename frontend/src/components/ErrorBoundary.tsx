import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[WriteLens] Uncaught error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text-primary)] flex flex-col items-center justify-center p-8 gap-6">
          {/* FIX: Converted all inline styles to Tailwind CSS classes for consistency and maintainability */}
          <div className="w-16 h-16 rounded-full bg-[var(--lav-glow)] border border-[var(--lav-border)] flex items-center justify-center text-3xl font-navigation font-bold">
            !
          </div>
          <div className="text-center">
            <h1 className="font-editorial text-3xl italic mb-3 text-[var(--text-primary)]">
              Something went wrong
            </h1>
            <p className="font-body text-sm text-[var(--text-sec)] max-w-md leading-loose">
              An unexpected error occurred in this section. The rest of the application is still intact.
            </p>
            {this.state.error && (
              <details className="mt-4 max-w-lg text-left">
                <summary className="font-navigation text-xs text-[var(--text-sec)] cursor-pointer">
                  Technical details
                </summary>
                <pre className="mt-3 font-forensic text-xs text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3 overflow-x-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
          <button
            onClick={this.handleReset}
            className="font-navigation font-semibold text-xs tracking-wider px-6 py-2.5 bg-gradient-to-br from-[var(--lav)] to-[var(--lav-dim)] text-white border border-white/10 rounded-lg shadow-lg shadow-[var(--lav-glow)] hover:scale-105 transition-transform"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
