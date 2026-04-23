export interface User {
  id: number;
  username: string;
  fullName: string;
  role: 'ADMIN' | 'USER';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Vegetable {
  id: number;
  name: string;
  createdAt: string;
}

export interface Supplier {
  id: number;
  name: string;
  contactInfo?: string;
  createdAt: string;
}

export interface TransportCompany {
  id: number;
  name: string;
  contactInfo?: string;
  createdAt: string;
}

export interface Driver {
  id: number;
  fullName: string;
  phone?: string;
  createdAt: string;
}

export type ShipmentStatus = 'PLANNED' | 'IN_TRANSIT';

export interface Shipment {
  id: number;
  vegetableId: number;
  supplierId: number;
  transportCompanyId: number;
  driverId: number;
  status: ShipmentStatus;
  quantity: number;
  unit: string;
  weight?: number;
  departureDate?: string;
  arrivalDate?: string;
  notes?: string;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  vegetable: Vegetable;
  supplier: Supplier;
  transportCompany: TransportCompany;
  driver: Driver;
  createdBy: { id: number; fullName: string; username: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ShipmentFilters {
  status?: ShipmentStatus;
  vegetableId?: number;
  supplierId?: number;
  transportCompanyId?: number;
  driverId?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AnalyticsDailyPoint {
  date: string;
  count: number;
  totalWeight: number;
}

export interface AnalyticsDailyVegetablePoint {
  date: string;
  vegetable: string;
  weight: number;
  count: number;
}

export interface AnalyticsBreakdownItem {
  id: number;
  name: string;
  count: number;
  totalWeight: number;
}

export interface AnalyticsSummary {
  daily: AnalyticsDailyPoint[];
  dailyByVegetable: AnalyticsDailyVegetablePoint[];
  bySupplier: AnalyticsBreakdownItem[];
  byTransportCompany: AnalyticsBreakdownItem[];
  byDriver: AnalyticsBreakdownItem[];
}

export interface AnalyticsSupplierVegetablePoint {
  supplier: string;
  vegetable: string;
  actualKg: number;
  contractKg: number;
  count: number;
}

export interface SupplierContract {
  id: number;
  supplierId: number;
  vegetableId: number;
  volumeKg: number;
  createdAt: string;
  updatedAt: string;
  supplier: { id: number; name: string };
  vegetable: { id: number; name: string };
}

export interface AnalyticsTotal {
  bySupplierVegetable: AnalyticsSupplierVegetablePoint[];
  byTransportCompany: AnalyticsBreakdownItem[];
}

export interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  oldValues?: any;
  newValues?: any;
  userId: number;
  shipmentId?: number;
  createdAt: string;
  user: { id: number; fullName: string; username: string };
}