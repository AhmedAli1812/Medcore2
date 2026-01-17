
import { Doctor, InsuranceCompany, Patient, Visit, Clinic, SubscriptionPlan, Room, Schedule } from '../types';

export const INITIAL_ROOMS: Room[] = [
  { id: 'r1', name: 'عيادة القلب (1)', specialty: 'Cardiology', status: 'Active' },
  { id: 'r2', name: 'عيادة الأطفال (1)', specialty: 'Pediatrics', status: 'Active' },
  { id: 'r3', name: 'عيادة العظام (1)', specialty: 'Orthopedics', status: 'Active' },
  { id: 'r4', name: 'عيادة الجراحة (1)', specialty: 'Surgery', status: 'Active' },
  { id: 'r5', name: 'عيادة العيون (1)', specialty: 'Ophthalmology', status: 'Active' },
  { id: 'r6', name: 'عيادة الباطنة (1)', specialty: 'Internal Medicine', status: 'Active' },
  { id: 'r7', name: 'عيادة الجلدية (1)', specialty: 'Dermatology', status: 'Active' },
  { id: 'r8', name: 'عيادة الأسنان (1)', specialty: 'Dentistry', status: 'Active' },
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const INITIAL_DOCTORS: Doctor[] = [
  { id: 'd1', name: 'د. أحمد سالم', specialty: 'Cardiology', consultationFee: 450, roomNumber: 'r1' },
  { id: 'd2', name: 'د. سارة حسن', specialty: 'Pediatrics', consultationFee: 350, roomNumber: 'r2' },
  { id: 'd3', name: 'د. محمد علي', specialty: 'Orthopedics', consultationFee: 550, roomNumber: 'r3' },
  { id: 'd4', name: 'د. محمود شاكر', specialty: 'Surgery', consultationFee: 700, roomNumber: 'r4' },
  { id: 'd5', name: 'د. ليلى يوسف', specialty: 'Ophthalmology', consultationFee: 400, roomNumber: 'r5' },
  { id: 'd6', name: 'د. هاني رمزي', specialty: 'Internal Medicine', consultationFee: 300, roomNumber: 'r6' },
  { id: 'd7', name: 'د. مريم إبراهيم', specialty: 'Dermatology', consultationFee: 450, roomNumber: 'r7' },
  { id: 'd8', name: 'د. عمر خالد', specialty: 'Dentistry', consultationFee: 500, roomNumber: 'r8' },
  { id: 'd9', name: 'د. رانيا يحيى', specialty: 'Gynecology', consultationFee: 600, roomNumber: 'r1' },
  { id: 'd10', name: 'د. ياسر جلال', specialty: 'Neurology', consultationFee: 800, roomNumber: 'r2' },
];

// Generate schedules for all doctors across all days
export const INITIAL_SCHEDULES: Schedule[] = INITIAL_DOCTORS.flatMap((doc, index) => 
  days.map(day => ({
    id: `s-${doc.id}-${day}`,
    doctorId: doc.id,
    dayOfWeek: day,
    startTime: '09:00',
    endTime: '21:00',
    roomId: doc.roomNumber
  }))
);

export const INITIAL_CLINICS: Clinic[] = [
  { id: 'C-001', name: 'مركز ميد كور الطبي', ownerName: 'د. طارق فوزي', email: 'tarek@medcore.com', plan: SubscriptionPlan.PRO, status: 'Active', joinedDate: '2023-01-15', nextBillingDate: '2024-05-15', monthlyFee: 1500, totalVisits: 12450 },
];

export const INITIAL_COMPANIES: InsuranceCompany[] = [
  { id: 'c1', name: 'بوبا العالمية (Bupa)', defaultCoveragePercent: 80, totalDue: 15000, totalPaid: 9000 },
  { id: 'c2', name: 'أكسا للتأمين (AXA)', defaultCoveragePercent: 90, totalDue: 9500, totalPaid: 3000 },
  { id: 'c3', name: 'مصر للتأمين', defaultCoveragePercent: 75, totalDue: 5000, totalPaid: 1000 },
  { id: 'c4', name: 'نيو جيزة للتأمين', defaultCoveragePercent: 85, totalDue: 2000, totalPaid: 0 },
];

export const INITIAL_PATIENTS: Patient[] = [
  { id: 'P-2024-001', name: 'يحيى زكريا', phone: '01012345678', age: 29, gender: 'Male', createdAt: '2024-01-01' },
  { id: 'P-2024-002', name: 'آمال محمود', phone: '01198765432', age: 45, gender: 'Female', insuranceCompanyId: 'c1', policyNumber: 'POL-AX77', createdAt: '2024-01-05' },
  { id: 'P-2024-003', name: 'سعد زغلول', phone: '01234567890', age: 60, gender: 'Male', insuranceCompanyId: 'c2', policyNumber: 'POL-MSR-1', createdAt: '2024-02-10' },
  { id: 'P-2024-003', name: 'أحمد محمد', phone: '01036569748', age: 32, gender: 'Male', insuranceCompanyId: 'c2', policyNumber: 'POL-MSR-2', createdAt: '2026-01-16' },
];

export const INITIAL_VISITS: Visit[] = [];
