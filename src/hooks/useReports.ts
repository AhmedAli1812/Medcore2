import { useEffect, useState } from 'react';
import { useApi } from './useApi';
import { useAuth } from '../context/AuthContext';

export interface ReportItem {
  id: string;
  title: string;
  createdAt: string;
  ownerId?: string;
  [key: string]: any;
}

export function useReports() {
  const { get } = useApi();
  const { isAdmin } = useAuth();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Admins get full access — request the server's "all" scope.
        // Non-admins request a scoped list (e.g. own/clinic-specific)
        const params = isAdmin() ? { scope: 'all' } : { scope: 'mine' };
        const data = await get<ReportItem[]>('/reports', params);
        if (!mounted) return;
        setReports(data ?? []);
      } catch (err) {
        if (!mounted) return;
        setError(err as Error);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [get, isAdmin]);

  return { reports, loading, error, reload: () => void get<ReportItem[]>('/reports', isAdmin() ? { scope: 'all' } : { scope: 'mine' }).then(r => setReports(r)).catch(() => {}) };
}