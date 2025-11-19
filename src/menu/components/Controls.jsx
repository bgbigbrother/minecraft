import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import MenuLayout from './MenuLayout';
import { useLocalization } from '../hooks/useLocalization';

/**
 * Controls Component
 * 
 * Displays game controls documentation organized by category:
 * - Movement (WASD, Shift, Space)
 * - Camera (Mouse, R to reset)
 * - Interaction (Left/Right click, number keys)
 * - System (F1 save, F2 load, U toggle UI, F10 debug)
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
const Controls = memo(() => {
  const navigate = useNavigate();
  const { strings } = useLocalization();

  const handleBack = () => {
    navigate('/');
  };

  // Control categories to display
  const categories = [
    {
      key: 'movement',
      title: strings.controls?.movement?.title || 'Movement',
      controls: [
        strings.controls?.movement?.forward,
        strings.controls?.movement?.backward,
        strings.controls?.movement?.left,
        strings.controls?.movement?.right,
        strings.controls?.movement?.sprint,
        strings.controls?.movement?.jump,
      ].filter(Boolean),
    },
    {
      key: 'camera',
      title: strings.controls?.camera?.title || 'Camera',
      controls: [
        strings.controls?.camera?.look,
        strings.controls?.camera?.reset,
      ].filter(Boolean),
    },
    {
      key: 'interaction',
      title: strings.controls?.interaction?.title || 'Interaction',
      controls: [
        strings.controls?.interaction?.break,
        strings.controls?.interaction?.place,
        strings.controls?.interaction?.pickaxe,
        strings.controls?.interaction?.blocks,
      ].filter(Boolean),
    },
    {
      key: 'system',
      title: strings.controls?.system?.title || 'System',
      controls: [
        strings.controls?.system?.save,
        strings.controls?.system?.load,
        strings.controls?.system?.toggleUI,
        strings.controls?.system?.debugCamera,
      ].filter(Boolean),
    },
  ];

  return (
    <MenuLayout
      title={strings.controls?.title || 'Controls'}
      onBack={handleBack}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {categories.map((category) => (
          <Box key={category.key}>
            {/* Category Title */}
            <Typography
              variant="h5"
              component="h2"
              sx={{
                color: '#7CBD3B',
                marginBottom: 2,
                textShadow: '2px 2px 0 rgba(0, 0, 0, 0.8)',
                letterSpacing: '0.05em',
                fontWeight: 'bold',
              }}
            >
              {category.title}
            </Typography>

            {/* Controls List */}
            <List
              sx={{
                padding: 0,
                backgroundColor: 'rgba(40, 40, 40, 0.6)',
                border: '2px solid #000',
                boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.5)',
              }}
            >
              {category.controls.map((control, index) => (
                <ListItem
                  key={index}
                  sx={{
                    borderBottom:
                      index < category.controls.length - 1
                        ? '1px solid rgba(0, 0, 0, 0.3)'
                        : 'none',
                    padding: '12px 16px',
                    '&:hover': {
                      backgroundColor: 'rgba(139, 139, 139, 0.2)',
                    },
                  }}
                >
                  <ListItemText
                    primary={control}
                    primaryTypographyProps={{
                      sx: {
                        color: '#FFFFFF',
                        fontSize: '1.1rem',
                        fontFamily: '"Minecraft", monospace',
                        textShadow: '1px 1px 0 rgba(0, 0, 0, 0.8)',
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Box>
    </MenuLayout>
  );
});

Controls.displayName = 'Controls';

export default Controls;
