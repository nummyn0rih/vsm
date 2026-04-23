import api from './axiosInstance';
import { AnalyticsSummary, AnalyticsTotal } from '../types';

export const analyticsApi = {
  summary: (from: string, to: string) =>
    api.get<AnalyticsSummary>('/analytics', { params: { from, to } }),

  total: () => api.get<AnalyticsTotal>('/analytics/total'),
};
