import { useState, useEffect } from 'react';

// Cache for loaded localization files
const localizationCache = new Map();

/**
 * Custom hook for loading and accessing localized strings
 * @param {string} locale - The locale to load (default: 'en')
 * @returns {Object} - Object containing strings, loading state, and error
 */
export function useLocalization(locale = 'en') {
  const [strings, setStrings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLocalization = async () => {
      try {
        // Check cache first
        if (localizationCache.has(locale)) {
          setStrings(localizationCache.get(locale));
          setLoading(false);
          return;
        }

        // Load the JSON file dynamically
        const response = await fetch(`/src/locales/${locale}.json`);
        
        if (!response.ok) {
          throw new Error(`Failed to load localization file for locale: ${locale}`);
        }

        const data = await response.json();
        
        // Cache the loaded strings
        localizationCache.set(locale, data);
        
        setStrings(data);
        setError(null);
      } catch (err) {
        console.error('Error loading localization:', err);
        setError(err);
        
        // Fallback to empty object to prevent crashes
        setStrings({});
      } finally {
        setLoading(false);
      }
    };

    loadLocalization();
  }, [locale]);

  /**
   * Get a nested string value with fallback
   * @param {string} key - Dot-notation key (e.g., 'menu.title')
   * @param {string} fallback - Fallback value if key not found
   * @returns {string} - The localized string or fallback
   */
  const getString = (key, fallback = key) => {
    if (!strings) return fallback;

    const keys = key.split('.');
    let value = strings;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback;
      }
    }

    return typeof value === 'string' ? value : fallback;
  };

  return {
    strings: strings || {},
    loading,
    error,
    getString
  };
}
