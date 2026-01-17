import React, { useMemo, useState } from 'react';
import { Doctor, Visit, InsuranceCompany, Period, DoctorReport, SpecialtyReport, CompanyReport } from '../types';
import { Activity, Download } from 'lucide-react';

/**
 * ReportsView: Displays client-side reports aggregated from provided data.
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
    const map = new Map<string, { companyId: string; companyName: string; visits: number; revenue: number; totalPaid: number; totalDue: number }>();
    localFiltered.forEach(v => {
      const cid = v.insuranceCompanyId || 'direct';
      const comp = companies.find(c => c.id === cid);
      const name = comp?.name ?? (cid === 'direct' ? 'Cash / Direct' : cid);
      const cur = map.get(cid) ?? { companyId: cid, companyName: name, visits: 0, revenue: 0, totalPaid: 0, totalDue: 0 };
      cur.visits += 1;
      cur.revenue += Number(v.totalAmount || 0);
      if (v.paymentType === 'Insurance') {
        cur.totalPaid += Number(v.insurancePay || 0);
        cur.totalDue += Number(v.patientCash || 0);
      } else {
        // For cash payments, the full amount is "due" from patient
        cur.totalDue += Number(v.totalAmount || 0);
      }
      map.set(cid, cur);
    });
    return Array.from(map.values()) as CompanyReport[];
  }, [localFiltered, companies]);

  const exportToCSV = () => {
    let data: any[] = [];
    let filename = '';

    if (scope === 'doctors') {
      data = localDoctorAggregates.map(row => ({
        'Doctor': row.doctorName,
        'Visits': row.visits,
        'Revenue': row.revenue,
        'Average per Visit': row.visits > 0 ? (row.revenue / row.visits).toFixed(2) : '0'
      }));
      filename = 'doctor_reports';
    } else if (scope === 'specialties') {
      data = localSpecialtyAggregates.map(row => ({
        'Specialty': row.specialty,
        'Visits': row.visits,
        'Revenue': row.revenue,
        'Average per Visit': row.visits > 0 ? (row.revenue / row.visits).toFixed(2) : '0'
      }));
      filename = 'specialty_reports';
    } else if (scope === 'companies') {
      data = localCompanyAggregates.map(row => ({
        'Company': row.companyName,
        'Visits': row.visits,
        'Revenue': row.revenue,
        'Total Paid': row.totalPaid,
        'Total Due': row.totalDue
      }));
      filename = 'company_reports';
    }

    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvData = data.map(row => headers.map(header => `"${row[header]}"`));
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${period}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTable = () => {
    // Local aggregates
    if (scope === 'doctors') {
      const rows = localDoctorAggregates;
      return (
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-slate-400 uppercase">
              <th>الطبيب</th><th>عدد الزيارات</th><th>الإيرادات</th><th>متوسط/زيارة</th>
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
            {rows.length === 0 && <tr><td colSpan={4} className="py-4 text-slate-400">لا توجد زيارات في الفترة المحددة</td></tr>}
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
              <th>التخصص</th><th>عدد الزيارات</th><th>الإيرادات</th>
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
            {rows.length === 0 && <tr><td colSpan={3} className="py-4 text-slate-400">لا توجد زيارات في الفترة المحددة</td></tr>}
          </tbody>
        </table>
      );
    }
    const rows = localCompanyAggregates;
    return (
      <table className="w-full text-left">
        <thead>
          <tr className="text-xs text-slate-400 uppercase">
            <th>الشركة</th><th>عدد الزيارات</th><th>المبلغ المدفوع</th><th>المبلغ المستحق</th>
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
          {rows.length === 0 && <tr><td colSpan={4} className="py-4 text-slate-400">لا توجد زيارات في الفترة المحددة</td></tr>}
        </tbody>
      </table>
    );
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 arabic-font" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Activity className="w-5 h-5 text-indigo-600" />
          <h3 className="text-xl font-black text-slate-800">التقارير والإحصائيات</h3>
        </div>
        <div className="flex gap-2">
          <select className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-black text-sm" value={scope} onChange={e => setScope(e.target.value as Scope)}>
            <option value="doctors">الأطباء</option>
            <option value="specialties">التخصصات</option>
            <option value="companies">شركات التأمين</option>
          </select>
          <select className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-black text-sm" value={period} onChange={e => setPeriod(e.target.value as Period)}>
            <option value="daily">يومي</option>
            <option value="weekly">أسبوعي</option>
            <option value="monthly">شهري</option>
          </select>
          <button 
            onClick={exportToCSV}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg flex items-center gap-2 hover:bg-black transition-all"
          >
            <Download className="w-4 h-4" /> تصدير CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {renderTable()}
      </div>

      <div className="mt-6 text-xs text-slate-400">
        التقارير مجمعة من بيانات الزيارات المتاحة في النظام.
      </div>
    </div>
  );
};

export default ReportsView;