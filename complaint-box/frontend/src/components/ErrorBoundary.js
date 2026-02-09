import React from 'react';

/**
 * Global Error Boundary
 * Catches unhandled client-side exceptions and shows a friendly fallback
 * instead of Vercel's generic "Application error" crash screen.
 *
 * This is critical for mobile browsers where polyfill / wallet-adapter
 * issues can throw during render.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: '#f8fafc',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: 420 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: 28,
              }}
            >
              ⚠️
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', margin: '0 0 0.5rem' }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
              The app encountered an unexpected error. This can happen on some
              mobile browsers due to wallet compatibility. Please try again.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                padding: '12px 32px',
                background: '#DC143C',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reload Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginTop: 24, textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', fontSize: 12, color: '#94a3b8' }}>
                  Error details
                </summary>
                <pre
                  style={{
                    fontSize: 11,
                    background: '#f1f5f9',
                    padding: 12,
                    borderRadius: 8,
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    marginTop: 8,
                  }}
                >
                  {this.state.error.toString()}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
