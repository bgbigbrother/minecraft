import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, LinearProgress, Button } from '@mui/material';
import MenuLayout from './MenuLayout.jsx';

// Debug flag for loading screen logging
// Set to true to enable detailed debug messages
// Requirements: 8.1, 8.2, 8.3
const LOADING_DEBUG = false;

/**
 * Debug logger utility function
 * Logs messages to console when LOADING_DEBUG is enabled
 * 
 * @param {string} category - The category of the log message (e.g., 'LoadingScreen', 'Events')
 * @param {string} message - The log message
 * @param {*} data - Optional data to log (will be stringified if object)
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.5, 8.6, 8.8
 */
const debugLog = (category, message, data) => {
  if (!LOADING_DEBUG) return;
  
  const timestamp = new Date().toISOString();
  const dataStr = data !== undefined ? (typeof data === 'object' ? JSON.stringify(data, null, 2) : data) : '';
  console.log(`[${timestamp}][Loading][${category}] ${message}`, dataStr);
};

/**
 * LoadingScreen Component
 * 
 * Displays chunk loading progress during world generation.
 * Automatically transitions to gameplay when loading completes.
 * 
 * Features:
 * - Real-time progress bar showing chunk loading percentage
 * - Status messages indicating current loading phase
 * - Automatic transition to /game route when complete
 * - Error handling with timeout detection
 * - Return to menu option on errors
 * 
 * Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.4, 4.1, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5
 */
