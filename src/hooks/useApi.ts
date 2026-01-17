import { useState, useCallback } from 'react';
import api from '../services/api';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const request = useCallback(async <T,>(fn: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback(<T,>(url: string, params?: any) => {
    return request(() => api.get<T>(url, { params }).then(r => r.data));
  }, [request]);

  const post = useCallback(<T,>(url: string, data?: any) => {
    return request(() => api.post<T>(url, data).then(r => r.data));
  }, [request]);

  const put = useCallback(<T,>(url: string, data?: any) => {
    return request(() => api.put<T>(url, data).then(r => r.data));
  }, [request]);

  const del = useCallback(<T,>(url: string) => {
    return request(() => api.delete<T>(url).then(r => r.data));
  }, [request]);

  return { loading, error, get, post, put, del };
}