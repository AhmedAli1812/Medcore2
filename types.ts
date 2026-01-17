export enum UserRole {
  RECEPTION = 'Reception',
  DOCTOR = 'Doctor',
  ACCOUNTANT = 'Accountant',
  INSURANCE_MANAGER = 'Insurance Manager',
  ADMIN = 'Admin',
  SUPER_ADMIN = 'Super Admin'
}

export enum SubscriptionPlan {
  BASIC = 'Basic',
  PRO = 'Pro',
  ENTERPRISE = 'Enterprise'
}

export enum VisitStatus {
  SCHEDULED = 'Scheduled',
  ARRIVED = 'Arrived',
  IN_PROGRESS = 'In-Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  NO_SHOW = 'No-Show'
}

export interface Room {
  id: string;
  name: string;
  specialty: string;
  status: 'Active' | 'Maintenance' | 'Closed';
}

export interface Schedule {
  id: string;
  doctorId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  roomId: string;
}

export interface Clinic {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  plan: SubscriptionPlan;
  status: 'Active' | 'Suspended';
  joinedDate: string;
  nextBillingDate: string;
  monthlyFee: number;
  totalVisits: number;
}

export type PaymentType = 'Cash' | 'Insurance';

export interface InsuranceCompany {
  id: string;
  name: string;
  defaultCoveragePercent: number;
  totalDue: number;
  totalPaid: number;
  serviceList?: string[];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  consultationFee: number;
  roomNumber: string;
}

export interface Service {
  id: string;
  name: string;
  // Either target a specific doctor or a specialty or leave both undefined to mean global service
  doctorId?: string;
  specialty?: string;
  price: number;
  active: boolean;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female';
  nationalId?: string;
  insuranceCompanyId?: string;
  policyNumber?: string;
  insuranceCategory?: string;
  createdAt: string;
  totalPaid?: number;
  outstandingDebt?: number;
}

export interface Visit {
  id: string;
  patientId: string;
  doctorId: string;
  roomId: string;
  date: string;
  startTime: string;
  visitNumber: number;
  paymentType: PaymentType;
  totalAmount: number;
  insurancePay: number;
  patientCash: number;
  status: VisitStatus;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  arrivedAt?: string;
  serviceId?: string;
  insuranceCategory?: string;
  // Fix: Added insuranceCompanyId to Visit interface to resolve property access errors in InsuranceManagerView
  insuranceCompanyId?: string;
}

export type Period = 'daily' | 'weekly' | 'monthly';

export type DoctorReport = {
  doctorName: string;
  visits: number;
  revenue: number;
};

export type SpecialtyReport = {
  specialty: string;
  visits: number;
  revenue: number;
};

export type CompanyReport = {
  companyId: string;
  companyName: string;
  visits: number;
  revenue: number;
  totalPaid: number;
  totalDue: number;
};
