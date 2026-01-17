
import React, { useState, useMemo, useEffect } from 'react';
import { Patient, Doctor, InsuranceCompany, Visit, PaymentType, Room, Schedule, VisitStatus, Service } from '../types';
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
  services: Service[];
  searchTerm: string;
  onAddPatient: (p: Patient) => void;
  onAddVisit: (v: Visit) => void;
  onUpdateVisit?: (id: string, updates: Partial<Visit>) => void;
}

const CATEGORIES = [
  { id: 'cat-a', name: 'فئة A (تغطية 95%)', coverage: 95 },
  { id: 'cat-b', name: 'فئة B (تغطية 80%)', coverage: 80 },
];

const ReceptionView: React.FC<ReceptionViewProps> = ({ 
  patients, doctors, companies, visits, rooms, schedules, services, searchTerm, onAddPatient, onAddVisit, onUpdateVisit 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showLiveMonitor, setShowLiveMonitor] = useState(true);
  const [activeTab, setActiveTab] = useState<'monitor' | 'appointments'>('monitor');
  const [bookingModalTab, setBookingModalTab] = useState<'doctor' | 'confirm'>('doctor');
  
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [currentInvoiceVisit, setCurrentInvoiceVisit] = useState<Visit | null>(null);
  const [printVisitData, setPrintVisitData] = useState<Visit | null>(null);

  const [newPatientForm, setNewPatientForm] = useState({ 
    name: '', phone: '', age: 0, gender: 'Male' as 'Male' | 'Female', nationalId: '',
    insuranceCompanyId: '', policyNumber: '', paymentType: 'Cash' as PaymentType 
  });
  
  const [bookingDetails, setBookingDetails] = useState({ 
    doctorId: '', paymentType: 'Cash' as PaymentType, roomId: '', 
    insuranceCompanyId: '', policyNumber: '', insuranceCategory: 'cat-a',
    serviceId: '',
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
    const selectedService = services.find(s => s.id === bookingDetails.serviceId);
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
          
          {/* Tabs */}
          <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
            <button 
              onClick={() => setActiveTab('monitor')} 
              className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'monitor' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white'}`}
            >
              <Monitor className="w-4 h-4" /> مراقبة الغرف
            </button>
            <button 
              onClick={() => setActiveTab('appointments')} 
              className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'appointments' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white'}`}
            >
              <Calendar className="w-4 h-4" /> المواعيد
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-400 font-bold text-sm">
           <Activity className="w-5 h-5 text-emerald-500" />
           النظام متصل • {currentDay}
        </div>
      </div>

      {/* Live Room Monitor */}
      {activeTab === 'monitor' && (
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

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden no-print">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-800">جميع المواعيد</h3>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="w-4 h-4" />
              {visits.length} موعد مسجل
            </div>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {visits.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد مواعيد مسجلة</p>
              </div>
            ) : (
              visits.map(visit => {
                const patient = patients.find(p => p.id === visit.patientId);
                const doctor = doctors.find(d => d.id === visit.doctorId);
                const service = services.find(s => s.id === visit.serviceId);
                const room = rooms.find(r => r.id === visit.roomId);
                
                return (
                  <div key={visit.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <User className="w-5 h-5 text-slate-400" />
                          <span className="font-bold text-slate-800">{patient?.name}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            visit.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                            visit.status === 'Arrived' ? 'bg-blue-100 text-blue-700' :
                            visit.status === 'In-Progress' ? 'bg-amber-100 text-amber-700' :
                            visit.status === 'Scheduled' ? 'bg-slate-100 text-slate-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {visit.status === 'Completed' ? 'مكتمل' :
                             visit.status === 'Arrived' ? 'وصل' :
                             visit.status === 'In-Progress' ? 'قيد التنفيذ' :
                             visit.status === 'Scheduled' ? 'مجدول' : 'ملغي'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">{doctor?.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DoorOpen className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">{room?.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">{visit.startTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">{service?.name || 'غير محدد'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-lg font-black text-slate-800">{visit.totalAmount} EGP</div>
                        <div className="text-xs text-slate-500">{visit.date}</div>
                      </div>
                    </div>
                    {visit.notes && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600">{visit.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
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
                    <button onClick={() => { setSelectedPatientId(p.id); setShowVisitModal(true); setBookingModalTab('doctor'); }} className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
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
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            {/* Fixed Header */}
            <div className="p-8 pb-6 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-800">تسجيل مريض جديد</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-8">
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
          <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            {/* Fixed Header */}
            <div className="p-8 pb-6 flex-shrink-0">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-800">حجز موعد جديد</h2>
                  <p className="text-slate-400 font-bold">المريض: {patients.find(p => p.id === selectedPatientId)?.name}</p>
                </div>
                <button onClick={() => { setShowVisitModal(false); setBookingModalTab('doctor'); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
              </div>

              {/* Booking Tabs */}
              <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 w-fit mt-6">
                <button
                  onClick={() => setBookingModalTab('doctor')}
                  className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${bookingModalTab === 'doctor' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white'}`}
                >
                  <Stethoscope className="w-4 h-4" /> اختر الطبيب
                </button>
                <button
                  onClick={() => setBookingModalTab('confirm')}
                  disabled={!bookingDetails.doctorId}
                  className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${bookingModalTab === 'confirm' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white'} ${!bookingDetails.doctorId ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Check className="w-4 h-4" /> تأكيد الموعد
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-8">

              {/* Doctor Selection Tab */}
              {bookingModalTab === 'doctor' && (
                <div className="space-y-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">اختر الطبيب والعيادة</label>
                  <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                    {doctors.map(doc => {
                      const room = rooms.find(r => r.id === schedules.find(s => s.doctorId === doc.id && s.dayOfWeek === currentDay)?.roomId);
                      return (
                        <button key={doc.id} onClick={() => { setBookingDetails({...bookingDetails, doctorId: doc.id, roomId: room?.id || '', serviceId: ''}); setBookingModalTab('confirm'); }} className={`p-4 rounded-xl border-2 text-right transition-all flex justify-between items-center ${bookingDetails.doctorId === doc.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-50 bg-slate-50'}`}>
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
              )}

              {/* Confirmation Tab */}
              {bookingModalTab === 'confirm' && bookingDetails.doctorId && (
                <div className="space-y-8">
                  {/* Selected Doctor Info */}
                  <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Stethoscope className="w-5 h-5 text-indigo-600" />
                        <div>
                          <p className="font-black text-slate-800">{doctors.find(d => d.id === bookingDetails.doctorId)?.name}</p>
                          <p className="text-xs text-indigo-600">{doctors.find(d => d.id === bookingDetails.doctorId)?.specialty} • {rooms.find(r => r.id === bookingDetails.roomId)?.name}</p>
                        </div>
                      </div>
                      <button onClick={() => setBookingModalTab('doctor')} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold">تغيير</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">خدمات الطبيب</label>
                      <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                        {services.filter(s => s.doctorId === bookingDetails.doctorId).map(service => (
                          <button key={service.id} onClick={() => setBookingDetails({...bookingDetails, serviceId: service.id})} className={`p-3 rounded-xl border-2 text-right transition-all flex justify-between items-center ${bookingDetails.serviceId === service.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-50 bg-slate-50'}`}>
                            <div className="flex items-center gap-3">
                              <Stethoscope className="w-4 h-4 text-indigo-400" />
                              <div>
                                <p className="font-bold text-slate-800">{service.name}</p>
                                <p className="text-xs text-slate-500">{service.specialty || 'خدمة الطبيب'}</p>
                              </div>
                            </div>
                            <span className="bg-white px-2 py-1 rounded-lg border border-slate-100 font-black text-xs">{service.price} EGP</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الخدمات العامة</label>
                      <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                        {services.filter(s => !s.doctorId || s.doctorId === '').map(service => (
                          <button key={service.id} onClick={() => setBookingDetails({...bookingDetails, serviceId: service.id})} className={`p-3 rounded-xl border-2 text-right transition-all flex justify-between items-center ${bookingDetails.serviceId === service.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-50 bg-slate-50'}`}>
                            <div className="flex items-center gap-3">
                              <Stethoscope className="w-4 h-4 text-slate-400" />
                              <div>
                                <p className="font-bold text-slate-800">{service.name}</p>
                                <p className="text-xs text-slate-500">{service.specialty || 'عام'}</p>
                              </div>
                            </div>
                            <span className="bg-white px-2 py-1 rounded-lg border border-slate-100 font-black text-xs">{service.price} EGP</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-6">
                     {bookingDetails.serviceId && (
                       <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-xs font-black text-slate-400 uppercase">الخدمة المختارة</span>
                             <span className="text-sm font-bold text-indigo-600">{services.find(s => s.id === bookingDetails.serviceId)?.name}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-xs font-black text-slate-400 uppercase">سعر الخدمة</span>
                             <span className="text-lg font-black text-slate-800">{services.find(s => s.id === bookingDetails.serviceId)?.price} EGP</span>
                          </div>
                       </div>
                     )}
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
                     <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-2">الصافي المطلوب من المريض</p>
                        <p className="text-3xl font-black text-emerald-400">{financialCalc.patient} <span className="text-sm font-normal opacity-60">EGP</span></p>
                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-[10px] font-black text-indigo-300 uppercase">
                           <MapPin className="w-4 h-4" /> {rooms.find(r => r.id === bookingDetails.roomId)?.name || 'الرجاء اختيار طبيب'}
                        </div>
                     </div>
                     <button onClick={handleBookVisit} disabled={!bookingDetails.serviceId} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all disabled:opacity-50">تأكيد الحجز وطباعة الفاتورة</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Print-only Receipt (always present but hidden) */}
      <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:p-8 print:text-right print:z-[100]">
        {printVisitData ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-slate-800 mb-2">مستشفى ميد كور</h1>
              <p className="text-slate-500 text-sm">نظام إدارة العيادات الطبية المتطور</p>
              <p className="text-slate-400 text-xs font-bold mt-2">تاريخ اليوم: {new Date().toLocaleDateString('ar-EG')}</p>
            </div>

            <h2 className="text-2xl font-black text-slate-800 mb-4 text-center">فاتورة حجز موعد</h2>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mb-6 text-center">رقم الفاتورة: {printVisitData.id}</p>

            <div className="border border-slate-300 p-6 space-y-4 text-right mb-6">
              <div className="flex justify-between text-sm"><span className="text-slate-600 font-bold">اسم المريض:</span><span className="font-black text-slate-800">{patients.find(p => p.id === printVisitData.patientId)?.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600 font-bold">رقم الهاتف:</span><span className="font-black text-slate-800">{patients.find(p => p.id === printVisitData.patientId)?.phone}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600 font-bold">الطبيب:</span><span className="font-black text-indigo-600">{doctors.find(d => d.id === printVisitData.doctorId)?.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600 font-bold">التخصص:</span><span className="font-black text-slate-800">{doctors.find(d => d.id === printVisitData.doctorId)?.specialty}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600 font-bold">العيادة / الغرفة:</span><span className="font-black text-slate-800">{rooms.find(r => r.id === printVisitData.roomId)?.name || 'N/A'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600 font-bold">الخدمة:</span><span className="font-black text-slate-800">{services.find(s => s.id === printVisitData.serviceId)?.name || 'استشارة عامة'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600 font-bold">تاريخ الموعد:</span><span className="font-black text-slate-800">{printVisitData.date}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600 font-bold">وقت الموعد:</span><span className="font-black text-slate-800">{printVisitData.startTime}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600 font-bold">نوع الدفع:</span><span className="font-black text-slate-800">{printVisitData.paymentType === 'Cash' ? 'نقدي' : 'تأمين'}</span></div>
              <div className="pt-4 border-t border-slate-300 flex justify-between"><span className="text-xs font-black text-emerald-600">المبلغ الإجمالي:</span><span className="font-black text-emerald-700 text-lg">{printVisitData.totalAmount} ج.م</span></div>
              {printVisitData.paymentType === 'Insurance' && (
                <>
                  <div className="flex justify-between text-sm"><span className="text-slate-600 font-bold">مساهمة التأمين:</span><span className="font-black text-blue-600">{printVisitData.insurancePay} ج.م</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-600 font-bold">المبلغ المطلوب من المريض:</span><span className="font-black text-emerald-700">{printVisitData.patientCash} ج.م</span></div>
                </>
              )}
              <div className="pt-4 border-t border-slate-300">
                <div className="flex justify-between text-sm"><span className="text-slate-600 font-bold">عدد المرضى اليوم:</span><span className="font-black text-slate-800">{visits.filter(v => v.date === new Date().toISOString().split('T')[0]).length}</span></div>
              </div>
            </div>

            <div className="text-center text-xs text-slate-400">
              <p>شكراً لزيارتكم • MedCore CMS</p>
              <p>للاستفسارات: support@medcore.com</p>
            </div>
          </>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-black text-red-600 mb-4">فاتورة غير متوفرة</h1>
            <p className="text-slate-500">لم يتم العثور على بيانات الفاتورة للطباعة</p>
          </div>
        )}
      </div>

      {/* Invoice Receipt Modal */}
      {showReceiptModal && currentInvoiceVisit && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl text-center animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            {/* Fixed Header */}
            <div className="p-8 pb-6 flex-shrink-0">
              <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mb-6 mx-auto text-white shadow-2xl shadow-emerald-100">
                <Check className="w-10 h-10" />
              </div>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-black text-slate-800 mb-2">مستشفى ميد كور</h1>
                <p className="text-slate-500 text-sm">نظام إدارة العيادات الطبية المتطور</p>
                <p className="text-slate-400 text-xs font-bold mt-2">تاريخ اليوم: {new Date().toLocaleDateString('ar-EG')}</p>
              </div>

              <h2 className="text-xl font-black text-slate-800 mb-2">فاتورة حجز موعد</h2>
              <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mb-4">رقم الفاتورة: {currentInvoiceVisit.id}</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 text-right mb-6">
                <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">اسم المريض:</span><span className="font-black text-slate-800">{patients.find(p => p.id === currentInvoiceVisit.patientId)?.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">رقم الهاتف:</span><span className="font-black text-slate-800">{patients.find(p => p.id === currentInvoiceVisit.patientId)?.phone}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">الطبيب:</span><span className="font-black text-indigo-600">{doctors.find(d => d.id === currentInvoiceVisit.doctorId)?.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">التخصص:</span><span className="font-black text-slate-800">{doctors.find(d => d.id === currentInvoiceVisit.doctorId)?.specialty}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">العيادة / الغرفة:</span><span className="font-black text-slate-800">{rooms.find(r => r.id === currentInvoiceVisit.roomId)?.name || 'N/A'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">الخدمة:</span><span className="font-black text-slate-800">{services.find(s => s.id === currentInvoiceVisit.serviceId)?.name || 'استشارة عامة'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">تاريخ الموعد:</span><span className="font-black text-slate-800">{currentInvoiceVisit.date}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">وقت الموعد:</span><span className="font-black text-slate-800">{currentInvoiceVisit.startTime}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">نوع الدفع:</span><span className="font-black text-slate-800">{currentInvoiceVisit.paymentType === 'Cash' ? 'نقدي' : 'تأمين'}</span></div>
                <div className="pt-4 border-t border-slate-200 flex justify-between"><span className="text-xs font-black text-emerald-600">المبلغ الإجمالي:</span><span className="font-black text-emerald-700 text-lg">{currentInvoiceVisit.totalAmount} ج.م</span></div>
                {currentInvoiceVisit.paymentType === 'Insurance' && (
                  <>
                    <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">مساهمة التأمين:</span><span className="font-black text-blue-600">{currentInvoiceVisit.insurancePay} ج.م</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">المبلغ المطلوب من المريض:</span><span className="font-black text-emerald-700">{currentInvoiceVisit.patientCash} ج.م</span></div>
                  </>
                )}
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">عدد المرضى اليوم:</span><span className="font-black text-slate-800">{visits.filter(v => v.date === new Date().toISOString().split('T')[0]).length}</span></div>
                </div>
              </div>

              <div className="text-center text-xs text-slate-400 mb-6">
                <p>شكراً لزيارتكم • MedCore CMS</p>
                <p>للاستفسارات: support@medcore.com</p>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="p-8 pt-0 flex-shrink-0">
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { setPrintVisitData(currentInvoiceVisit); window.print(); }} className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs flex items-center justify-center hover:bg-slate-200 transition-all">
                  <Printer className="w-4 h-4 ml-2" /> طباعة
                </button>
                <button onClick={() => { setShowReceiptModal(false); setCurrentInvoiceVisit(null); setSelectedPatientId(null); }} className="py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-indigo-100 hover:bg-black transition-all">إغلاق</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionView;
