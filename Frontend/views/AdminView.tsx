import React, { useState, useMemo } from 'react';
import { Patient, Doctor, InsuranceCompany, Visit, Room, Schedule, VisitStatus } from '../types';
import { 
  Stethoscope, Clock, DoorOpen, X, Trash2, Monitor, Check, 
  Save, Users, Activity, Settings, Plus, MapPin, DollarSign, ShieldAlert
} from 'lucide-react';
import ReportsView from './ReportsView';

interface AdminViewProps {
  patients: Patient[];
  doctors: Doctor[];
  companies: InsuranceCompany[];
  visits: Visit[];
  rooms: Room[];
  schedules: Schedule[];
  searchTerm: string;
  onAddDoctor: (d: Doctor) => void;
  onRemoveDoctor: (id: string) => void;
  onAddCompany: (c: InsuranceCompany) => void;
  onRemoveCompany: (id: string) => void;
  onUpdateVisit: (id: string, updates: Partial<Visit>) => void;
  onUpdateSchedule: (newSchedules: Schedule[]) => void;
  onUpdateRoom: (id: string, updates: Partial<Room>) => void;
}

const SPECIALTIES = [
  'Cardiology', 'Pediatrics', 'Orthopedics', 'Surgery', 
  'Ophthalmology', 'Internal Medicine', 'Dermatology', 
  'Dentistry', 'Gynecology', 'Neurology'
];

