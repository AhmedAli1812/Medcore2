
import React, { useState, useMemo, useEffect } from 'react';
import { Patient, Doctor, InsuranceCompany, Visit, PaymentType, Room, Schedule, VisitStatus } from '../types';
// Added Monitor to the imports from lucide-react
import { 
  UserPlus, Plus, Printer, X, Check, DoorOpen, User, Phone, Clock, IdCard, 
  LayoutGrid, Activity, Users, ShieldCheck, CreditCard, ReceiptText, 
  Stethoscope, MapPin, ChevronRight, Timer, Calendar, Hash, Tag, Briefcase,
  Monitor
} from 'lucide-react';

interface ReceptionViewProps {
  patients: Patient[];
  doctors: Doctor[];
  companies: InsuranceCompany[];
  visits: Visit[];
  rooms: Room[];
  schedules: Schedule[];
  searchTerm: string;
  onAddPatient: (p: Patient) => void;
  onAddVisit: (v: Visit) => void;
  onUpdateVisit?: (id: string, updates: Partial<Visit>) => void;
}

const SERVICES = [
  { id: 'srv-1', name: 'كشف ممارس عام', price: 300 },
  { id: 'srv-2', name: 'كشف استشاري', price: 600 },
  { id: 'srv-3', name: 'متابعة (إعادة)', price: 150 },
];

const CATEGORIES = [
  { id: 'cat-a', name: 'فئة A (تغطية 95%)', coverage: 95 },
  { id: 'cat-b', name: 'فئة B (تغطية 80%)', coverage: 80 },
];

