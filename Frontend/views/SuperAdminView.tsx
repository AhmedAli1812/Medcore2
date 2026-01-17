
import React, { useState, useMemo } from 'react';
import { Clinic, SubscriptionPlan } from '../types';
import { 
  Building2, 
  TrendingUp, 
  ShieldCheck, 
  Power, 
  CreditCard, 
  Search, 
  Filter, 
  MoreVertical,
  Activity,
  AlertTriangle,
  Users,
  Settings
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area
} from 'recharts';

interface SuperAdminViewProps {
  clinics: Clinic[];
  onUpdateClinic: (id: string, updates: Partial<Clinic>) => void;
}

const SuperAdminView: React.FC<SuperAdminViewProps> = ({ clinics, onUpdateClinic }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const stats = useMemo(() => {
    return {
      totalClinics: clinics.length,
      activeClinics: clinics.filter(c => c.status === 'Active').length,
      totalRevenue: clinics.reduce((s, c) => s + c.monthlyFee, 0),
      totalSystemVisits: clinics.reduce((s, c) => s + c.totalVisits, 0)
    };
  }, [clinics]);

  const filteredClinics = clinics.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = (clinic: Clinic) => {
    const newStatus = clinic.status === 'Active' ? 'Suspended' : 'Active';
    onUpdateClinic(clinic.id, { status: newStatus });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total SaaS Revenue</p>
          <h4 className="text-3xl font-black mb-1">{stats.totalRevenue.toLocaleString()} EGP</h4>
          <p className="text-xs text-emerald-400 flex items-center font-bold">Monthly Recurring (MRR)</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Registered Clinics</p>
          <h4 className="text-3xl font-black text-slate-800 mb-1">{stats.totalClinics}</h4>
          <p className="text-xs text-indigo-500 font-bold">{stats.activeClinics} Active Globally</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Data Load</p>
          <h4 className="text-3xl font-black text-slate-800 mb-1">{(stats.totalSystemVisits / 1000).toFixed(1)}k</h4>
          <p className="text-xs text-slate-400 font-bold">Aggregated System Visits</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">System Health</p>
          <h4 className="text-3xl font-black text-emerald-600 mb-1">Optimal</h4>
          <p className="text-xs text-emerald-500 font-bold">All clusters reporting normal</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Clinic Management Table */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-xl font-black text-slate-800">Master Clinic Registry</h3>
            <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2 w-full md:w-auto">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                placeholder="Search clinics..." 
                className="bg-transparent text-sm font-bold outline-none w-full md:w-48"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4">Clinic / Owner</th>
                  <th className="px-8 py-4">Subscription</th>
                  <th className="px-8 py-4 text-center">Status</th>
                  <th className="px-8 py-4 text-center">Usage</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClinics.map(clinic => (
                  <tr key={clinic.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 ${clinic.status === 'Active' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{clinic.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{clinic.ownerName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        clinic.plan === SubscriptionPlan.ENTERPRISE ? 'bg-purple-100 text-purple-700' : 
                        clinic.plan === SubscriptionPlan.PRO ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {clinic.plan}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1 font-bold">Due: {new Date(clinic.nextBillingDate).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        clinic.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${clinic.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        {clinic.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="w-24 h-2 bg-slate-100 rounded-full mx-auto overflow-hidden">
                        <div 
                          className={`h-full ${clinic.status === 'Active' ? 'bg-indigo-500' : 'bg-slate-300'}`} 
                          style={{ width: `${Math.min((clinic.totalVisits / 50000) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{clinic.totalVisits.toLocaleString()} Transactions</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => toggleStatus(clinic)}
                          className={`p-2 rounded-xl transition-all ${clinic.status === 'Active' ? 'hover:bg-red-50 text-red-400 hover:text-red-600' : 'hover:bg-emerald-50 text-emerald-400 hover:text-emerald-600'}`}
                          title={clinic.status === 'Active' ? 'Suspend Clinic' : 'Reactivate Clinic'}
                        >
                          <Power className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600">
                          <Settings className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global System Alerts */}
        <div className="w-full lg:w-96 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
              Infrastructure Alerts
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <p className="font-bold text-red-900 text-sm">Giza Heart Center Suspended</p>
                <p className="text-xs text-red-700 mt-1">Manual suspension triggered due to non-payment (30 days overdue).</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="font-bold text-indigo-900 text-sm">Upgrade Opportunity</p>
                <p className="text-xs text-indigo-700 mt-1">Alexandria Specialized Clinic exceeded 3,000 monthly visits. Suggest "Pro" plan.</p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl">
             <h3 className="text-lg font-black mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Plan Distribution
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Basic Plan', count: clinics.filter(c => c.plan === SubscriptionPlan.BASIC).length, color: 'bg-indigo-400' },
                { label: 'Pro Plan', count: clinics.filter(c => c.plan === SubscriptionPlan.PRO).length, color: 'bg-indigo-200' },
                { label: 'Enterprise', count: clinics.filter(c => c.plan === SubscriptionPlan.ENTERPRISE).length, color: 'bg-white' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2 opacity-80">
                    <span>{item.label}</span>
                    <span>{((item.count / clinics.length) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-indigo-700 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${(item.count / clinics.length) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminView;