const LoadingScreen = memo(() => {
  const navigate = useNavigate();

  // Component state
  const [progress, setProgress] = useState(0);
  const [currentChunks, setCurrentChunks] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [status, setStatus] = useState('Initializing...');
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Component lifecycle logging
   * Logs mount and unmount events for debugging
   * Requirements: 8.6
   */
  useEffect(() => {
    debugLog('LoadingScreen', 'Component mounted', {});
    
    return () => {
      debugLog('LoadingScreen', 'Component unmounted', {});
    };
  }, []);

  /**
   * Listen for progress events from world generation
   * Updates progress bar and status message in real-time
   * Requirements: 1.2, 1.3, 5.3, 6.1, 8.5
   */
  useEffect(() => {
    const handleProgressUpdate = (event) => {
      debugLog('LoadingScreen', 'Progress event received', event.detail);
      
      const { progress: progressValue, current, total } = event.detail;
      
      setProgress(progressValue);
      setCurrentChunks(current);
      setTotalChunks(total);
      
      // Update status message based on progress
      let newStatus;
      if (progressValue < 100) {
        newStatus = `Generating terrain... ${current}/${total} chunks`;
        setStatus(newStatus);
      }
      
      debugLog('LoadingScreen', 'State updated', {
        progress: progressValue,
        currentChunks: current,
        totalChunks: total,
        status: newStatus || status
      });
    };

    document.addEventListener('game:loading:progress', handleProgressUpdate);

    return () => {
      document.removeEventListener('game:loading:progress', handleProgressUpdate);
    };
  }, [status]);

  /**
   * Listen for world loaded event
   * Triggers completion state and status update
   * Requirements: 2.1, 4.5, 5.4, 6.3, 8.5
   */
  useEffect(() => {
    const handleWorldLoaded = () => {
      debugLog('LoadingScreen', 'World loaded event received', {});
      
      setIsComplete(true);
      setStatus('World ready!');
      
      debugLog('LoadingScreen', 'State updated', {
        isComplete: true,
        status: 'World ready!'
      });
    };

    document.addEventListener('game:engine:world:loaded', handleWorldLoaded);

    return () => {
      document.removeEventListener('game:engine:world:loaded', handleWorldLoaded);
    };
  }, []);

  /**
   * Automatic transition to gameplay when loading completes
   * Dispatches resume event and navigates to /game route
   * Requirements: 2.1, 2.2, 2.4, 4.5, 8.5
   */
  useEffect(() => {
    if (isComplete) {
      // Dispatch game:menu:resume event with timestamp
      const timestamp = Date.now();
      const resumeEvent = new CustomEvent('game:menu:resume', {
        detail: {
          timestamp
        },
        bubbles: true,
        cancelable: true
      });
      
      debugLog('LoadingScreen', 'Resume event dispatched', { timestamp });
      document.dispatchEvent(resumeEvent);

      // Navigate to game route
      debugLog('LoadingScreen', 'Navigating to game', {});
      navigate('/game');
    }
  }, [isComplete, navigate]);

  /**
   * Timeout detection - show error if no progress after 30 seconds
   * Requirements: 5.5, 8.8
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isComplete && progress === 0) {
        const timeoutError = 'Loading timeout. World generation is taking too long.';
        debugLog('LoadingScreen', 'Timeout detected', { elapsed: 30000 });
        setError(timeoutError);
      }
    }, 30000); // 30 seconds

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isComplete, progress]);

  /**
   * Error logging - log errors when they occur
   * Requirements: 8.8
   */
  useEffect(() => {
    if (error) {
      // Create an error object for logging with stack trace
      const errorObj = new Error(error);
      debugLog('LoadingScreen', 'Error occurred', {
        error: error,
        stack: errorObj.stack
      });
    }
  }, [error]);

  /**
   * Handle return to menu button click
   * Requirements: 5.5
   */
  const handleReturnToMenu = () => {
    navigate('/');
  };

  return (
    <MenuLayout title="Loading World">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100%',
          gap: 4,
        }}
      >
        {/* Error Display */}
        {error && (
          <Box
            sx={{
              width: '100%',
              maxWidth: '400px',
              padding: 3,
              backgroundColor: 'rgba(211, 47, 47, 0.2)',
              border: '2px solid #FF6B6B',
              boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.5)',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: '#FF6B6B',
                textAlign: 'center',
                marginBottom: 2,
                textShadow: '2px 2px 0 rgba(0, 0, 0, 0.8)',
              }}
            >
              Error
            </Typography>
            <Typography
              sx={{
                color: '#FFFFFF',
                textAlign: 'center',
                marginBottom: 2,
              }}
            >
              {error}
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={handleReturnToMenu}
              sx={{
                backgroundColor: '#8B8B8B',
                color: '#FFFFFF',
                border: '2px solid #000',
                borderRadius: 0,
                boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.5)',
                '&:hover': {
                  backgroundColor: '#A0A0A0',
                  boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.6)',
                },
              }}
            >
              Return to Menu
            </Button>
          </Box>
        )}

        {/* Progress Display */}
        {!error && (
          <>
            {/* Status Message */}
            <Typography
              variant="h5"
              sx={{
                color: '#FFFFFF',
                textAlign: 'center',
                textShadow: '2px 2px 0 rgba(0, 0, 0, 0.8)',
                marginBottom: 2,
              }}
            >
              {status}
            </Typography>

            {/* Progress Bar */}
            <Box
              sx={{
                width: '100%',
                maxWidth: '400px',
              }}
            >
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 24,
                  backgroundColor: 'rgba(40, 40, 40, 0.8)',
                  border: '2px solid #000',
                  boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.5)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#7CBD3B',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                  },
                }}
              />
            </Box>

            {/* Percentage Display */}
            <Typography
              variant="h4"
              sx={{
                color: '#FFFFFF',
                textAlign: 'center',
                textShadow: '3px 3px 0 rgba(0, 0, 0, 0.8)',
                fontWeight: 'bold',
              }}
            >
              {Math.round(progress)}%
            </Typography>

            {/* Chunk Count Display */}
            {totalChunks > 0 && (
              <Typography
                variant="body1"
                sx={{
                  color: '#CCCCCC',
                  textAlign: 'center',
                  textShadow: '2px 2px 0 rgba(0, 0, 0, 0.8)',
                }}
              >
                {currentChunks} / {totalChunks} chunks loaded
              </Typography>
            )}
          </>
        )}
      </Box>
    </MenuLayout>
  );
});

LoadingScreen.displayName = 'LoadingScreen';

export default LoadingScreen;
