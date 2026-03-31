import api from './axiosInstance';
import { AuditLog, PaginatedResponse } from '../types';

export const logsApi = {
  getAll: (params?: {
    entityType?: string;
    action?: string;
    userId?: number;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  }) => api.get<PaginatedResponse<AuditLog>>('/logs', { params }),
};