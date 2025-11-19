/**
 * Storage utility module for managing game data in localStorage
 * Provides wrapper functions with validation and error handling
 */

const STORAGE_KEYS = {
  WORLDS: 'minecraft_worlds',
  SETTINGS: 'minecraft_settings',
  // Legacy keys for backward compatibility
  LEGACY_PARAMS: 'minecraft_params',
  LEGACY_DATA: 'minecraft_data'
};

/**
 * Validates world data structure
 * @param {Object} worldData - World data to validate
 * @returns {boolean} True if valid
 */
function validateWorldData(worldData) {
  if (!worldData || typeof worldData !== 'object') {
    return false;
  }
  
  // Required fields
  if (!worldData.name || typeof worldData.name !== 'string') {
    return false;
  }
  
  if (!worldData.timestamp || typeof worldData.timestamp !== 'number') {
    return false;
  }
  
  // Params should be an object
  if (worldData.params && typeof worldData.params !== 'object') {
    return false;
  }
  
  // Data should be an object
  if (worldData.data && typeof worldData.data !== 'object') {
    return false;
  }
  
  return true;
}

/**
 * Validates settings data structure
 * @param {Object} settings - Settings to validate
 * @returns {boolean} True if valid
 */
function validateSettings(settings) {
  if (!settings || typeof settings !== 'object') {
    return false;
  }
  
  // Validate individual settings if present
  if (settings.musicVolume !== undefined) {
    if (typeof settings.musicVolume !== 'number' || 
        settings.musicVolume < 0 || 
        settings.musicVolume > 100) {
      return false;
    }
  }
  
  if (settings.showFPS !== undefined && typeof settings.showFPS !== 'boolean') {
    return false;
  }
  
  return true;
}

/**
 * Safely parse JSON with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed object or default value
 */
function safeJSONParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return defaultValue;
  }
}

/**
 * Safely stringify JSON with error handling
 * @param {*} data - Data to stringify
 * @returns {string|null} JSON string or null if failed
 */
function safeJSONStringify(data) {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error('Failed to stringify JSON:', error);
    return null;
  }
}

/**
 * Check if localStorage is available and has space
 * @returns {boolean} True if localStorage is available
 */
function isLocalStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    console.error('localStorage is not available:', error);
    return false;
  }
}

/**
 * Save world data to localStorage
 * @param {string} worldName - Name of the world
 * @param {Object} worldData - World data to save
 * @throws {Error} If save fails
 */
export function saveWorld(worldName, worldData) {
  if (!isLocalStorageAvailable()) {
    throw new Error('localStorage is not available');
  }
  
  // Ensure worldData has required fields
  const dataToSave = {
    name: worldName,
    timestamp: Date.now(),
    params: worldData.params || {},
    data: worldData.data || {},
    player: worldData.player || {}
  };
  
  // Validate data structure
  if (!validateWorldData(dataToSave)) {
    throw new Error('Invalid world data structure');
  }
  
  try {
    // Get existing worlds
    const worlds = getAllWorlds();
    
    // Find and update existing world or add new one
    const existingIndex = worlds.findIndex(w => w.name === worldName);
    if (existingIndex >= 0) {
      worlds[existingIndex] = dataToSave;
    } else {
      worlds.push(dataToSave);
    }
    
    // Save back to localStorage
    const jsonString = safeJSONStringify(worlds);
    if (!jsonString) {
      throw new Error('Failed to serialize world data');
    }
    
    localStorage.setItem(STORAGE_KEYS.WORLDS, jsonString);
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please delete some saved worlds.');
    }
    throw error;
  }
}

/**
 * Load world data from localStorage
 * @param {string} worldName - Name of the world to load
 * @returns {Object|null} World data or null if not found
 */
export function loadWorld(worldName) {
  if (!isLocalStorageAvailable()) {
    console.error('localStorage is not available');
    return null;
  }
  
  const worlds = getAllWorlds();
  const world = worlds.find(w => w.name === worldName);
  
  if (!world) {
    console.warn(`World "${worldName}" not found`);
    return null;
  }
  
  return world;
}

