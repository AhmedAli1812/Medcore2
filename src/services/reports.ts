import api from './api';

export type ReportItem = {
  id: string;
  title?: string;
  createdAt?: string;
  ownerId?: string;
  [key: string]: any;
};

/**
 * Fetch reports aggregated / filtered by doctor.
 * Backend query params are forwarded from `query`.
 * Example endpoints expected: GET /api/reports/doctors?doctorId=...&scope=...
 */
export async function fetchDoctorReports(doctorId?: string, query: Record<string, any> = {}) {
  const params = { ...query };
  if (doctorId) params.doctorId = doctorId;
  const resp = await api.get<ReportItem[]>('/reports/doctors', { params });
  return resp.data;
}

/**
 * Fetch reports aggregated / filtered by specialty.
 * Example: GET /api/reports/specialties?specialty=...&scope=...
 */
export async function fetchSpecialtyReports(specialty?: string, query: Record<string, any> = {}) {
  const params = { ...query };
  if (specialty) params.specialty = specialty;
  const resp = await api.get<ReportItem[]>('/reports/specialties', { params });
  return resp.data;
}

/**
 * Fetch reports aggregated / filtered by company/insurance.
 * Example: GET /api/reports/companies?companyId=...&scope=...
 */
export async function fetchCompanyReports(companyId?: string, query: Record<string, any> = {}) {
  const params = { ...query };
  if (companyId) params.companyId = companyId;
  const resp = await api.get<ReportItem[]>('/reports/companies', { params });
  return resp.data;
}

/**
 * Generic reports fetch if you need a fallback.
 * GET /api/reports?scope=...
 */
export async function fetchReports(query: Record<string, any> = {}) {
  const resp = await api.get<ReportItem[]>('/reports', { params: query });
  return resp.data;
}

export default {
  fetchDoctorReports,
  fetchSpecialtyReports,
  fetchCompanyReports,
  fetchReports,
};