const ReceptionView: React.FC<ReceptionViewProps> = ({ 
  patients, doctors, companies, visits, rooms, schedules, searchTerm, onAddPatient, onAddVisit, onUpdateVisit 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showLiveMonitor, setShowLiveMonitor] = useState(true);
  
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [currentInvoiceVisit, setCurrentInvoiceVisit] = useState<Visit | null>(null);

  const [newPatientForm, setNewPatientForm] = useState({ 
    name: '', phone: '', age: 0, gender: 'Male' as 'Male' | 'Female', nationalId: '',
    insuranceCompanyId: '', policyNumber: '', paymentType: 'Cash' as PaymentType 
  });
  
  const [bookingDetails, setBookingDetails] = useState({ 
    doctorId: '', paymentType: 'Cash' as PaymentType, roomId: '', 
    insuranceCompanyId: '', policyNumber: '', insuranceCategory: 'cat-a',
    serviceId: 'srv-1',
    startTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) 
  });

  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Group visits by room for the Live Monitor
  const roomStatus = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return rooms.map(room => {
      const activeSchedule = schedules.find(s => s.roomId === room.id && s.dayOfWeek === currentDay);
      const doctor = activeSchedule ? doctors.find(d => d.id === activeSchedule.doctorId) : null;
      const waitingPatients = visits
        .filter(v => v.roomId === room.id && v.date.startsWith(today) && (v.status === VisitStatus.ARRIVED || v.status === VisitStatus.SCHEDULED))
        .map(v => ({
          ...v,
          patientName: patients.find(p => p.id === v.patientId)?.name || 'مريض غير معروف'
        }))
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      return { room, doctor, waitingPatients };
    });
  }, [rooms, schedules, doctors, visits, patients, currentDay]);

  useEffect(() => {
    if (selectedPatientId) {
      const p = patients.find(p => p.id === selectedPatientId);
      if (p) {
        setBookingDetails(prev => ({
          ...prev,
          paymentType: p.insuranceCompanyId ? 'Insurance' : 'Cash',
          insuranceCompanyId: p.insuranceCompanyId || '',
          policyNumber: p.policyNumber || ''
        }));
      }
    }
  }, [selectedPatientId, patients]);

  useEffect(() => {
    if (bookingDetails.doctorId) {
      const todaySched = schedules.find(s => s.doctorId === bookingDetails.doctorId && s.dayOfWeek === currentDay);
      if (todaySched) setBookingDetails(prev => ({ ...prev, roomId: todaySched.roomId }));
    }
  }, [bookingDetails.doctorId, schedules, currentDay]);

  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    const pId = `P-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const patient: Patient = {
      id: pId,
      ...newPatientForm,
      insuranceCompanyId: newPatientForm.paymentType === 'Insurance' ? newPatientForm.insuranceCompanyId : undefined,
      policyNumber: newPatientForm.paymentType === 'Insurance' ? newPatientForm.policyNumber : undefined,
      createdAt: new Date().toISOString()
    };
    onAddPatient(patient);
    setShowAddModal(false);
    setSelectedPatientId(pId);
    setShowVisitModal(true);
    // Reset form
    setNewPatientForm({ name: '', phone: '', age: 0, gender: 'Male', nationalId: '', insuranceCompanyId: '', policyNumber: '', paymentType: 'Cash' });
  };

  const financialCalc = useMemo(() => {
    const selectedService = SERVICES.find(s => s.id === bookingDetails.serviceId);
    const baseFee = selectedService?.price || 0;
    if (bookingDetails.paymentType === 'Cash') return { total: baseFee, patient: baseFee, insurance: 0 };
    const selectedCat = CATEGORIES.find(c => c.id === bookingDetails.insuranceCategory);
    const coveragePercent = selectedCat?.coverage || 80;
    const insurancePart = (baseFee * coveragePercent) / 100;
    return { total: baseFee, patient: baseFee - insurancePart, insurance: insurancePart };
  }, [bookingDetails.serviceId, bookingDetails.paymentType, bookingDetails.insuranceCategory]);

  const handleBookVisit = () => {
    if (!selectedPatientId || !bookingDetails.doctorId) return;
    // Fix: Include insuranceCompanyId in the visit object to support insurance reporting and resolve type errors in InsuranceManagerView
    const visit: Visit = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      patientId: selectedPatientId,
      doctorId: bookingDetails.doctorId,
      roomId: bookingDetails.roomId,
      date: new Date().toISOString(),
      startTime: bookingDetails.startTime,
      visitNumber: visits.filter(v => v.patientId === selectedPatientId).length + 1,
      paymentType: bookingDetails.paymentType,
      totalAmount: financialCalc.total,
      insurancePay: financialCalc.insurance,
      patientCash: financialCalc.patient,
      serviceId: bookingDetails.serviceId,
      insuranceCategory: bookingDetails.insuranceCategory,
      insuranceCompanyId: bookingDetails.paymentType === 'Insurance' ? bookingDetails.insuranceCompanyId : undefined,
      status: VisitStatus.SCHEDULED
    };
    onAddVisit(visit);
    setCurrentInvoiceVisit(visit);
    setShowVisitModal(false);
    setShowReceiptModal(true);
  };

  return (
    <div className="space-y-8 arabic-font" dir="rtl">
      {/* Top Controls */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm no-print">
        <div className="flex gap-4">
          <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-black transition-all">
            <UserPlus className="w-5 h-5" /> تسجيل مريض وحجز
          </button>
          <button onClick={() => setShowLiveMonitor(!showLiveMonitor)} className={`px-8 py-4 rounded-2xl font-black flex items-center gap-2 border-2 transition-all ${showLiveMonitor ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 text-slate-400'}`}>
            <Monitor className="w-5 h-5" /> {showLiveMonitor ? 'إخفاء شاشة الغرف' : 'عرض مراقبة الغرف'}
          </button>
        </div>
        <div className="flex items-center gap-4 text-slate-400 font-bold text-sm">
           <Activity className="w-5 h-5 text-emerald-500" />
           النظام متصل • {currentDay}
        </div>
      </div>

      {/* Live Room Monitor */}
      {showLiveMonitor && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
          {roomStatus.map(({ room, doctor, waitingPatients }) => (
            <div key={room.id} className={`bg-white rounded-[2.5rem] border-2 p-6 flex flex-col min-h-[350px] transition-all ${doctor ? 'border-indigo-50 shadow-sm' : 'border-slate-50 opacity-60'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${doctor ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                  <DoorOpen className="w-6 h-6" />
                </div>
                {doctor && <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase">مفعلة</span>}
              </div>
              
              <h4 className="text-xl font-black text-slate-800 mb-1">{room.name}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{room.specialty}</p>

              {doctor ? (
                <div className="flex-1 flex flex-col">
                  <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 mb-4">
                    <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">الطبيب المناوب</p>
                    <p className="text-sm font-black text-slate-800">{doctor.name}</p>
                  </div>
                  
                  <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar max-h-40">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2">
                       <Users className="w-3 h-3" /> قائمة الانتظار ({waitingPatients.length})
                    </p>
                    {waitingPatients.length > 0 ? waitingPatients.length > 0 && waitingPatients.map((v, i) => (
                      <div key={v.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-700 truncate max-w-[120px]">{i+1}. {v.patientName}</span>
                        <span className="text-[10px] font-black text-indigo-500">{v.startTime}</span>
                      </div>
                    )) : (
                      <p className="text-[10px] text-slate-300 italic text-center py-4">لا يوجد مرضى حالياً</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-300 italic text-xs">
                  لا يوجد طبيب مسجل اليوم
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Patient Database (Simplified for view) */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden no-print">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-800">سجل المرضى</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase">
              <tr>
                <th className="px-8 py-5">المريض</th>
                <th className="px-8 py-5">حالة التعاقد</th>
                <th className="px-8 py-5 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.filter(p => p.name.includes(searchTerm)).map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-800">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{p.id} • {p.phone}</p>
                  </td>
                  <td className="px-8 py-6">
                    {p.insuranceCompanyId ? (
                      <span className="text-emerald-600 font-black text-[10px] flex items-center">
                        <ShieldCheck className="w-4 h-4 ml-1" /> {companies.find(c => c.id === p.insuranceCompanyId)?.name}
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-lg text-[9px] font-black">نقدي</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-left">
                    <button onClick={() => { setSelectedPatientId(p.id); setShowVisitModal(true); }} className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                      <Plus className="w-6 h-6" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-slate-800">تسجيل مريض جديد</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
              </div>
              <form onSubmit={handleRegisterPatient} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required placeholder="اسم المريض" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-black" value={newPatientForm.name} onChange={e => setNewPatientForm({...newPatientForm, name: e.target.value})} />
                  <input required placeholder="رقم الهاتف" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-black" value={newPatientForm.phone} onChange={e => setNewPatientForm({...newPatientForm, phone: e.target.value})} />
                </div>
                
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase text-center tracking-widest">نوع الدفع والتعاقد</p>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setNewPatientForm({...newPatientForm, paymentType: 'Cash'})} className={`flex-1 p-4 rounded-2xl border-2 font-black transition-all flex items-center justify-center gap-2 ${newPatientForm.paymentType === 'Cash' ? 'border-indigo-600 bg-white text-indigo-600 shadow-xl shadow-indigo-100' : 'border-slate-100 bg-white/50 text-slate-300'}`}>
                       <CreditCard className="w-4 h-4" /> نقدي
                    </button>
                    <button type="button" onClick={() => setNewPatientForm({...newPatientForm, paymentType: 'Insurance'})} className={`flex-1 p-4 rounded-2xl border-2 font-black transition-all flex items-center justify-center gap-2 ${newPatientForm.paymentType === 'Insurance' ? 'border-emerald-600 bg-white text-emerald-600 shadow-xl shadow-emerald-100' : 'border-slate-100 bg-white/50 text-slate-300'}`}>
                       <ShieldCheck className="w-4 h-4" /> تعاقد
                    </button>
                  </div>
                  
                  {newPatientForm.paymentType === 'Insurance' && (
                    <div className="space-y-4 animate-in slide-in-from-top-2">
                       <select required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 font-bold text-slate-700" value={newPatientForm.insuranceCompanyId} onChange={e => setNewPatientForm({...newPatientForm, insuranceCompanyId: e.target.value})}>
                         <option value="">اختر شركة التأمين</option>
                         {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                       </select>
                       <input required placeholder="رقم بوليصة التأمين / الكارنيه" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 font-bold text-slate-700" value={newPatientForm.policyNumber} onChange={e => setNewPatientForm({...newPatientForm, policyNumber: e.target.value})} />
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full bg-indigo-600 text-white font-black py-6 rounded-3xl shadow-xl hover:bg-black transition-all">تأكيد التسجيل</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showVisitModal && selectedPatientId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 space-y-8">
              <div className="flex justify-between items-center border-b border-slate-100 pb-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-800">حجز موعد جديد</h2>
                  <p className="text-slate-400 font-bold">المريض: {patients.find(p => p.id === selectedPatientId)?.name}</p>
                </div>
                <button onClick={() => setShowVisitModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">اختر الطبيب والعيادة</label>
                  <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                    {doctors.map(doc => {
                      const room = rooms.find(r => r.id === schedules.find(s => s.doctorId === doc.id && s.dayOfWeek === currentDay)?.roomId);
                      return (
                        <button key={doc.id} onClick={() => setBookingDetails({...bookingDetails, doctorId: doc.id, roomId: room?.id || ''})} className={`p-4 rounded-2xl border-2 text-right transition-all flex justify-between items-center ${bookingDetails.doctorId === doc.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-50 bg-slate-50'}`}>
                          <div className="flex items-center gap-3">
                             <Stethoscope className="w-5 h-5 text-indigo-400" />
                             <div>
                               <p className="font-black text-slate-800 text-sm">{doc.name}</p>
                               <p className="text-[10px] font-bold text-indigo-500 uppercase">{doc.specialty} • {room?.name || 'غرفة غير محددة'}</p>
                             </div>
                          </div>
                          <span className="bg-white px-3 py-1 rounded-lg border border-slate-100 font-black text-xs">{doc.consultationFee} EGP</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                   <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <span className="text-xs font-black text-slate-400 uppercase">المبلغ الإجمالي</span>
                      <span className="text-xl font-black text-slate-800">{financialCalc.total} EGP</span>
                   </div>
                   {bookingDetails.paymentType === 'Insurance' && (
                     <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                        <span className="text-xs font-black text-emerald-600 uppercase">مساهمة الشركة</span>
                        <span className="text-xl font-black text-emerald-700">{financialCalc.insurance} EGP</span>
                     </div>
                   )}
                   <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-2">الصافي المطلوب من المريض</p>
                      <p className="text-4xl font-black text-emerald-400">{financialCalc.patient} <span className="text-sm font-normal opacity-60">EGP</span></p>
                      <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-[10px] font-black text-indigo-300 uppercase">
                         <MapPin className="w-4 h-4" /> {rooms.find(r => r.id === bookingDetails.roomId)?.name || 'الرجاء اختيار طبيب'}
                      </div>
                   </div>
                   <button onClick={handleBookVisit} disabled={!bookingDetails.doctorId} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all disabled:opacity-50">تأكيد الحجز وطباعة الفاتورة</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Receipt Modal */}
      {showReceiptModal && currentInvoiceVisit && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 text-center animate-in zoom-in duration-300">
             <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mb-6 mx-auto text-white shadow-2xl shadow-emerald-100">
                <Check className="w-10 h-10" />
             </div>
             <h2 className="text-2xl font-black text-slate-800 mb-2">تم الحجز بنجاح</h2>
             <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mb-8">رقم الفاتورة: {currentInvoiceVisit.id}</p>

             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 text-right mb-6">
                <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">اسم المريض:</span><span className="font-black text-slate-800">{patients.find(p => p.id === currentInvoiceVisit.patientId)?.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">الطبيب:</span><span className="font-black text-indigo-600">{doctors.find(d => d.id === currentInvoiceVisit.doctorId)?.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">العيادة / الغرفة:</span><span className="font-black text-slate-800">{rooms.find(r => r.id === currentInvoiceVisit.roomId)?.name || 'N/A'}</span></div>
                <div className="pt-4 border-t border-slate-200 flex justify-between"><span className="text-xs font-black text-emerald-600">المبلغ المدفوع:</span><span className="font-black text-emerald-700">{currentInvoiceVisit.patientCash} EGP</span></div>
             </div>

             <div className="grid grid-cols-2 gap-4 no-print">
               <button onClick={() => window.print()} className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs flex items-center justify-center hover:bg-slate-200 transition-all">
                 <Printer className="w-4 h-4 ml-2" /> طباعة
               </button>
               <button onClick={() => { setShowReceiptModal(false); setCurrentInvoiceVisit(null); setSelectedPatientId(null); }} className="py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-indigo-100 hover:bg-black transition-all">إغلاق</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionView;
