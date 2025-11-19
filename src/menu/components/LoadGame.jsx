import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemButton, ListItemText, Alert, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuLayout from './MenuLayout.jsx';
import { useLocalization } from '../hooks/useLocalization.js';
import useEventBus from '../hooks/useEventBus.js';
import usePointerLock from '../hooks/usePointerLock.js';
import { getAllWorlds, deleteWorld } from '../utils/storage.js';

/**
 * LoadGame Component
 * 
 * Displays a list of saved game worlds and allows the user to select one to load.
 * Retrieves saved games from localStorage, emits load event, and requests pointer lock.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
const LoadGame = memo(() => {
  const navigate = useNavigate();
  const { strings } = useLocalization();
  const { emit } = useEventBus();
  const { requestLock } = usePointerLock();

  // State for saved games
  const [savedGames, setSavedGames] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Load saved games from localStorage on component mount
   */
  useEffect(() => {
    try {
      const worlds = getAllWorlds();
      
      // Sort by timestamp (most recent first)
      const sortedWorlds = worlds.sort((a, b) => b.timestamp - a.timestamp);
      
      setSavedGames(sortedWorlds);
    } catch (error) {
      console.error('Failed to load saved games:', error);
      setSavedGames([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handle back button click - return to main menu
   */
  const handleBack = () => {
    navigate('/');
  };

  /**
   * Format timestamp to readable date string
   * @param {number} timestamp - Unix timestamp
   * @returns {string} Formatted date string
   */
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Handle world selection
   * Emits load event with world data and requests pointer lock
   * @param {Object} worldData - The selected world data
   */
  const handleWorldSelect = (worldData) => {
    // Emit event to load the selected world
    emit('menu:game:load:world', { worldData });

    // Request pointer lock to start the game
    requestLock();
  };

  /**
   * Handle world deletion
   * Deletes the selected world from localStorage and updates the list
   * @param {Event} event - Click event
   * @param {string} worldName - Name of the world to delete
   */
  const handleDeleteWorld = (event, worldName) => {
    // Prevent the click from triggering the world selection
    event.stopPropagation();

    // Confirm deletion
    if (window.confirm(`Are you sure you want to delete "${worldName}"? This action cannot be undone.`)) {
      const success = deleteWorld(worldName);
      
      if (success) {
        // Update the saved games list
        setSavedGames(prevGames => prevGames.filter(world => world.name !== worldName));
      } else {
        alert('Failed to delete world. Please try again.');
      }
    }
  };

  return (
    <MenuLayout
      title={strings.loadGame?.title || 'Load Game'}
      onBack={handleBack}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        {/* Loading State */}
        {loading && (
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: '#CCCCCC',
              padding: '32px',
            }}
          >
            Loading saved games...
          </Typography>
        )}

        {/* No Saved Games Message */}
        {!loading && savedGames.length === 0 && (
          <Alert
            severity="info"
            sx={{
              border: '2px solid #000',
              borderRadius: 0,
              boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.5)',
              backgroundColor: 'rgba(33, 150, 243, 0.2)',
              color: '#FFFFFF',
              '& .MuiAlert-icon': {
                color: '#64B5F6',
              },
            }}
          >
            {strings.loadGame?.noSaves || 'No saved games found'}
          </Alert>
        )}

        {/* Saved Games List */}
        {!loading && savedGames.length > 0 && (
          <>
            <Typography
              variant="body2"
              sx={{
                color: '#CCCCCC',
                marginBottom: 1,
                textAlign: 'center',
              }}
            >
              {strings.loadGame?.selectWorld || 'Select a world to load'}
            </Typography>

            <List
              sx={{
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {savedGames.map((world, index) => (
                <ListItem
                  key={`${world.name}-${world.timestamp}`}
                  disablePadding
                  sx={{
                    border: '2px solid #000',
                    borderRadius: 0,
                    boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.5)',
                    backgroundColor: 'rgba(40, 40, 40, 0.8)',
                    transition: 'all 0.1s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(50, 50, 50, 0.9)',
                      boxShadow: '5px 5px 0 rgba(0, 0, 0, 0.6)',
                      transform: 'translate(-1px, -1px)',
                    },
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={(e) => handleDeleteWorld(e, world.name)}
                      sx={{
                        color: '#FF5555',
                        border: '2px solid #000',
                        borderRadius: 0,
                        backgroundColor: 'rgba(60, 20, 20, 0.8)',
                        padding: '8px',
                        marginRight: '8px',
                        transition: 'all 0.1s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(80, 20, 20, 0.9)',
                          color: '#FF7777',
                          transform: 'scale(1.05)',
                        },
                        '&:active': {
                          transform: 'scale(0.95)',
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemButton
                    onClick={() => handleWorldSelect(world)}
                    sx={{
                      padding: '16px 20px',
                      paddingRight: '60px',
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                      '&:active': {
                        transform: 'translate(2px, 2px)',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography
                          variant="h5"
                          sx={{
                            color: '#FFFFFF',
                            fontWeight: 'bold',
                            textShadow: '2px 2px 0 rgba(0, 0, 0, 0.8)',
                            marginBottom: '4px',
                          }}
                        >
                          {world.name}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#AAAAAA',
                            fontSize: '0.9rem',
                          }}
                        >
                          {formatTimestamp(world.timestamp)}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Box>
    </MenuLayout>
  );
});

LoadGame.displayName = 'LoadGame';

export default LoadGame;
