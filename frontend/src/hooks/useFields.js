import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export function useFields() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/fields');
      setFields(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load fields');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const createField = useCallback(async (payload) => {
    const { data } = await api.post('/fields', payload);
    setFields((prev) => [data, ...prev]);
    return data;
  }, []);

  const updateField = useCallback(async (id, payload) => {
    const { data } = await api.put(`/fields/${id}`, payload);
    setFields((prev) => prev.map((f) => (f.id === id ? data : f)));
    return data;
  }, []);

  const deleteField = useCallback(async (id) => {
    await api.delete(`/fields/${id}`);
    setFields((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return { fields, loading, error, refetch: fetch, createField, updateField, deleteField };
}
