import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './menu.css';

/**
 * ErrorBoundary Component
 * 
 * Top-level error boundary that catches React errors and displays
 * a user-friendly fallback UI. Prevents the entire app from crashing
 * when a component error occurs.
 * 
 * Requirements: 10.3
 */
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
    // Log error details to console for debugging
    console.error('Menu System Error:', error, errorInfo);
    this.state.error = error;
    this.state.errorInfo = errorInfo;
  }

  handleReload = () => {
    // Reload the page to reset the application
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: '#fff',
            fontFamily: '"Minecraft", monospace',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: 'rgba(60, 60, 60, 0.95)',
              border: '2px solid #000',
              boxShadow: '4px 4px 0 rgba(0,0,0,0.5)',
              maxWidth: '500px',
            }}
          >
            <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>
              Menu System Error
            </h1>
            <p style={{ fontSize: '1rem', marginBottom: '30px' }}>
              Something went wrong with the menu system.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                padding: '12px 24px',
                fontSize: '1.2rem',
                fontFamily: '"Minecraft", monospace',
                backgroundColor: '#8B8B8B',
                color: '#fff',
                border: '2px solid #000',
                boxShadow: '4px 4px 0 rgba(0,0,0,0.5)',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              Reload Game
            </button>
            {this.state.error && (
              <details style={{ marginTop: '20px', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                  Error Details
                </summary>
                <pre
                  style={{
                    fontSize: '0.8rem',
                    backgroundColor: '#000',
                    padding: '10px',
                    overflow: 'auto',
                    maxHeight: '200px',
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
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

/**
 * React Entry Point
 * 
 * Initializes the React application and mounts it to the #menu-root element.
 * Wraps the App component in an ErrorBoundary for top-level error handling.
 * 
 * Requirements: 10.3
 */
const rootElement = document.getElementById('menu-root');

if (!rootElement) {
  console.error('Failed to find #menu-root element. Menu system cannot initialize.');
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
