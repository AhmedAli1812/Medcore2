
import React, { useMemo, useState, useRef } from 'react';
import { Visit, Doctor, VisitStatus } from '../types';
import { 
  Banknote, TrendingUp, ArrowDownToLine, DollarSign, 
  CheckCircle, Clock, Printer, Download, Activity, FileText
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface AccountantViewProps {
  visits: Visit[];
  doctors: Doctor[];
  searchTerm: string;
}

const AccountantView: React.FC<AccountantViewProps> = ({ visits, doctors, searchTerm }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    const totalRev = visits.reduce((sum, v) => sum + v.totalAmount, 0);
    const cashRev = visits.reduce((sum, v) => sum + v.patientCash, 0);
    const insuranceDue = visits.reduce((sum, v) => sum + v.insurancePay, 0);
    return { totalRevenue: totalRev, cashOnHand: cashRev, receivables: insuranceDue, visitCount: visits.length };
  }, [visits]);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`MedCore_Financial_Report_${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error('PDF Error:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 arabic-font" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
        {[
          { label: 'إجمالي الإيرادات', value: stats.totalRevenue, icon: TrendingUp, color: 'indigo' },
          { label: 'النقدية بالخزينة', value: stats.cashOnHand, icon: Banknote, color: 'emerald' },
          { label: 'مديونيات شركات التأمين', value: stats.receivables, icon: ArrowDownToLine, color: 'blue' },
          { label: 'عدد الزيارات اليوم', value: stats.visitCount, icon: FileText, color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${stat.color}-50 rounded-full`}></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-100 flex items-center justify-center text-${stat.color}-600 mb-4`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800">{stat.value.toLocaleString()} {i < 3 ? 'EGP' : ''}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 no-print">
         <button 
           onClick={handleExportPDF} 
           disabled={isGeneratingPdf}
           className="flex items-center px-8 py-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl disabled:opacity-50"
         >
           {isGeneratingPdf ? <Activity className="w-4 h-4 ml-2 animate-spin" /> : <Download className="w-4 h-4 ml-2" />}
           تحميل تقرير PDF
         </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden no-print">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-800">سجل المعاملات المالي</h3>
          <button onClick={() => window.print()} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-600 transition-colors">
            <Printer className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">رقم الفاتورة</th>
                <th className="px-8 py-5">المريض</th>
                <th className="px-8 py-5">النوع</th>
                <th className="px-8 py-5 text-left">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visits.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 font-mono text-xs font-black text-indigo-600">{v.id}</td>
                  <td className="px-8 py-5 text-xs font-black">زيارة رقم {v.visitNumber}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${v.paymentType === 'Cash' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {v.paymentType === 'Cash' ? 'نقدي' : 'تأمين'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-left font-black text-slate-800">{v.totalAmount.toLocaleString()} EGP</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden PDF Template */}
      <div ref={reportRef} className="pdf-report-container arabic-font" dir="rtl">
        <div className="flex justify-between items-center mb-10 border-b-4 border-indigo-600 pb-6">
          <div>
            <h1 className="text-3xl font-black text-indigo-900 italic">MedCore CMS Enterprise</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest mt-1">التقرير المالي اللحظي - نظام ميد كور</p>
          </div>
          <div className="text-left font-black text-xs text-slate-400">
            {new Date().toLocaleDateString()} | {new Date().toLocaleTimeString()}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">إجمالي الدخل</p>
            <h2 className="text-3xl font-black text-indigo-600">{stats.totalRevenue.toLocaleString()} EGP</h2>
          </div>
          <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">النقدية الفعلية</p>
            <h2 className="text-3xl font-black text-emerald-600">{stats.cashOnHand.toLocaleString()} EGP</h2>
          </div>
        </div>
        <h3 className="text-lg font-black text-slate-800 mb-6 border-b pb-2">تفاصيل العمليات المالية</h3>
        <table className="w-full text-right text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-4 border">كود العملية</th>
              <th className="p-4 border">التاريخ</th>
              <th className="p-4 border">النوع</th>
              <th className="p-4 border">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            {visits.map(v => (
              <tr key={v.id}>
                <td className="p-4 border font-mono">{v.id}</td>
                <td className="p-4 border">{new Date(v.date).toLocaleDateString()}</td>
                <td className="p-4 border">{v.paymentType === 'Cash' ? 'نقدي' : 'تأمين'}</td>
                <td className="p-4 border font-black">{v.totalAmount} EGP</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-20 pt-10 border-t text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">هذا التقرير تم إنشاؤه آلياً ولا يتطلب توقيعاً رسمياً.</p>
        </div>
      </div>
    </div>
  );
};

export default AccountantView;
