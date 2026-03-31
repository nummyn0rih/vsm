import api from './axiosInstance';
import { Shipment, PaginatedResponse, ShipmentFilters, ShipmentStatus } from '../types';

export const shipmentsApi = {
  getAll: (filters?: ShipmentFilters) =>
    api.get<PaginatedResponse<Shipment>>('/shipments', { params: filters }),

  getById: (id: number) =>
    api.get<Shipment>(`/shipments/${id}`),

  create: (data: Partial<Shipment>) =>
    api.post<Shipment>('/shipments', data),

  update: (id: number, data: Partial<Shipment>) =>
    api.put<Shipment>(`/shipments/${id}`, data),

  updateStatus: (id: number, status: ShipmentStatus) =>
    api.patch<Shipment>(`/shipments/${id}/status`, { status }),

  delete: (id: number) =>
    api.delete(`/shipments/${id}`),
};