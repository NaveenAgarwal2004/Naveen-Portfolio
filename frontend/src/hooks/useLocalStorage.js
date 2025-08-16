import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// hooks/useApi.js
import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const useApi = (apiFunction, options = {}) => {
  const {
    immediate = true,
    cacheKey = null,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    dependencies = [],
    onSuccess = null,
    onError = null,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // Cache management
  const [cachedData, setCachedData] = useLocalStorage(
    cacheKey ? `api_cache_${cacheKey}` : null,
    null
  );
  const [cacheTimestamp, setCacheTimestamp] = useLocalStorage(
    cacheKey ? `api_cache_timestamp_${cacheKey}` : null,
    null
  );

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      // Check cache first
      if (cacheKey && cachedData && cacheTimestamp) {
        const now = new Date().getTime();
        const cacheAge = now - cacheTimestamp;
        
        if (cacheAge < cacheTime) {
          setData(cachedData);
          setLoading(false);
          return cachedData;
        }
      }

      const result = await apiFunction(...args);
      const responseData = result?.data?.data || result?.data || result;
      
      setData(responseData);
      setLastFetch(new Date().getTime());
      
      // Cache the result
      if (cacheKey) {
        setCachedData(responseData);
        setCacheTimestamp(new Date().getTime());
      }
      
      if (onSuccess) {
        onSuccess(responseData);
      }
      
      return responseData;
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'An error occurred';
      setError(errorMessage);
      
      // Try to use cached data as fallback
      if (cacheKey && cachedData) {
        setData(cachedData);
        console.warn('Using cached data due to API error:', errorMessage);
      }
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, cacheKey, cachedData, cacheTimestamp, cacheTime, onSuccess, onError, setCachedData, setCacheTimestamp]);

  const refresh = useCallback(() => {
    // Clear cache and refetch
    if (cacheKey) {
      setCachedData(null);
      setCacheTimestamp(null);
    }
    return execute();
  }, [execute, cacheKey, setCachedData, setCacheTimestamp]);

  const clearCache = useCallback(() => {
    if (cacheKey) {
      setCachedData(null);
      setCacheTimestamp(null);
    }
  }, [cacheKey, setCachedData, setCacheTimestamp]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    execute,
    refresh,
    clearCache,
    lastFetch,
    isStale: lastFetch && (new Date().getTime() - lastFetch > cacheTime),
  };
};
