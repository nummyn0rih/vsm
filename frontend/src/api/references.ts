import api from './axiosInstance';
import { Vegetable, Supplier, TransportCompany, Driver } from '../types';

export const referencesApi = {
  // Овощи
  getVegetables: () => api.get<Vegetable[]>('/references/vegetables'),
  createVegetable: (data: { name: string }) =>
    api.post<Vegetable>('/references/vegetables', data),
  updateVegetable: (id: number, data: { name: string }) =>
    api.put<Vegetable>(`/references/vegetables/${id}`, data),
  deleteVegetable: (id: number) =>
    api.delete(`/references/vegetables/${id}`),

  // Поставщики
  getSuppliers: () => api.get<Supplier[]>('/references/suppliers'),
  createSupplier: (data: { name: string; contactInfo?: string }) =>
    api.post<Supplier>('/references/suppliers', data),
  updateSupplier: (id: number, data: { name: string; contactInfo?: string }) =>
    api.put<Supplier>(`/references/suppliers/${id}`, data),
  deleteSupplier: (id: number) =>
    api.delete(`/references/suppliers/${id}`),

  // Транспортные компании
  getTransportCompanies: () =>
    api.get<TransportCompany[]>('/references/transport-companies'),
  createTransportCompany: (data: { name: string; contactInfo?: string }) =>
    api.post<TransportCompany>('/references/transport-companies', data),
  updateTransportCompany: (id: number, data: { name: string; contactInfo?: string }) =>
    api.put<TransportCompany>(`/references/transport-companies/${id}`, data),
  deleteTransportCompany: (id: number) =>
    api.delete(`/references/transport-companies/${id}`),

  // Водители
  getDrivers: () => api.get<Driver[]>('/references/drivers'),
  createDriver: (data: { fullName: string; phone?: string }) =>
    api.post<Driver>('/references/drivers', data),
  updateDriver: (id: number, data: { fullName: string; phone?: string }) =>
    api.put<Driver>(`/references/drivers/${id}`, data),
  deleteDriver: (id: number) =>
    api.delete(`/references/drivers/${id}`),
};