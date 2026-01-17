
import React, { useMemo, useState, useRef } from 'react';
import { InsuranceCompany, Visit, Patient, Doctor } from '../types';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Wallet, 
  Filter, 
  Download, 
  ArrowUpRight,
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  X,
  FileText,
  Printer,
  Activity
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface InsuranceManagerViewProps {
  companies: InsuranceCompany[];
  visits: Visit[];
  patients: Patient[];
  doctors: Doctor[];
}

const InsuranceManagerView: React.FC<InsuranceManagerViewProps> = ({ 
  companies, visits, patients, doctors 
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<string | null>(null);
  const claimReportRef = useRef<HTMLDivElement>(null);
  const [selectedForReport, setSelectedForReport] = useState<InsuranceCompany | null>(null);

  const stats = useMemo(() => {
    const insuranceVisits = visits.filter(v => v.paymentType === 'Insurance');
    const totalDue = insuranceVisits.reduce((sum, v) => sum + v.insurancePay, 0);
    const totalPaid = companies.reduce((sum, c) => sum + c.totalPaid, 0); 
    
    return {
      totalDue,
      totalPaid,
      pending: totalDue - totalPaid,
      visitCount: insuranceVisits.length,
      patientCount: patients.filter(p => !!p.insuranceCompanyId).length
    };
  }, [companies, visits, patients]);

  const companyStats = useMemo(() => {
    return companies.map(c => {
      const compVisits = visits.filter(v => v.paymentType === 'Insurance' && v.insuranceCompanyId === c.id);
      const currentDue = compVisits.reduce((acc, v) => acc + v.insurancePay, 0);
      return {
        ...c,
        currentDue,
        visitCount: compVisits.length,
        actualVisits: compVisits
      };
    });
  }, [companies, visits]);

  const chartData = companyStats.map(c => ({
    name: c.name,
    due: c.currentDue,
    paid: c.totalPaid,
    pending: Math.max(0, c.currentDue - c.totalPaid)
  }));

  const handleDownloadClaim = async (company: any) => {
    setSelectedForReport(company);
    setIsGeneratingPdf(company.id);
    
    // We need a short timeout to let the hidden report populate with the new selection
    setTimeout(async () => {
      if (!claimReportRef.current) return;
      try {
        const element = claimReportRef.current;
        const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Claim_${company.name}_${new Date().toLocaleDateString()}.pdf`);
      } catch (error) {
        console.error('PDF Error:', error);
      } finally {
        setIsGeneratingPdf(null);
        setSelectedForReport(null);
      }
    }, 100);
  };

  return (
    <div className="space-y-8 arabic-font">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
        {[
          { label: 'إجمالي مطالبات التأمين', value: `${stats.totalDue.toLocaleString()} EGP`, icon: Wallet, color: 'indigo' },
          { label: 'التحصيلات الفعلية', value: `${stats.totalPaid.toLocaleString()} EGP`, icon: CheckCircle2, color: 'emerald' },
          { label: 'مبالغ تحت التحصيل', value: `${stats.pending.toLocaleString()} EGP`, icon: Clock, color: 'amber' },
          { label: 'مرضى التعاقدات', value: stats.patientCount, icon: Users, color: 'purple' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center transition-all hover:shadow-md">
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-100 flex items-center justify-center text-${stat.color}-600 ml-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-black text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-800 flex items-center">
              <TrendingUp className="w-5 h-5 ml-2 text-indigo-600" />
              توزيع مديونيات الشركات (تحديث لحظي)
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Bar dataKey="paid" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="pending" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-[11px] font-black text-slate-800 mb-6 flex items-center uppercase tracking-widest">
            <ShieldCheck className="w-5 h-5 ml-2 text-indigo-600" />
            الشركات الأكثر نشاطاً
          </h3>
          <div className="flex-1 space-y-4">
            {companyStats.sort((a,b) => b.visitCount - a.visitCount).map((comp, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-slate-100">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{comp.name}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase">{comp.visitCount} مطالبات فعالة</p>
                </div>
                <div className="text-left">
                  <p className="font-black text-indigo-600">{comp.currentDue.toLocaleString()} EGP</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
        {companyStats.map((company) => {
          const outstanding = Math.max(0, company.currentDue - company.totalPaid);
          const isProcessing = isGeneratingPdf === company.id;

          return (
            <div key={company.id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all border-t-4 border-t-indigo-500">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                    <Building2 className="w-7 h-7 text-indigo-600" />
                  </div>
                </div>
                
                <h4 className="text-xl font-black text-slate-800 mb-2">{company.name}</h4>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">المرضى</p>
                    <p className="text-xl font-black text-slate-700">{patients.filter(p => p.insuranceCompanyId === company.id).length}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">المطالبات</p>
                    <p className="text-xl font-black text-slate-700">{company.visitCount}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-xs font-black">
                    <span className="text-slate-400 uppercase tracking-widest">المبلغ المستحق</span>
                    <span className="text-indigo-600 text-lg">{outstanding.toLocaleString()} EGP</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleDownloadClaim(company)}
                  disabled={isProcessing}
                  className="w-full py-5 rounded-3xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Activity className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {isProcessing ? 'جاري التحميل...' : 'استخراج ملف المطالبة'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hidden Claim Report Template for PDF capture */}
      <div ref={claimReportRef} className="pdf-report-container arabic-font" dir="rtl">
        {selectedForReport && (
          <>
            <div className="flex justify-between items-center mb-10 border-b-4 border-emerald-600 pb-6">
              <div>
                 <h1 className="text-3xl font-black text-emerald-900">مطالبة مالية رسمية</h1>
                 <p className="text-slate-500 font-bold uppercase tracking-widest">إلى: {selectedForReport.name}</p>
              </div>
              <div className="text-left">
                 <p className="text-xs font-black">كود الشركة: {selectedForReport.id}</p>
                 <p className="text-xs font-black">تاريخ الاستخراج: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-[2rem] mb-10">
               <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">عدد الزيارات المطالب بها</p>
                    <p className="text-2xl font-black">{companyStats.find(c => c.id === selectedForReport.id)?.visitCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">إجمالي قيمة المطالبة</p>
                    <p className="text-2xl font-black text-indigo-600">{(companyStats.find(c => c.id === selectedForReport.id)?.currentDue || 0).toLocaleString()} EGP</p>
                  </div>
               </div>
            </div>

            <h3 className="text-sm font-black uppercase tracking-widest mb-6 border-b pb-2">تفاصيل الزيارات</h3>
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-3 border">تاريخ الزيارة</th>
                  <th className="p-3 border">المريض</th>
                  <th className="p-3 border">الطبيب</th>
                  <th className="p-3 border">المبلغ المطالب به</th>
                </tr>
              </thead>
              <tbody>
                {companyStats.find(c => c.id === selectedForReport.id)?.actualVisits.map((v: any) => (
                  <tr key={v.id}>
                    <td className="p-3 border">{new Date(v.date).toLocaleDateString()}</td>
                    <td className="p-3 border font-black">{patients.find(p => p.id === v.patientId)?.name}</td>
                    <td className="p-3 border">{doctors.find(d => d.id === v.doctorId)?.name}</td>
                    <td className="p-3 border font-black">{v.insurancePay} EGP</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-20 flex justify-between px-10">
               <div className="text-center">
                  <p className="text-xs font-black mb-10 text-slate-400 uppercase tracking-widest">توقيع المدير المالي</p>
                  <div className="w-40 h-0.5 bg-slate-200"></div>
               </div>
               <div className="text-center">
                  <p className="text-xs font-black mb-10 text-slate-400 uppercase tracking-widest">ختم المركز الطبي</p>
                  <div className="w-40 h-0.5 bg-slate-200"></div>
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InsuranceManagerView;
