import React, { memo } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

/**
 * MenuLayout Component
 * 
 * Shared layout wrapper for all menu screens providing:
 * - Semi-transparent background overlay
 * - Centered content container with title bar
 * - Optional back button
 * - Minecraft-styled borders and shadows
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Screen content to render
 * @param {string} props.title - Screen title displayed in title bar
 * @param {Function} [props.onBack] - Optional callback for back button click
 */
const MenuLayout = memo(({ children, title, onBack }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 1000,
      }}
    >
      <Box
        sx={{
          width: '90%',
          maxWidth: '600px',
          maxHeight: '80vh',
          backgroundColor: 'rgba(60, 60, 60, 0.95)',
          border: '3px solid #000',
          boxShadow: '8px 8px 0 rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Title Bar */}
        <Box
          sx={{
            backgroundColor: 'rgba(40, 40, 40, 0.95)',
            borderBottom: '3px solid #000',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Back Button (if onBack provided) */}
          {onBack && (
            <IconButton
              onClick={onBack}
              sx={{
                position: 'absolute',
                left: '24px',
                color: '#FFFFFF',
                padding: '8px',
                border: '2px solid #000',
                borderRadius: 0,
                backgroundColor: '#8B8B8B',
                boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.5)',
                '&:hover': {
                  backgroundColor: '#A0A0A0',
                  boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.6)',
                  transform: 'translate(-1px, -1px)',
                },
                '&:active': {
                  boxShadow: '1px 1px 0 rgba(0, 0, 0, 0.4)',
                  transform: 'translate(2px, 2px)',
                },
              }}
              aria-label="Back"
            >
              <ArrowBackIcon />
            </IconButton>
          )}

          {/* Title */}
          <Typography
            variant="h3"
            component="h1"
            sx={{
              textAlign: 'center',
              color: '#FFFFFF',
              textShadow: '3px 3px 0 rgba(0, 0, 0, 0.8)',
              letterSpacing: '0.05em',
              position: 'relative',
              top: '4px',
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Content Container */}
        <Box
          sx={{
            flex: 1,
            padding: '32px 24px',
            overflowY: 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': {
              width: '12px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(40, 40, 40, 0.5)',
              border: '1px solid #000',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#8B8B8B',
              border: '2px solid #000',
              '&:hover': {
                backgroundColor: '#A0A0A0',
              },
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
});

MenuLayout.displayName = 'MenuLayout';

export default MenuLayout;
