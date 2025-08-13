import { useState, useEffect } from 'react';
import apiClient from '../services/apiWithRetry';

export const useBackendReady = () => {
  const [backendReady, setBackendReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        await apiClient.get('/health');
        setBackendReady(true);
      } catch (error) {
        console.log('Backend not ready, will retry...');
        // Don't set error here, let individual components handle it
      } finally {
        setLoading(false);
      }
    };

    checkBackendHealth();
  }, []);

  return { backendReady, loading };
};
