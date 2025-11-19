import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Stack } from '@mui/material';
import MenuLayout from './MenuLayout';
import { useLocalization } from '../hooks/useLocalization';

/**
 * MainMenu Component
 * 
 * Landing screen with primary navigation buttons.
 * Provides access to:
 * - New Game creation
 * - Load saved games
 * - Controls documentation
 * - Options/settings
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */
const MainMenu = memo(() => {
  const navigate = useNavigate();
  const { strings, loading } = useLocalization();

  // Don't render until strings are loaded
  if (loading) {
    return null;
  }

  const handleNewGame = () => {
    navigate('/new');
  };

  const handleLoadGame = () => {
    navigate('/load');
  };

  const handleControls = () => {
    navigate('/controls');
  };

  const handleOptions = () => {
    navigate('/options');
  };

  return (
    <MenuLayout title={strings.menu?.title || 'MINECRAFT.JS'}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100%',
        }}
      >
        <Stack spacing={3} sx={{ width: '100%', maxWidth: '400px' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleNewGame}
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
            {strings.menu?.newGame || 'New Game'}
          </Button>

          <Button
            variant="contained"
            size="large"
            onClick={handleLoadGame}
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
            {strings.menu?.loadGame || 'Load Game'}
          </Button>

          <Button
            variant="contained"
            size="large"
            onClick={handleControls}
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
            {strings.menu?.controls || 'Controls'}
          </Button>

          <Button
            variant="contained"
            size="large"
            onClick={handleOptions}
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
            {strings.menu?.options || 'Options'}
          </Button>
        </Stack>
      </Box>
    </MenuLayout>
  );
});

MainMenu.displayName = 'MainMenu';

export default MainMenu;
