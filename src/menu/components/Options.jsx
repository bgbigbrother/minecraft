import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Slider, Switch, FormControlLabel } from '@mui/material';
import MenuLayout from './MenuLayout';
import { useLocalization } from '../hooks/useLocalization';
import { loadSettings, saveSettings } from '../utils/storage';

/**
 * Options Component
 * 
 * Provides UI for configuring game settings:
 * - Music volume (0-100)
 * - Show FPS toggle
 * 
 * Settings are persisted to localStorage and applied via game bridge
 * for game systems to consume.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
const Options = memo(() => {
  const navigate = useNavigate();
  const { strings } = useLocalization();

  // Settings state
  const [settings, setSettings] = useState({
    musicVolume: 50,
    showFPS: false,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadedSettings = loadSettings();
    setSettings({
      musicVolume: loadedSettings.musicVolume,
      showFPS: loadedSettings.showFPS,
    });
  }, []);

  const handleBack = () => {
    navigate('/');
  };

  /**
   * Handle setting change
   * Updates local state, calls game bridge, and persists to localStorage
   */
  const handleSettingChange = (key, value) => {
    // Update local state
    const newSettings = {
      ...settings,
      [key]: value,
    };
    setSettings(newSettings);

    // Call game bridge to update setting
    if (window.gameBridge && window.gameBridge.updateSetting) {
      window.gameBridge.updateSetting(key, value);
    } else {
      console.warn('Game bridge not initialized, setting will be applied on next game start');
    }

    // Persist to localStorage
    try {
      saveSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return (
    <MenuLayout
      title={strings.options?.title || 'Options'}
      onBack={handleBack}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {/* Music Volume Setting */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              color: '#FFFFFF',
              marginBottom: 2,
              textShadow: '2px 2px 0 rgba(0, 0, 0, 0.8)',
              fontWeight: 'bold',
            }}
          >
            {strings.options?.musicVolume || 'Music Volume'}
          </Typography>
          <Box
            sx={{
              backgroundColor: 'rgba(40, 40, 40, 0.6)',
              border: '2px solid #000',
              boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.5)',
              padding: '20px',
            }}
          >
            <Slider
              value={settings.musicVolume}
              onChange={(e, value) => handleSettingChange('musicVolume', value)}
              min={0}
              max={100}
              step={1}
              valueLabelDisplay="on"
              sx={{
                color: '#7CBD3B',
                '& .MuiSlider-thumb': {
                  width: 20,
                  height: 20,
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #000',
                  boxShadow: '2px 2px 0 rgba(0, 0, 0, 0.5)',
                  '&:hover': {
                    boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.6)',
                  },
                },
                '& .MuiSlider-track': {
                  height: 8,
                  border: '2px solid #000',
                },
                '& .MuiSlider-rail': {
                  height: 8,
                  backgroundColor: '#8B8B8B',
                  border: '2px solid #000',
                },
                '& .MuiSlider-valueLabel': {
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '2px solid #000',
                  fontFamily: '"Minecraft", monospace',
                },
              }}
            />
          </Box>
        </Box>

        {/* Show FPS Setting */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              color: '#FFFFFF',
              marginBottom: 2,
              textShadow: '2px 2px 0 rgba(0, 0, 0, 0.8)',
              fontWeight: 'bold',
            }}
          >
            {strings.options?.showFPS || 'Show FPS Counter'}
          </Typography>
          <Box
            sx={{
              backgroundColor: 'rgba(40, 40, 40, 0.6)',
              border: '2px solid #000',
              boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.5)',
              padding: '20px',
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showFPS}
                  onChange={(e) => handleSettingChange('showFPS', e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase': {
                      color: '#8B8B8B',
                      '&.Mui-checked': {
                        color: '#7CBD3B',
                      },
                      '&.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#7CBD3B',
                      },
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: '#8B8B8B',
                      border: '2px solid #000',
                    },
                  }}
                />
              }
              label={settings.showFPS ? 'Enabled' : 'Disabled'}
              sx={{
                color: '#FFFFFF',
                fontFamily: '"Minecraft", monospace',
                fontSize: '1.1rem',
                textShadow: '1px 1px 0 rgba(0, 0, 0, 0.8)',
                '& .MuiFormControlLabel-label': {
                  fontFamily: '"Minecraft", monospace',
                  fontSize: '1.1rem',
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    </MenuLayout>
  );
});

Options.displayName = 'Options';

export default Options;
