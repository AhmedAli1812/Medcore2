import React, { useMemo, useState } from 'react';
import { Doctor, Visit, InsuranceCompany } from '../types';
import { fetchDoctorReports, fetchSpecialtyReports, fetchCompanyReports, Period, DoctorReport, SpecialtyReport, CompanyReport } from '../src/services/reports';
import { Activity, RefreshCw } from 'lucide-react';

/**
 * ReportsView: Accepts client-side data so admin can view reports even when backend is not available.
 * Also supports fetching server-generated reports using the reports service.
 */

type Scope = 'doctors' | 'specialties' | 'companies';

interface ReportsViewProps {
  doctors: Doctor[];
  visits: Visit[];
  companies: InsuranceCompany[];
}

const getDateKey = (d: string) => d.split('T')[0] || d;

const filterByPeriod = (visits: Visit[], period: Period) => {
  const now = new Date();
  return visits.filter(v => {
    const visitDate = new Date(v.date);
    if (Number.isNaN(visitDate.getTime())) return false;
    if (period === 'daily') {
      return getDateKey(v.date) === now.toISOString().split('T')[0];
    }
    if (period === 'weekly') {
      const diff = (now.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff < 7;
    }
    // monthly
    return visitDate.getFullYear() === now.getFullYear() && visitDate.getMonth() === now.getMonth();
  });
};

const ReportsView: React.FC<ReportsViewProps> = ({ doctors, visits, companies }) => {
  const [scope, setScope] = useState<Scope>('doctors');
  const [period, setPeriod] = useState<Period>('daily');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverData, setServerData] = useState<DoctorReport[] | SpecialtyReport[] | CompanyReport[] | null>(null);

  const localFiltered = useMemo(() => filterByPeriod(visits, period), [visits, period]);

  const localDoctorAggregates = useMemo(() => {
    const map = new Map<string, { doctorName: string; visits: number; revenue: number }>();
    localFiltered.forEach(v => {
      const doc = doctors.find(d => d.id === v.doctorId);
      const name = doc?.name ?? v.doctorId;
      const cur = map.get(v.doctorId) ?? { doctorName: name, visits: 0, revenue: 0 };
      cur.visits += 1;
      cur.revenue += Number(v.totalAmount || 0);
      map.set(v.doctorId, cur);
    });
    return Array.from(map.entries()).map(([doctorId, d]) => ({
      doctorId,
      doctorName: d.doctorName,
      visits: d.visits,
      revenue: d.revenue,
      avgPerVisit: d.visits > 0 ? d.revenue / d.visits : 0
    })) as DoctorReport[];
  }, [localFiltered, doctors]);

  const localSpecialtyAggregates = useMemo(() => {
    const map = new Map<string, { visits: number; revenue: number }>();
    localFiltered.forEach(v => {
      const doc = doctors.find(d => d.id === v.doctorId);
      const specialty = doc?.specialty ?? 'Unknown';
      const cur = map.get(specialty) ?? { visits: 0, revenue: 0 };
      cur.visits += 1;
      cur.revenue += Number(v.totalAmount || 0);
      map.set(specialty, cur);
    });
    return Array.from(map.entries()).map(([specialty, d]) => ({
      specialty,
      visits: d.visits,
      revenue: d.revenue
    })) as SpecialtyReport[];
  }, [localFiltered, doctors]);

  const localCompanyAggregates = useMemo(() => {
    const map = new Map<string, { companyName: string; visits: number; totalPaid: number; totalDue: number }>();
    localFiltered.forEach(v => {
      const cid = v.insuranceCompanyId || 'direct';
      const comp = companies.find(c => c.id === cid);
      const name = comp?.name ?? (cid === 'direct' ? 'Cash / Direct' : cid);
      const cur = map.get(cid) ?? { companyName: name, visits: 0, totalPaid: 0, totalDue: 0 };
      cur.visits += 1;
      cur.totalPaid += Number(v.insurancePay || 0);
      cur.totalDue += Number(v.totalAmount || 0) - Number(v.insurancePay || 0);
      map.set(cid, cur);
    });
    return Array.from(map.entries()).map(([companyId, d]) => ({
      companyId,
      companyName: d.companyName,
      visits: d.visits,
      totalPaid: d.totalPaid,
      totalDue: d.totalDue
    })) as CompanyReport[];
  }, [localFiltered, companies]);

  const handleFetchServer = async () => {
    setLoading(true);
    setServerError(null);
    try {
      if (scope === 'doctors') {
        const res = await fetchDoctorReports(period);
        setServerData(res);
      } else if (scope === 'specialties') {
        const res = await fetchSpecialtyReports(period);
        setServerData(res);
      } else {
        const res = await fetchCompanyReports(period);
        setServerData(res);
      }
    } catch (e: any) {
      setServerError(e?.message ?? 'Server error');
      setServerData(null);
    } finally {
      setLoading(false);
    }
  };

  const renderTable = () => {
    if (serverData) {
      // Render server data if available
      if (scope === 'doctors') {
        const rows = serverData as DoctorReport[];
        return (
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-slate-400 uppercase">
                <th>Doctor</th><th>Visits</th><th>Revenue</th><th>Avg/Visit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.doctorId} className="border-t">
                  <td className="py-3">{r.doctorName}</td>
                  <td>{r.visits}</td>
                  <td>{r.revenue.toLocaleString()}</td>
                  <td>{r.avgPerVisit.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
      if (scope === 'specialties') {
        const rows = serverData as SpecialtyReport[];
        return (
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-slate-400 uppercase">
                <th>Specialty</th><th>Visits</th><th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.specialty} className="border-t">
                  <td className="py-3">{r.specialty}</td>
                  <td>{r.visits}</td>
                  <td>{r.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
      const rows = serverData as CompanyReport[];
      return (
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-slate-400 uppercase">
              <th>Company</th><th>Visits</th><th>Total Paid</th><th>Total Due</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.companyId} className="border-t">
                <td className="py-3">{r.companyName}</td>
                <td>{r.visits}</td>
                <td>{r.totalPaid.toLocaleString()}</td>
                <td>{r.totalDue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    // Fallback to local aggregates
    if (scope === 'doctors') {
      const rows = localDoctorAggregates;
      return (
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-slate-400 uppercase">
              <th>Doctor</th><th>Visits</th><th>Revenue</th><th>Avg/Visit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.doctorId} className="border-t">
                <td className="py-3">{r.doctorName}</td>
                <td>{r.visits}</td>
                <td>{r.revenue.toLocaleString()}</td>
                <td>{r.avgPerVisit.toFixed(2)}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} className="py-4 text-slate-400">No visits for selected period</td></tr>}
          </tbody>
        </table>
      );
    }
    if (scope === 'specialties') {
      const rows = localSpecialtyAggregates;
      return (
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-slate-400 uppercase">
              <th>Specialty</th><th>Visits</th><th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.specialty} className="border-t">
                <td className="py-3">{r.specialty}</td>
                <td>{r.visits}</td>
                <td>{r.revenue.toLocaleString()}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={3} className="py-4 text-slate-400">No visits for selected period</td></tr>}
          </tbody>
        </table>
      );
    }
    const rows = localCompanyAggregates;
    return (
      <table className="w-full text-left">
        <thead>
          <tr className="text-xs text-slate-400 uppercase">
            <th>Company</th><th>Visits</th><th>Total Paid</th><th>Total Due</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.companyId} className="border-t">
              <td className="py-3">{r.companyName}</td>
              <td>{r.visits}</td>
              <td>{r.totalPaid.toLocaleString()}</td>
              <td>{r.totalDue.toLocaleString()}</td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={4} className="py-4 text-slate-400">No visits for selected period</td></tr>}
        </tbody>
      </table>
    );
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 arabic-font" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Activity className="w-5 h-5 text-indigo-600" />
          <h3 className="text-xl font-black text-slate-800">????????</h3>
        </div>
        <div className="flex gap-2">
          <select className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-black text-sm" value={scope} onChange={e => setScope(e.target.value as Scope)}>
            <option value="doctors">??????</option>
            <option value="specialties">????????</option>
            <option value="companies">????? ???????</option>
          </select>
          <select className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-black text-sm" value={period} onChange={e => setPeriod(e.target.value as Period)}>
            <option value="daily">??????</option>
            <option value="weekly">????????</option>
            <option value="monthly">??????</option>
          </select>
          <button onClick={handleFetchServer} className="bg-indigo-600 text-white px-4 py-3 rounded-2xl font-black text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Fetch from API
          </button>
        </div>
      </div>

      {serverError && <div className="mb-4 text-sm text-red-500">Server: {serverError}</div>}
      <div className="overflow-x-auto">
        {loading ? <div className="py-10 text-center text-slate-400">Loading...</div> : renderTable()}
      </div>

      <div className="mt-6 text-xs text-slate-400">
        Showing client-side aggregates when server reports are not available. Use the backend endpoints listed in configuration to enable server-side reports.
      </div>
    </div>
  );
};

export default ReportsView;