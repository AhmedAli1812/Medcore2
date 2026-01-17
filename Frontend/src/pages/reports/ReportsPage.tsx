import React from 'react';
import { useReports } from '../../hooks/useReports';
import { useAuth } from '../../context/AuthContext';

export const ReportsPage: React.FC = () => {
  const { reports, loading, error } = useReports();
  const { user, isAdmin } = useAuth();

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <div className="text-sm text-gray-600">
          {isAdmin() ? 'You are viewing all reports (Admin access).' : `Viewing reports for: ${user?.name ?? 'you'}`}
        </div>
      </div>

      {loading && <div>Loading reports…</div>}
      {error && <div className="text-red-600">Error loading reports: {error.message}</div>}

      {!loading && !error && (
        <div className="overflow-auto rounded border">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-left">Owner</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {reports.map(r => (
                <tr key={r.id}>
                  <td className="px-4 py-2">{r.title}</td>
                  <td className="px-4 py-2">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2">{r.ownerId ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {reports.length === 0 && <div className="p-4 text-gray-500">No reports found.</div>}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;