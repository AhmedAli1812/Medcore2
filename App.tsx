
import React, { useState, useEffect } from 'react';
import { UserRole, Patient, Doctor, InsuranceCompany, Visit, Clinic, Room, Schedule } from './types';
import { INITIAL_DOCTORS, INITIAL_COMPANIES, INITIAL_PATIENTS, INITIAL_VISITS, INITIAL_CLINICS, INITIAL_ROOMS, INITIAL_SCHEDULES } from './store/mockData';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import ReceptionView from './views/ReceptionView';
import DoctorView from './views/DoctorView';
import InsuranceManagerView from './views/InsuranceManagerView';
import AccountantView from './views/AccountantView';
import AdminView from './views/AdminView';
import SuperAdminView from './views/SuperAdminView';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('medcore_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });
  
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const saved = localStorage.getItem('medcore_doctors');
    return saved ? JSON.parse(saved) : INITIAL_DOCTORS;
  });
  
  const [companies, setCompanies] = useState<InsuranceCompany[]>(() => {
    const saved = localStorage.getItem('medcore_companies');
    return saved ? JSON.parse(saved) : INITIAL_COMPANIES;
  });
  
  const [visits, setVisits] = useState<Visit[]>(() => {
    const saved = localStorage.getItem('medcore_visits');
    return saved ? JSON.parse(saved) : INITIAL_VISITS;
  });
  
  const [clinics, setClinics] = useState<Clinic[]>(() => {
    const saved = localStorage.getItem('medcore_clinics');
    return saved ? JSON.parse(saved) : INITIAL_CLINICS;
  });
  
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('medcore_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });
  
  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    const saved = localStorage.getItem('medcore_schedules');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
  });

  useEffect(() => { localStorage.setItem('medcore_patients', JSON.stringify(patients)); }, [patients]);
  useEffect(() => { localStorage.setItem('medcore_doctors', JSON.stringify(doctors)); }, [doctors]);
  useEffect(() => { localStorage.setItem('medcore_companies', JSON.stringify(companies)); }, [companies]);
  useEffect(() => { localStorage.setItem('medcore_visits', JSON.stringify(visits)); }, [visits]);
  useEffect(() => { localStorage.setItem('medcore_clinics', JSON.stringify(clinics)); }, [clinics]);
  useEffect(() => { localStorage.setItem('medcore_rooms', JSON.stringify(rooms)); }, [rooms]);
  useEffect(() => { localStorage.setItem('medcore_schedules', JSON.stringify(schedules)); }, [schedules]);

  const addPatient = (patient: Patient) => setPatients(prev => [patient, ...prev]);
  const addVisit = (visit: Visit) => setVisits(prev => [visit, ...prev]);
  
  const updateVisit = (visitId: string, updates: Partial<Visit>) => {
    setVisits(prev => prev.map(v => v.id === visitId ? { ...v, ...updates } : v));
  };
  
  const addDoctor = (doc: Doctor) => setDoctors(prev => [...prev, doc]);
  const removeDoctor = (id: string) => setDoctors(prev => prev.filter(d => d.id !== id));
  const addCompany = (comp: InsuranceCompany) => setCompanies(prev => [...prev, comp]);
  const removeCompany = (id: string) => setCompanies(prev => prev.filter(c => c.id !== id));
  const updateClinic = (id: string, updates: Partial<Clinic>) => {
    setClinics(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };
  const updateSchedule = (newSchedules: Schedule[]) => setSchedules(newSchedules);
  const updateRoom = (roomId: string, updates: Partial<Room>) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, ...updates } : r));
  };

  const handleLogin = (username: string, password: string) => {
    // Simple authentication logic - in a real app, this would be more secure
    if (username === 'admin' && password === 'password123') {
      setRole(UserRole.ADMIN);
      setIsLoggedIn(true);
    } else if (username === 'doctor' && password === 'doc123') {
      setRole(UserRole.DOCTOR);
      setIsLoggedIn(true);
    } else if (username === 'reception' && password === 'rec123') {
      setRole(UserRole.RECEPTION);
      setIsLoggedIn(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setRole(null);
    setIsLoggedIn(false);
  };

  const logout = () => {
    handleLogout();
  };

  if (!isLoggedIn || !role) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (role) {
      case UserRole.RECEPTION:
        return <ReceptionView
          patients={patients}
          doctors={doctors}
          companies={companies}
          visits={visits}
          rooms={rooms}
          schedules={schedules}
          searchTerm={searchTerm}
          onAddPatient={addPatient}
          onAddVisit={addVisit}
          onUpdateVisit={updateVisit}
        />;
      case UserRole.DOCTOR:
        return <DoctorView
          visits={visits}
          patients={patients}
          searchTerm={searchTerm}
          onUpdateVisit={updateVisit}
        />;
      case UserRole.INSURANCE_MANAGER:
        return <InsuranceManagerView
          companies={companies}
          visits={visits}
          patients={patients}
          doctors={doctors}
        />;
      case UserRole.ACCOUNTANT:
        return <AccountantView
          visits={visits}
          doctors={doctors}
          searchTerm={searchTerm}
        />;
      case UserRole.ADMIN:
        return <AdminView
          patients={patients}
          doctors={doctors}
          companies={companies}
          visits={visits}
          rooms={rooms}
          schedules={schedules}
          searchTerm={searchTerm}
          onAddDoctor={addDoctor}
          onRemoveDoctor={removeDoctor}
          onAddCompany={addCompany}
          onRemoveCompany={removeCompany}
          onUpdateVisit={updateVisit}
          onUpdateSchedule={updateSchedule}
          onUpdateRoom={updateRoom}
        />;
      case UserRole.SUPER_ADMIN:
        return <SuperAdminView
          clinics={clinics}
          onUpdateClinic={updateClinic}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <Sidebar currentRole={role!} onRoleChange={setRole} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header currentRole={role!} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onLogout={logout} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
