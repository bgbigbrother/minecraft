import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Fade } from '@mui/material';
import theme from './styles/theme.js';
import usePointerLock from './hooks/usePointerLock.js';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import MainMenu from './components/MainMenu.jsx';
import NewGame from './components/NewGame.jsx';
import GameRunning from './components/GameRunning.jsx';
import LoadGame from './components/LoadGame.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import Controls from './components/Controls.jsx';
import Options from './components/Options.jsx';

/**
 * AnimatedRoutes Component
 * Wraps routes with fade transitions for smooth navigation
 */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Fade in={true} timeout={300} key={location.pathname}>
      <div>
        <Routes location={location}>
          <Route path="/" element={<ErrorBoundary><MainMenu /></ErrorBoundary>} />
          <Route path="/new" element={<ErrorBoundary><NewGame /></ErrorBoundary>} />
          <Route path="/load" element={<ErrorBoundary><LoadGame /></ErrorBoundary>} />
          <Route path="/loading" element={<ErrorBoundary><LoadingScreen /></ErrorBoundary>} />
          <Route path="/controls" element={<ErrorBoundary><Controls /></ErrorBoundary>} />
          <Route path="/options" element={<ErrorBoundary><Options /></ErrorBoundary>} />
          <Route path="/game" element={<ErrorBoundary><GameRunning /></ErrorBoundary>} />
        </Routes>
      </div>
    </Fade>
  );
}

/**
 * App Component
 * 
 * Root React component for the game menu overlay system.
 * Provides routing between menu screens and manages overlay visibility
 * based on pointer lock state.
 * 
 * Features:
 * - React Router for navigation between menu screens
 * - MUI ThemeProvider with Minecraft-inspired styling
 * - Automatic overlay visibility management via pointer lock
 * - Smooth transitions between screens
 * - CSS class toggling for pointer-events control
 * 
 * Requirements: 1.1, 7.1, 7.2, 7.5, 9.5, 10.1
 */
function App() {
  // Track pointer lock state to control overlay visibility
  const { isLocked } = usePointerLock();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Fade in={!isLocked} timeout={200}>
        <div
          id="menu-overlay"
          className={isLocked ? 'hidden' : 'visible'}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: isLocked ? 'none' : 'auto',
            zIndex: 1000,
            display: isLocked ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </div>
      </Fade>
    </ThemeProvider>
  );
}

export default App;
