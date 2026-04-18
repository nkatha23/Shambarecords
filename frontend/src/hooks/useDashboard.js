import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export function useDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/dashboard');
      setData(res);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
