import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and potentially to a logging service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>Sorry, an unexpected error has occurred. Please contact profgarrett@gmail.com for help.</p>
          
          {process.env.NODE_ENV === 'development' && (
            <details style={{ textAlign: 'left', marginTop: '1rem' }}>
              <summary>Error Details (Development)</summary>
              <div style={{ marginTop: '1rem' }}>
                <h3>Error:</h3>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', color: 'red' }}>
                  {this.state.error && this.state.error.toString()}
                </pre>
                
                <h3>Component Stack:</h3>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            </details>
          )}
          
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              marginTop: '1rem', 
              padding: '0.5rem 1rem', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