/**
 * Get all saved worlds from localStorage
 * @returns {Array<Object>} Array of world data objects
 */
export function getAllWorlds() {
  if (!isLocalStorageAvailable()) {
    return [];
  }
  
  const worldsJson = localStorage.getItem(STORAGE_KEYS.WORLDS);
  
  if (!worldsJson) {
    // Check for legacy save data
    const legacyParams = localStorage.getItem(STORAGE_KEYS.LEGACY_PARAMS);
    const legacyData = localStorage.getItem(STORAGE_KEYS.LEGACY_DATA);
    
    if (legacyParams && legacyData) {
      // Migrate legacy save to new format
      const legacyWorld = {
        name: 'Legacy World',
        timestamp: Date.now(),
        params: safeJSONParse(legacyParams, {}),
        data: safeJSONParse(legacyData, {}),
        player: {}
      };
      
      if (validateWorldData(legacyWorld)) {
        return [legacyWorld];
      }
    }
    
    return [];
  }
  
  const worlds = safeJSONParse(worldsJson, []);
  
  // Validate and filter out invalid worlds
  return worlds.filter(world => validateWorldData(world));
}

/**
 * Delete a world from localStorage
 * @param {string} worldName - Name of the world to delete
 * @returns {boolean} True if deleted successfully
 */
export function deleteWorld(worldName) {
  if (!isLocalStorageAvailable()) {
    return false;
  }
  
  try {
    const worlds = getAllWorlds();
    const filteredWorlds = worlds.filter(w => w.name !== worldName);
    
    if (worlds.length === filteredWorlds.length) {
      console.warn(`World "${worldName}" not found`);
      return false;
    }
    
    const jsonString = safeJSONStringify(filteredWorlds);
    if (!jsonString) {
      throw new Error('Failed to serialize worlds data');
    }
    
    localStorage.setItem(STORAGE_KEYS.WORLDS, jsonString);
    return true;
  } catch (error) {
    console.error('Failed to delete world:', error);
    return false;
  }
}

/**
 * Save settings to localStorage
 * @param {Object} settings - Settings object to save
 * @throws {Error} If save fails
 */
export function saveSettings(settings) {
  if (!isLocalStorageAvailable()) {
    throw new Error('localStorage is not available');
  }
  
  if (!validateSettings(settings)) {
    throw new Error('Invalid settings data');
  }
  
  try {
    const jsonString = safeJSONStringify(settings);
    if (!jsonString) {
      throw new Error('Failed to serialize settings');
    }
    
    localStorage.setItem(STORAGE_KEYS.SETTINGS, jsonString);
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded');
    }
    throw error;
  }
}

/**
 * Load settings from localStorage
 * @returns {Object} Settings object with defaults
 */
export function loadSettings() {
  const defaultSettings = {
    musicVolume: 50,
    showFPS: false,
    locale: 'en'
  };
  
  if (!isLocalStorageAvailable()) {
    return defaultSettings;
  }
  
  const settingsJson = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  
  if (!settingsJson) {
    return defaultSettings;
  }
  
  const settings = safeJSONParse(settingsJson, defaultSettings);
  
  // Validate and merge with defaults
  if (!validateSettings(settings)) {
    console.warn('Invalid settings found, using defaults');
    return defaultSettings;
  }
  
  return { ...defaultSettings, ...settings };
}

/**
 * Clear all game data from localStorage (for testing/debugging)
 * @param {boolean} includeSettings - Whether to also clear settings
 */
export function clearAllData(includeSettings = false) {
  if (!isLocalStorageAvailable()) {
    return;
  }
  
  localStorage.removeItem(STORAGE_KEYS.WORLDS);
  localStorage.removeItem(STORAGE_KEYS.LEGACY_PARAMS);
  localStorage.removeItem(STORAGE_KEYS.LEGACY_DATA);
  
  if (includeSettings) {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  }
}
