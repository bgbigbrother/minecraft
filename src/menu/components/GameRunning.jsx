import { memo, useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuLayout from './MenuLayout.jsx';
import { useLocalization } from '../hooks/useLocalization.js';
import { saveWorld } from '../utils/storage.js';

/**
 * GameRunning Component
 * 
 * Provides in-game menu with save functionality.
 * Listens for world data from game and saves to localStorage.
 * 
 * Requirements: 11.2, 11.3, 11.4
 */
const GameRunning = memo(() => {
  const { strings } = useLocalization();
  const navigate = useNavigate();

  // World state
  const [worldName, setWorldName] = useState('');
  const [worldData, setWorldData] = useState({
    timestamp: null,
    locked: null,
    params: {},
    data: {},
    player: {}
  });

  /**
   * Handle back button click - return to game
   */
  const handleBack = () => {
    const resumeEvent = new CustomEvent('game:menu:resume', {
      detail: { 
        timestamp: Date.now()
      },
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(resumeEvent);
    navigate('/game')
  };

  // Load world name and listen for world data
  useEffect(() => {
    const getWorldData = (event) => {
      // Extract world name from params if available
      const name = event.detail.params?.worldName || event.detail.name || 'Current World';
      
      setWorldName(name);
      setWorldData({
        timestamp: event.detail.timestamp || Date.now(),
        locked: event.detail.locked || false,
        params: event.detail.params || {},
        data: event.detail.data || {},
        player: event.detail.player || {}
      });
    };

    document.addEventListener("game:controls:unlock", getWorldData);
    
    return () => {
      document.removeEventListener("game:controls:unlock", getWorldData);
    };
  }, []);

  /**
   * Handle save button click
   * Saves world data to localStorage and dispatches save event
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    try {
      // Save world data to localStorage
      if (worldName) {
        saveWorld(worldName, {
          params: worldData.params,
          data: worldData.data,
          player: worldData.player
        });
      }

      // Dispatch save event to notify game
      const gameSaveEvent = new CustomEvent('game:menu:save', {
        detail: {
          worldName: worldName,
          timestamp: Date.now()
        },
        bubbles: true,
        cancelable: true
      });
      
      document.dispatchEvent(gameSaveEvent);
      
      // Navigate back to main menu
      navigate('/');
    } catch (error) {
      console.error('Failed to save world:', error);
      // Could add error state here to show user-friendly message
    }
  };

  return (
    <MenuLayout
      title={strings.gameRunning?.title || 'Game Menu'}
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
          {strings.gameRunning?.save || 'Save and Go to Menu'}
        </Button>
      </Box>
    </MenuLayout>
  );
});

GameRunning.displayName = 'GameRunning';

export default GameRunning;