const AdminView: React.FC<AdminViewProps> = ({ 
  patients, doctors, companies, visits, rooms, schedules, searchTerm, 
  onAddDoctor, onRemoveDoctor, onAddCompany, onRemoveCompany, onUpdateVisit, onUpdateSchedule, onUpdateRoom 
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'doctors' | 'reports'>('matrix');
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Form states for Room/Schedule Editing
  const [roomEditForm, setRoomEditForm] = useState({
    name: '',
    specialty: '',
    status: 'Active' as Room['status'],
    doctorId: '',
    startTime: '09:00',
    endTime: '21:00'
  });

  // Form states for New Doctor
  const [newDoctorForm, setNewDoctorForm] = useState({
    name: '',
    specialty: SPECIALTIES[0],
    consultationFee: 300,
    roomNumber: rooms[0]?.id || ''
  });

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

      return { room, doctor, activeSchedule, waitingPatients };
    });
  }, [rooms, schedules, doctors, visits, patients, currentDay]);

  const handleOpenEditRoom = (room: Room, schedule?: Schedule) => {
    setEditingRoomId(room.id);
    setRoomEditForm({
      name: room.name,
      specialty: room.specialty,
      status: room.status || 'Active',
      doctorId: schedule?.doctorId || '',
      startTime: schedule?.startTime || '09:00',
      endTime: schedule?.endTime || '21:00'
    });
  };

  const handleSaveRoomEdit = () => {
    if (!editingRoomId) return;

    onUpdateRoom(editingRoomId, {
      name: roomEditForm.name,
      specialty: roomEditForm.specialty,
      status: roomEditForm.status
    });

    if (roomEditForm.doctorId) {
      const existingSchedule = schedules.find(s => s.roomId === editingRoomId && s.dayOfWeek === currentDay);
      let newSchedules = [...schedules];
      if (existingSchedule) {
        newSchedules = newSchedules.map(s => s.id === existingSchedule.id ? {
          ...s,
          doctorId: roomEditForm.doctorId,
          startTime: roomEditForm.startTime,
          endTime: roomEditForm.endTime
        } : s);
      } else {
        newSchedules.push({
          id: `s-${Date.now()}`,
          roomId: editingRoomId,
          dayOfWeek: currentDay,
          doctorId: roomEditForm.doctorId,
          startTime: roomEditForm.startTime,
          endTime: roomEditForm.endTime
        });
      }
      onUpdateSchedule(newSchedules);
    }
    setEditingRoomId(null);
  };

  const handleAddDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctorForm.name) return;
    
    const docId = `d-${Date.now()}`;
    onAddDoctor({ id: docId, ...newDoctorForm });
    
    // Auto-create a default schedule
    const newSched: Schedule = {
      id: `s-${Date.now()}`,
      doctorId: docId,
      roomId: newDoctorForm.roomNumber,
      dayOfWeek: currentDay,
      startTime: '09:00',
      endTime: '21:00'
    };
    onUpdateSchedule([...schedules, newSched]);
    setShowAddDoc(false);
    setNewDoctorForm({ name: '', specialty: SPECIALTIES[0], consultationFee: 300, roomNumber: rooms[0]?.id || '' });
  };

  return (
    <div className="space-y-8 pb-12 arabic-font" dir="rtl">
      {/* Admin Nav */}
      <div className="flex bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm w-fit no-print">
        <button 
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center px-6 py-4 rounded-2xl text-[10px] font-black transition-all ${activeTab === 'matrix' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <Monitor className="w-4 h-4 ml-2" /> مراقبة العيادات
        </button>
        <button 
          onClick={() => setActiveTab('doctors')}
          className={`flex items-center px-6 py-4 rounded-2xl text-[10px] font-black transition-all ${activeTab === 'doctors' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <Stethoscope className="w-4 h-4 ml-2" /> إدارة الأطباء
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`flex items-center px-6 py-4 rounded-2xl text-[10px] font-black transition-all ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <Activity className="w-4 h-4 ml-2" /> التقارير
        </button>
      </div>

      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          {roomStatus.map(({ room, doctor, activeSchedule, waitingPatients }) => (
            <div key={room.id} className={`bg-white rounded-[2.5rem] border-2 p-8 transition-all flex flex-col min-h-[400px] relative ${room.status === 'Maintenance' ? 'border-amber-200 bg-amber-50/20' : room.status === 'Closed' ? 'border-red-100 opacity-60' : 'border-indigo-100 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${room.status === 'Active' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <DoorOpen className="w-7 h-7" />
                </div>
                <button onClick={() => handleOpenEditRoom(room, activeSchedule)} className="p-2 hover:bg-indigo-50 text-indigo-400 rounded-xl">
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              <h4 className="text-2xl font-black text-slate-800 mb-1">{room.name}</h4>
              <p className="text-xs font-bold text-slate-400 uppercase mb-4">{room.specialty}</p>
              
              <div className="flex gap-2 mb-6">
                <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${room.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : room.status === 'Maintenance' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                  {room.status === 'Active' ? 'نشطة' : room.status === 'Maintenance' ? 'صيانة' : 'مغلقة'}
                </span>
                {activeSchedule && (
                  <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-lg text-[8px] font-black uppercase">
                    {activeSchedule.startTime} - {activeSchedule.endTime}
                  </span>
                )}
              </div>
              
              {doctor && room.status === 'Active' ? (
                <div className="flex-1 flex flex-col">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 flex items-center gap-3">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-black border border-slate-100 shadow-sm">
                       {doctor.name.charAt(4)}
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase">الطبيب المسؤول</p>
                       <p className="text-sm font-black text-slate-800">{doctor.name}</p>
                     </div>
                  </div>
                  <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                    <p className="text-[10px] font-black text-slate-400 uppercase flex justify-between">قائمة الانتظار <span>{waitingPatients.length}</span></p>
                    {waitingPatients.map((v, i) => (
                      <div key={v.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl">
                        <span className="text-xs font-bold text-slate-700">{i+1}. {v.patientName}</span>
                        <span className="text-[9px] font-black text-indigo-500">{v.startTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-300 italic text-sm border-2 border-dashed border-slate-100 rounded-3xl mt-4">
                  غير مستخدمة حالياً
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Room Modal */}
      {editingRoomId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in">
            <div className="p-10">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-slate-800">إعدادات العيادة والجدول</h2>
                <button onClick={() => setEditingRoomId(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6 text-slate-400" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase border-b pb-2">بيانات الغرفة</p>
                  <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-black" value={roomEditForm.name} onChange={e => setRoomEditForm({...roomEditForm, name: e.target.value})} />
                  <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-black" value={roomEditForm.specialty} onChange={e => setRoomEditForm({...roomEditForm, specialty: e.target.value})}>
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="flex gap-2">
                    {['Active', 'Maintenance', 'Closed'].map(st => (
                      <button key={st} onClick={() => setRoomEditForm({...roomEditForm, status: st as any})} className={`flex-1 py-3 rounded-xl border-2 font-black text-[9px] ${roomEditForm.status === st ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}>
                        {st === 'Active' ? 'متاحة' : st === 'Maintenance' ? 'صيانة' : 'مغلقة'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase border-b pb-2">نوبة العمل اليوم</p>
                  <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-black" value={roomEditForm.doctorId} onChange={e => setRoomEditForm({...roomEditForm, doctorId: e.target.value})}>
                    <option value="">اختر الطبيب</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="time" className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 font-black" value={roomEditForm.startTime} onChange={e => setRoomEditForm({...roomEditForm, startTime: e.target.value})} />
                    <input type="time" className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 font-black" value={roomEditForm.endTime} onChange={e => setRoomEditForm({...roomEditForm, endTime: e.target.value})} />
                  </div>
                </div>
              </div>
              <button onClick={handleSaveRoomEdit} className="w-full mt-8 bg-indigo-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl hover:bg-black transition-all">
                <Save className="w-5 h-5" /> حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'doctors' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm max-w-4xl mx-auto overflow-hidden animate-in fade-in">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <h3 className="text-xl font-black text-slate-800">الكادر الطبي</h3>
             <button onClick={() => setShowAddDoc(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-lg flex items-center gap-2 hover:bg-black transition-all">
               <Plus className="w-4 h-4" /> إضافة طبيب
             </button>
          </div>
          <div className="divide-y divide-slate-100">
            {doctors.map(doc => (
              <div key={doc.id} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl">
                    {doc.name.charAt(4)}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-xl">{doc.name}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{doc.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                   <div className="text-left">
                     <p className="font-black text-slate-800">{doc.consultationFee.toLocaleString()} EGP</p>
                     <p className="text-[9px] text-slate-400 font-black uppercase">سعر الكشف</p>
                   </div>
                   <button onClick={() => onRemoveDoctor(doc.id)} className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                     <Trash2 className="w-6 h-6" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl p-10">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-slate-800">إضافة طبيب جديد</h2>
              <button onClick={() => setShowAddDoc(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddDoctorSubmit} className="space-y-6">
              <input required placeholder="اسم الطبيب" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-black" value={newDoctorForm.name} onChange={e => setNewDoctorForm({...newDoctorForm, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <select className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-black" value={newDoctorForm.specialty} onChange={e => setNewDoctorForm({...newDoctorForm, specialty: e.target.value})}>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="number" placeholder="سعر الكشف" className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-black" value={newDoctorForm.consultationFee} onChange={e => setNewDoctorForm({...newDoctorForm, consultationFee: Number(e.target.value)})} />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-black py-6 rounded-3xl shadow-xl hover:bg-black transition-all">تأكيد الإضافة</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <ReportsView visits={visits} doctors={doctors} patients={patients} />
      )}
    </div>
  );
};

export default AdminView;
