import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import MenuLayout from './MenuLayout';

/**
 * ErrorBoundary Component
 * 
 * React error boundary that catches JavaScript errors in child components,
 * logs them to the console, and displays a user-friendly fallback UI.
 * 
 * Features:
 * - Catches errors during rendering, lifecycle methods, and constructors
 * - Logs error details to console for debugging
 * - Displays Minecraft-styled error message
 * - Provides "Return to Main Menu" button for recovery
 * 
 * Requirements: 9.5
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details to console for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error details:', errorInfo);
    
    // Store error information in state
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

/**
 * ErrorFallback Component
 * 
 * Fallback UI displayed when an error is caught by ErrorBoundary.
 * Uses MenuLayout for consistent styling with the rest of the menu system.
 */
const ErrorFallback = ({ error }) => {
  const navigate = useNavigate();

  const handleReturnToMenu = () => {
    // Reset error state and navigate to main menu
    navigate('/');
    // Force page reload to clear any corrupted state
    window.location.reload();
  };

  return (
    <MenuLayout title="Error">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100%',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: '#FF6B6B',
            textShadow: '2px 2px 0 rgba(0, 0, 0, 0.8)',
            marginBottom: 2,
          }}
        >
          Oops! Something went wrong
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: '#FFFFFF',
            maxWidth: '400px',
            marginBottom: 2,
          }}
        >
          The menu encountered an unexpected error. Don't worry, your game progress is safe.
        </Typography>

        {error && (
          <Typography
            variant="body2"
            sx={{
              color: '#CCCCCC',
              fontFamily: 'monospace',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              padding: '12px',
              borderRadius: '4px',
              maxWidth: '400px',
              wordBreak: 'break-word',
              marginBottom: 2,
            }}
          >
            {error.toString()}
          </Typography>
        )}

        <Button
          variant="contained"
          size="large"
          onClick={handleReturnToMenu}
          sx={{
            fontSize: '1.2rem',
            padding: '16px 32px',
            backgroundColor: '#8B8B8B',
            color: '#FFFFFF',
            border: '3px solid #000',
            borderRadius: 0,
            boxShadow: '5px 5px 0 rgba(0, 0, 0, 0.6)',
            textShadow: '2px 2px 0 rgba(0, 0, 0, 0.8)',
            '&:hover': {
              backgroundColor: '#A0A0A0',
              boxShadow: '6px 6px 0 rgba(0, 0, 0, 0.7)',
              transform: 'translate(-1px, -1px)',
            },
            '&:active': {
              boxShadow: '2px 2px 0 rgba(0, 0, 0, 0.5)',
              transform: 'translate(3px, 3px)',
            },
          }}
        >
          Return to Main Menu
        </Button>
      </Box>
    </MenuLayout>
  );
};

export default ErrorBoundary;
