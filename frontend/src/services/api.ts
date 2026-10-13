import axios from 'axios';
import type {
  DashboardSummary,
  DeliveryTrend,
  VehicleUtilization,
  DeliveryOrder,
  Vehicle,
  RouteOptimizationResult,
  TrafficScenario,
  AnalyticsSummary,
  OptimizationRun,
  VehicleLiveStatus,
  RouteObjective,
  User,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('delivery_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional: redirect to login or clear token
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    return res.data;
  },
  register: async (name: string, email: string, password: string) => {
    const res = await api.post('/api/auth/register', { name, email, password });
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/api/auth/me');
    return res.data;
  },
};

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const res = await api.get('/api/dashboard/summary');
    return res.data;
  },
  getTrends: async (): Promise<DeliveryTrend[]> => {
    const res = await api.get('/api/dashboard/delivery-trends');
    return res.data;
  },
  getUtilization: async (): Promise<VehicleUtilization[]> => {
    const res = await api.get('/api/dashboard/vehicle-utilization');
    return res.data;
  },
};

export const ordersApi = {
  getOrders: async (query?: string, status?: string, priority?: string, page = 0, size = 50) => {
    const params: any = { page, size };
    if (query) params.query = query;
    if (status) params.status = status;
    if (priority) params.priority = priority;
    const res = await api.get('/api/orders', { params });
    return res.data;
  },
  getPendingOrders: async (): Promise<DeliveryOrder[]> => {
    const res = await api.get('/api/orders/pending');
    return res.data;
  },
  getOrderById: async (id: number): Promise<DeliveryOrder> => {
    const res = await api.get(`/api/orders/${id}`);
    return res.data;
  },
  createOrder: async (data: Partial<DeliveryOrder>): Promise<DeliveryOrder> => {
    const res = await api.post('/api/orders', data);
    return res.data;
  },
  updateOrder: async (id: number, data: Partial<DeliveryOrder>): Promise<DeliveryOrder> => {
    const res = await api.put(`/api/orders/${id}`, data);
    return res.data;
  },
  updateStatus: async (id: number, status: string): Promise<DeliveryOrder> => {
    const res = await api.patch(`/api/orders/${id}/status`, { status });
    return res.data;
  },
  deleteOrder: async (id: number) => {
    await api.delete(`/api/orders/${id}`);
  },
};

export const vehiclesApi = {
  getAll: async (): Promise<Vehicle[]> => {
    const res = await api.get('/api/vehicles');
    return res.data;
  },
  getAvailable: async (): Promise<Vehicle[]> => {
    const res = await api.get('/api/vehicles/available');
    return res.data;
  },
  getById: async (id: number): Promise<Vehicle> => {
    const res = await api.get(`/api/vehicles/${id}`);
    return res.data;
  },
  create: async (data: Partial<Vehicle>): Promise<Vehicle> => {
    const res = await api.post('/api/vehicles', data);
    return res.data;
  },
  update: async (id: number, data: Partial<Vehicle>): Promise<Vehicle> => {
    const res = await api.put(`/api/vehicles/${id}`, data);
    return res.data;
  },
  updateStatus: async (id: number, status: string): Promise<Vehicle> => {
    const res = await api.patch(`/api/vehicles/${id}/status`, { status });
    return res.data;
  },
  delete: async (id: number) => {
    await api.delete(`/api/vehicles/${id}`);
  },
};

export const routesApi = {
  optimize: async (
    orderIds: number[],
    vehicleIds: number[],
    objective: RouteObjective,
    saveAsActivePlan = false
  ): Promise<RouteOptimizationResult> => {
    const res = await api.post('/api/routes/optimize', {
      orderIds,
      vehicleIds,
      objective,
      saveAsActivePlan,
    });
    return res.data;
  },
  getAll: async () => {
    const res = await api.get('/api/routes');
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get(`/api/routes/${id}`);
    return res.data;
  },
  assignPlan: async (id: number) => {
    const res = await api.post(`/api/routes/${id}/assign`);
    return res.data;
  },
  recalculate: async (id: number, reason?: string): Promise<RouteOptimizationResult> => {
    const res = await api.post(`/api/routes/${id}/recalculate`, { reason });
    return res.data;
  },
  getComparison: async (id: number) => {
    const res = await api.get(`/api/routes/${id}/comparison`);
    return res.data;
  },
};

export const trackingApi = {
  getLiveVehicles: async (): Promise<VehicleLiveStatus[]> => {
    const res = await api.get('/api/tracking/vehicles');
    return res.data;
  },
  getHistory: async (id: number, limit = 50) => {
    const res = await api.get(`/api/tracking/vehicles/${id}/history?limit=${limit}`);
    return res.data;
  },
  startSimulation: async () => {
    const res = await api.post('/api/simulation/start');
    return res.data;
  },
  stopSimulation: async () => {
    const res = await api.post('/api/simulation/stop');
    return res.data;
  },
  getSimulationStatus: async () => {
    const res = await api.get('/api/simulation/status');
    return res.data;
  },
  setSimulationSpeed: async (speed: number) => {
    const res = await api.post('/api/simulation/speed', { speed });
    return res.data;
  },
};

export const trafficApi = {
  getScenarios: async (): Promise<TrafficScenario[]> => {
    const res = await api.get('/api/traffic/scenarios');
    return res.data;
  },
  getActive: async (): Promise<TrafficScenario> => {
    const res = await api.get('/api/traffic/active');
    return res.data;
  },
  activateScenario: async (id: number): Promise<TrafficScenario> => {
    const res = await api.patch(`/api/traffic/scenarios/${id}/activate`);
    return res.data;
  },
};

export const analyticsApi = {
  getSummary: async (): Promise<AnalyticsSummary> => {
    const res = await api.get('/api/analytics/summary');
    return res.data;
  },
  getOptimizationRuns: async (page = 0, size = 15) => {
    const res = await api.get(`/api/analytics/optimization-runs?page=${page}&size=${size}`);
    return res.data;
  },
};

export const reportsApi = {
  downloadOrdersCsv: () => {
    window.open(`${API_BASE_URL}/api/reports/orders.csv`, '_blank');
  },
  downloadRoutesCsv: () => {
    window.open(`${API_BASE_URL}/api/reports/routes.csv`, '_blank');
  },
};

export const settingsApi = {
  getConfig: async () => {
    const res = await api.get('/api/settings/config');
    return res.data;
  },
  updateConfig: async (data: any) => {
    const res = await api.post('/api/settings/config', data);
    return res.data;
  },
  resetData: async () => {
    const res = await api.post('/api/settings/reset-data');
    return res.data;
  },
};
