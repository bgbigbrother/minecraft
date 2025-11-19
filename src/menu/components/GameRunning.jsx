import { memo } from 'react';
import { Box, Button } from '@mui/material';
import MenuLayout from './MenuLayout.jsx';
import { useLocalization } from '../hooks/useLocalization.js';

/**
 * GameRunning Component
 * 
 * Provides a form for creating a new game world with a custom name.
 * Validates input, calls game bridge to start new game, and requests pointer lock.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
const GameRunning = memo(() => {
  const { strings } = useLocalization();


  /**
   * Handle form submission
   * Validates input and creates new game
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    // const gameStartEvent = new CustomEvent('game:menu:start:new', {
    //   detail: {
    //     worldName: trimmedName
    //   },
    //   bubbles: true,
    //   cancelable: true
    // });
    
    // document.dispatchEvent(gameStartEvent);
    
  };

  return (
    <MenuLayout
      title={strings.gameRunning?.title || 'Game Menu'}
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
