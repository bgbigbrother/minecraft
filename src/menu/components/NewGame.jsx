import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Alert } from '@mui/material';
import MenuLayout from './MenuLayout.jsx';
import { useLocalization } from '../hooks/useLocalization.js';

/**
 * NewGame Component
 * 
 * Provides a form for creating a new game world with a custom name.
 * Validates input, calls game bridge to start new game, and requests pointer lock.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
const NewGame = memo(() => {
  const navigate = useNavigate();
  const { strings } = useLocalization();

  // Form state
  const [worldName, setWorldName] = useState('');
  const [error, setError] = useState('');

  /**
   * Handle back button click - return to main menu
   */
  const handleBack = () => {
    navigate('/');
  };

  /**
   * Handle world name input change
   */
  const handleWorldNameChange = (event) => {
    setWorldName(event.target.value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  /**
   * Validate world name
   * @returns {boolean} True if valid, false otherwise
   */
  const validateWorldName = () => {
    const trimmedName = worldName.trim();
    
    if (!trimmedName) {
      setError(strings.newGame?.errorEmpty || 'World name cannot be empty');
      return false;
    }

    return true;
  };

  /**
   * Handle form submission
   * Validates input, calls game bridge to start new game, and requests pointer lock
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    // Validate world name
    if (!validateWorldName()) {
      return;
    }

    const trimmedName = worldName.trim();

    // Call game bridge to start new game
    if (window.gameBridge && window.gameBridge.startNewGame) {
      window.gameBridge.startNewGame(trimmedName);
      
      // Request pointer lock to start the game
      if (window.gameBridge.requestPointerLock) {
        window.gameBridge.requestPointerLock();
      }
    } else {
      console.error('Game bridge not initialized');
      setError('Game system not ready. Please refresh the page.');
    }
  };

  return (
    <MenuLayout
      title={strings.newGame?.title || 'Create New World'}
      onBack={handleBack}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          maxWidth: '500px',
          margin: '0 auto',
        }}
      >
        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{
              border: '2px solid #000',
              borderRadius: 0,
              boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.5)',
              backgroundColor: 'rgba(211, 47, 47, 0.2)',
              color: '#FFFFFF',
              '& .MuiAlert-icon': {
                color: '#FF6B6B',
              },
            }}
          >
            {error}
          </Alert>
        )}

        {/* World Name Input */}
        <TextField
          label={strings.newGame?.worldName || 'World Name'}
          placeholder={strings.newGame?.worldNamePlaceholder || 'Enter world name...'}
          value={worldName}
          onChange={handleWorldNameChange}
          autoFocus
          fullWidth
          error={!!error}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(40, 40, 40, 0.8)',
              border: '2px solid #000',
              borderRadius: 0,
              '& fieldset': {
                border: 'none',
              },
              '&:hover': {
                backgroundColor: 'rgba(50, 50, 50, 0.8)',
              },
              '&.Mui-focused': {
                backgroundColor: 'rgba(60, 60, 60, 0.8)',
              },
              '&.Mui-error': {
                boxShadow: '0 0 0 2px #FF6B6B',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#CCCCCC',
              '&.Mui-focused': {
                color: '#CCCCCC',
              },
              '&.Mui-error': {
                color: '#FF6B6B',
              },
            },
            '& .MuiOutlinedInput-input': {
              color: '#FFFFFF',
              padding: '16px',
            },
          }}
        />

        {/* Create World Button */}
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          sx={{
            marginTop: 2,
            padding: '16px',
            fontSize: '1.2rem',
            backgroundColor: '#7CBD3B',
            color: '#FFFFFF',
            border: '2px solid #000',
            borderRadius: 0,
            boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.5)',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#8FD84F',
              boxShadow: '5px 5px 0 rgba(0, 0, 0, 0.6)',
              transform: 'translate(-1px, -1px)',
            },
            '&:active': {
              boxShadow: '2px 2px 0 rgba(0, 0, 0, 0.4)',
              transform: 'translate(2px, 2px)',
            },
          }}
        >
          {strings.newGame?.create || 'Create World'}
        </Button>
      </Box>
    </MenuLayout>
  );
});

NewGame.displayName = 'NewGame';

export default NewGame;
