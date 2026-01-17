
import React, { useState } from 'react';
import { Visit, Patient, VisitStatus } from '../types';
import { 
  ClipboardList, 
  History, 
  Stethoscope, 
  User, 
  Search,
  ChevronRight,
  Save,
  FileText,
  FlaskConical,
  X,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface DoctorViewProps {
  visits: Visit[];
  patients: Patient[];
  searchTerm: string;
  onUpdateVisit: (id: string, updates: Partial<Visit>) => void;
}

const DoctorView: React.FC<DoctorViewProps> = ({ visits, patients, searchTerm, onUpdateVisit }) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [showLabModal, setShowLabModal] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Filtered queue: Only those who are ARRIVED or IN_PROGRESS
  const queue = visits
    .filter(v => v.date.startsWith(today) && (v.status === VisitStatus.ARRIVED || v.status === VisitStatus.IN_PROGRESS))
    .filter(v => {
      const patient = patients.find(p => p.id === v.patientId);
      const s = searchTerm.toLowerCase();
      return patient?.name.toLowerCase().includes(s) || patient?.id.toLowerCase().includes(s);
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const history = visits
    .filter(v => v.status === VisitStatus.COMPLETED)
    .filter(v => {
      const patient = patients.find(p => p.id === v.patientId);
      const s = searchTerm.toLowerCase();
      return patient?.name.toLowerCase().includes(s) || patient?.id.toLowerCase().includes(s);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const selectedVisit = visits.find(v => v.id === selectedVisitId);
  const selectedPatient = selectedVisit ? patients.find(p => p.id === selectedVisit.patientId) : null;

  const handleStartExam = (vId: string) => {
    setSelectedVisitId(vId);
    onUpdateVisit(vId, { status: VisitStatus.IN_PROGRESS });
    const v = visits.find(vis => vis.id === vId);
    setDiagnosis(v?.diagnosis || '');
    setPrescription(v?.prescription || '');
  };

  const handleSaveVisit = () => {
    if (selectedVisitId) {
      onUpdateVisit(selectedVisitId, {
        diagnosis,
        prescription,
        status: VisitStatus.COMPLETED
      });
      setSelectedVisitId(null);
      setDiagnosis('');
      setPrescription('');
    }
  };

  const handleOrderLab = (test: string) => {
    alert(`تم طلب الفحص: ${test}. تم إرسال التنبيه للمختبر.`);
    setShowLabModal(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[600px] arabic-font" dir="rtl">
      {/* Patient List Section */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('queue')}
            className={`flex-1 py-5 font-black text-xs flex items-center justify-center gap-2 transition-all ${activeTab === 'queue' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-400'}`}
          >
            <ClipboardList className="w-4 h-4" /> قائمة الانتظار ({queue.length})
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-5 font-black text-xs flex items-center justify-center gap-2 transition-all ${activeTab === 'history' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-400'}`}
          >
            <History className="w-4 h-4" /> السجل الطبي ({history.length})
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              placeholder="بحث في القائمة..." 
              className="w-full pr-10 pl-4 py-3 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 font-bold outline-none" 
              value={searchTerm}
              readOnly
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
          {(activeTab === 'queue' ? queue : history).map(v => {
            const patient = patients.find(p => p.id === v.patientId);
            const isWaiting = v.status === VisitStatus.ARRIVED;
            return (
              <button 
                key={v.id}
                onClick={() => handleStartExam(v.id)}
                className={`w-full p-5 text-right flex items-center hover:bg-slate-50 transition-all ${selectedVisitId === v.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ml-4 font-black ${isWaiting ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {patient?.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-800 truncate">{patient?.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${v.paymentType === 'Cash' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {v.paymentType === 'Cash' ? 'نقدي' : 'تأمين'}
                    </span>
                    <p className="text-[10px] text-slate-400 font-bold">{v.startTime}</p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 rotate-180 transition-colors ${selectedVisitId === v.id ? 'text-indigo-400' : 'text-slate-200'}`} />
              </button>
            );
          })}
          {(activeTab === 'queue' ? queue : history).length === 0 && (
            <div className="p-12 text-center text-slate-300 font-bold">
               لا يوجد مرضى حالياً
            </div>
          )}
        </div>
      </div>

      {/* Profile/Examination Section */}
      <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        {selectedVisit && selectedPatient ? (
          <>
            <div className="px-10 py-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-20 h-20 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white font-black text-3xl ml-6 shadow-xl shadow-indigo-100">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">{selectedPatient.name}</h2>
                  <div className="flex items-center gap-3 mt-1 text-slate-500 font-bold">
                     <span>{selectedPatient.age} سنة</span>
                     <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                     <span>{selectedPatient.gender === 'Male' ? 'ذكر' : 'أنثى'}</span>
                     <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                     <span className="text-xs">ID: {selectedPatient.id}</span>
                  </div>
                </div>
              </div>
              <div className="text-left" dir="ltr">
                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                  selectedVisit.status === VisitStatus.IN_PROGRESS ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {selectedVisit.status}
                </span>
                <p className="text-[10px] text-slate-400 mt-3 font-black flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3" /> {new Date(selectedVisit.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex-1 p-10 overflow-y-auto space-y-10 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <section className="space-y-4">
                  <div className="flex items-center text-slate-800 font-black text-sm uppercase tracking-widest">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 ml-3">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    التشخيص والنتائج السريرية
                  </div>
                  <textarea 
                    value={diagnosis}
                    onChange={e => setDiagnosis(e.target.value)}
                    placeholder="اكتب ملاحظات الكشف، الأعراض، والنتائج الفيزيائية هنا..."
                    className="w-full h-64 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-[2rem] p-8 focus:ring-4 focus:ring-indigo-50 transition-all resize-none text-slate-700 font-bold leading-relaxed outline-none"
                    disabled={selectedVisit.status === VisitStatus.COMPLETED}
                  />
                </section>

                <section className="space-y-4">
                  <div className="flex items-center text-slate-800 font-black text-sm uppercase tracking-widest">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 ml-3">
                      <FileText className="w-5 h-5" />
                    </div>
                    الخطة العلاجية والروشتة
                  </div>
                  <textarea 
                    value={prescription}
                    onChange={e => setPrescription(e.target.value)}
                    placeholder="الأدوية، الجرعات، التوصيات الغذائية، ومواعيد المتابعة..."
                    className="w-full h-64 bg-slate-50 border-2 border-transparent focus:border-emerald-100 rounded-[2rem] p-8 focus:ring-4 focus:ring-emerald-50 transition-all resize-none text-slate-700 font-bold leading-relaxed outline-none"
                    disabled={selectedVisit.status === VisitStatus.COMPLETED}
                  />
                </section>
              </div>
            </div>

            <div className="px-10 py-8 border-t border-slate-100 flex justify-end gap-4 bg-white">
              <button 
                onClick={() => setShowLabModal(true)}
                className="px-8 py-4 rounded-[1.25rem] border-2 border-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                طلب فحوصات / إشاعة
              </button>
              {selectedVisit.status !== VisitStatus.COMPLETED && (
                <button 
                  onClick={handleSaveVisit}
                  className="px-10 py-4 rounded-[1.25rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-black shadow-2xl shadow-indigo-100 transition-all flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> إنهاء الكشف وحفظ السجل
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-20">
            <div className="w-32 h-32 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mb-8">
              <User className="w-16 h-16" />
            </div>
            <h3 className="text-2xl font-black text-slate-400">لم يتم اختيار مريض</h3>
            <p className="text-slate-400 text-sm mt-3 text-center font-bold max-w-sm">اختر مريضاً من قائمة الانتظار للبدء في إجراء الكشف الطبي وتوثيق الحالة.</p>
          </div>
        )}
      </div>

      {/* Lab Order Modal */}
      {showLabModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-800">طلب فحوصات تشخيصية</h2>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">المختبر والأشعة</p>
                </div>
                <button onClick={() => setShowLabModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'صورة دم كاملة (CBC)', icon: FlaskConical },
                  { name: 'وظائف كبد (LFT)', icon: FlaskConical },
                  { name: 'أشعة سينية على الصدر', icon: ClipboardList },
                  { name: 'رسم قلب (ECG)', icon: Stethoscope },
                  { name: 'تحليل دهون شامل', icon: FlaskConical },
                ].map((test, i) => (
                  <button 
                    key={i}
                    onClick={() => handleOrderLab(test.name)}
                    className="w-full p-5 rounded-2xl bg-slate-50 hover:bg-indigo-600 hover:text-white border border-slate-100 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center">
                      <test.icon className="w-5 h-5 ml-4 text-slate-400 group-hover:text-white" />
                      <span className="font-bold text-sm">{test.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 rotate-180 text-slate-300 group-hover:text-white" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorView;
