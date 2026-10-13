import axios from 'axios';
import type {
  DeliveryOrder,
  Vehicle,
  RouteOptimizationResult,
  TrafficScenario,
  RouteObjective,
  DashboardSummary,
  AnalyticsSummary,
  VehicleLiveStatus,
  DeliveryTrend,
  VehicleUtilization,
} from '../types';
import {
  mockOrders,
  mockVehicles,
  mockDashboardSummary,
  mockDeliveryTrends,
  mockVehicleUtilization,
  mockScenarios,
  mockAnalyticsSummary,
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 6000,
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
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

// In-memory / localStorage order cache for offline demo booking
const getLocalOrders = (): DeliveryOrder[] => {
  try {
    const saved = localStorage.getItem('delivery_demo_orders');
    return saved ? JSON.parse(saved) : mockOrders;
  } catch {
    return mockOrders;
  }
};

const saveLocalOrders = (orders: DeliveryOrder[]) => {
  localStorage.setItem('delivery_demo_orders', JSON.stringify(orders));
};

export const authApi = {
  login: async (email: string, password: string) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      return res.data;
    } catch (err) {
      console.warn('Backend unavailable, using client demo auth mode for:', email);
      // Demo fallback login
      const isAdmin = email.toLowerCase().includes('admin') || email.toLowerCase().includes('pujari');
      return {
        token: 'demo-jwt-token-' + Date.now(),
        id: isAdmin ? 1 : 2,
        name: isAdmin ? 'Admin (Abhiram Pujari)' : 'Demo Customer',
        email: email,
        role: isAdmin ? 'ROLE_ADMIN' : 'ROLE_CUSTOMER',
      };
    }
  },
  register: async (name: string, email: string, password: string) => {
    try {
      const res = await api.post('/api/auth/register', { name, email, password });
      return res.data;
    } catch {
      return {
        token: 'demo-jwt-token-' + Date.now(),
        id: 99,
        name,
        email,
        role: 'ROLE_CUSTOMER',
      };
    }
  },
  sendOtp: async (email: string) => {
    try {
      const res = await api.post('/api/auth/otp/send', { email });
      return res.data as { message: string; demoOtp: string };
    } catch {
      return {
        message: 'Demo OTP sent (Demo mode active)',
        demoOtp: '123456',
      };
    }
  },
  verifyOtp: async (email: string, otp: string) => {
    try {
      const res = await api.post('/api/auth/otp/verify', { email, otp });
      return res.data;
    } catch {
      const isAdmin = email.toLowerCase().includes('admin') || email.toLowerCase().includes('pujari');
      return {
        token: 'demo-jwt-token-' + Date.now(),
        id: isAdmin ? 1 : 2,
        name: isAdmin ? 'Admin (Abhiram Pujari)' : 'Customer',
        email: email,
        role: isAdmin ? 'ROLE_ADMIN' : 'ROLE_CUSTOMER',
      };
    }
  },
  getMe: async () => {
    try {
      const res = await api.get('/api/auth/me');
      return res.data;
    } catch {
      const saved = localStorage.getItem('delivery_user');
      return saved ? JSON.parse(saved) : null;
    }
  },
};

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    try {
      const res = await api.get('/api/dashboard/summary');
      return res.data;
    } catch {
      return mockDashboardSummary;
    }
  },
  getTrends: async (): Promise<DeliveryTrend[]> => {
    try {
      const res = await api.get('/api/dashboard/delivery-trends');
      return res.data;
    } catch {
      return mockDeliveryTrends;
    }
  },
  getUtilization: async (): Promise<VehicleUtilization[]> => {
    try {
      const res = await api.get('/api/dashboard/vehicle-utilization');
      return res.data;
    } catch {
      return mockVehicleUtilization;
    }
  },
};

export const ordersApi = {
  getOrders: async (query?: string, status?: string, priority?: string, page = 0, size = 50) => {
    try {
      const params: any = { page, size };
      if (query) params.query = query;
      if (status) params.status = status;
      if (priority) params.priority = priority;
      const res = await api.get('/api/orders', { params });
      return res.data;
    } catch {
      let filtered = [...getLocalOrders()];
      if (query) {
        filtered = filtered.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
            o.customerName.toLowerCase().includes(query.toLowerCase()) ||
            o.deliveryAddress.toLowerCase().includes(query.toLowerCase())
        );
      }
      if (status) filtered = filtered.filter((o) => o.status === status);
      if (priority) filtered = filtered.filter((o) => o.priority === priority);
      return {
        content: filtered,
        totalElements: filtered.length,
        totalPages: 1,
        number: page,
        size,
      };
    }
  },
  getPendingOrders: async (): Promise<DeliveryOrder[]> => {
    try {
      const res = await api.get('/api/orders/pending');
      return res.data;
    } catch {
      return getLocalOrders().filter((o) => o.status === 'PENDING');
    }
  },
  getOrderById: async (id: number): Promise<DeliveryOrder> => {
    try {
      const res = await api.get(`/api/orders/${id}`);
      return res.data;
    } catch {
      const found = getLocalOrders().find((o) => o.id === id);
      return found || mockOrders[0];
    }
  },
  createOrder: async (data: Partial<DeliveryOrder>): Promise<DeliveryOrder> => {
    try {
      const res = await api.post('/api/orders', data);
      return res.data;
    } catch {
      const orders = getLocalOrders();
      const newOrder: DeliveryOrder = {
        id: Date.now(),
        orderNumber: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
        customerName: data.customerName || 'Demo Customer',
        deliveryAddress: data.deliveryAddress || 'MG Road, Bengaluru',
        latitude: data.latitude || 12.9716,
        longitude: data.longitude || 77.5946,
        packageWeightKg: data.packageWeightKg || 2.5,
        priority: data.priority || 'MEDIUM',
        status: 'PENDING',
        timeWindowStart: data.timeWindowStart || '10:00',
        timeWindowEnd: data.timeWindowEnd || '12:00',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      orders.unshift(newOrder);
      saveLocalOrders(orders);
      return newOrder;
    }
  },
  updateOrder: async (id: number, data: Partial<DeliveryOrder>): Promise<DeliveryOrder> => {
    try {
      const res = await api.put(`/api/orders/${id}`, data);
      return res.data;
    } catch {
      const orders = getLocalOrders();
      const idx = orders.findIndex((o) => o.id === id);
      if (idx !== -1) {
        orders[idx] = { ...orders[idx], ...data, updatedAt: new Date().toISOString() };
        saveLocalOrders(orders);
        return orders[idx];
      }
      return mockOrders[0];
    }
  },
  updateStatus: async (id: number, status: string): Promise<DeliveryOrder> => {
    try {
      const res = await api.patch(`/api/orders/${id}/status`, { status });
      return res.data;
    } catch {
      const orders = getLocalOrders();
      const idx = orders.findIndex((o) => o.id === id);
      if (idx !== -1) {
        orders[idx].status = status as any;
        saveLocalOrders(orders);
        return orders[idx];
      }
      return mockOrders[0];
    }
  },
  deleteOrder: async (id: number) => {
    try {
      await api.delete(`/api/orders/${id}`);
    } catch {
      const orders = getLocalOrders().filter((o) => o.id !== id);
      saveLocalOrders(orders);
    }
  },
};

export const vehiclesApi = {
  getAll: async (): Promise<Vehicle[]> => {
    try {
      const res = await api.get('/api/vehicles');
      return res.data;
    } catch {
      return mockVehicles;
    }
  },
  getAvailable: async (): Promise<Vehicle[]> => {
    try {
      const res = await api.get('/api/vehicles/available');
      return res.data;
    } catch {
      return mockVehicles.filter((v) => v.status === 'AVAILABLE');
    }
  },
  getById: async (id: number): Promise<Vehicle> => {
    try {
      const res = await api.get(`/api/vehicles/${id}`);
      return res.data;
    } catch {
      return mockVehicles.find((v) => v.id === id) || mockVehicles[0];
    }
  },
  create: async (data: Partial<Vehicle>): Promise<Vehicle> => {
    try {
      const res = await api.post('/api/vehicles', data);
      return res.data;
    } catch {
      return { id: Date.now(), ...data } as Vehicle;
    }
  },
  update: async (id: number, data: Partial<Vehicle>): Promise<Vehicle> => {
    try {
      const res = await api.put(`/api/vehicles/${id}`, data);
      return res.data;
    } catch {
      return { id, ...data } as Vehicle;
    }
  },
  updateStatus: async (id: number, status: string): Promise<Vehicle> => {
    try {
      const res = await api.patch(`/api/vehicles/${id}/status`, { status });
      return res.data;
    } catch {
      return { ...mockVehicles[0], status: status as any };
    }
  },
  delete: async (id: number) => {
    try {
      await api.delete(`/api/vehicles/${id}`);
    } catch {
      // demo pass
    }
  },
};

export const routesApi = {
  optimize: async (
    orderIds: number[],
    vehicleIds: number[],
    objective: RouteObjective,
    saveAsActivePlan = false
  ): Promise<RouteOptimizationResult> => {
    try {
      const res = await api.post('/api/routes/optimize', {
        orderIds,
        vehicleIds,
        objective,
        saveAsActivePlan,
      });
      return res.data;
    } catch {
      return {
        id: 101,
        name: 'AI Dynamic Route Plan #' + Math.floor(100 + Math.random() * 900),
        status: 'ACTIVE',
        optimizationObjective: objective,
        totalDistanceMeters: 28400,
        totalDurationSeconds: 3120,
        baselineDistanceMeters: 36900,
        baselineDurationSeconds: 4200,
        distanceSavedMeters: 8500,
        timeSavedSeconds: 1080,
        fuelSavedLiters: 1.85,
        co2SavedKg: 4.25,
        computationDurationMs: 184,
        totalOrdersCount: orderIds.length || 6,
        assignedVehiclesCount: vehicleIds.length || 2,
        vehicleRoutes: [
          {
            vehicleId: 1,
            vehicleRegistrationNumber: 'KA-01-EA-1001',
            driverName: 'Suresh Kumar',
            vehicleType: 'VAN',
            totalDistanceMeters: 14200,
            totalDurationSeconds: 1560,
            totalWeightKg: 12.5,
            stopsCount: 3,
            stops: [
              {
                stopSequence: 1,
                orderId: 1,
                orderNumber: 'ORD-2026-1001',
                customerName: 'Ananya Deshmukh',
                deliveryAddress: 'Indiranagar 100ft Road',
                latitude: 12.9719,
                longitude: 77.6412,
                packageWeightKg: 4.5,
                estimatedArrival: '10:15',
                estimatedDeparture: '10:25',
                distanceFromPrevMeters: 4200,
                durationFromPrevSeconds: 480,
                status: 'DELIVERED',
              },
              {
                stopSequence: 2,
                orderId: 2,
                orderNumber: 'ORD-2026-1002',
                customerName: 'Rahul Sharma',
                deliveryAddress: 'Koramangala 4th Block',
                latitude: 12.9352,
                longitude: 77.6245,
                packageWeightKg: 2.1,
                estimatedArrival: '10:45',
                estimatedDeparture: '10:55',
                distanceFromPrevMeters: 5100,
                durationFromPrevSeconds: 580,
                status: 'IN_TRANSIT',
              },
            ],
          },
        ],
        createdAt: new Date().toISOString(),
      };
    }
  },
  getAll: async () => {
    try {
      const res = await api.get('/api/routes');
      return res.data;
    } catch {
      return [];
    }
  },
  getById: async (id: number) => {
    try {
      const res = await api.get(`/api/routes/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },
  assignPlan: async (id: number) => {
    try {
      const res = await api.post(`/api/routes/${id}/assign`);
      return res.data;
    } catch {
      return { success: true };
    }
  },
  recalculate: async (id: number, reason?: string): Promise<RouteOptimizationResult> => {
    try {
      const res = await api.post(`/api/routes/${id}/recalculate`, { reason });
      return res.data;
    } catch {
      return routesApi.optimize([1, 2], [1], 'BALANCED');
    }
  },
  getComparison: async (id: number) => {
    try {
      const res = await api.get(`/api/routes/${id}/comparison`);
      return res.data;
    } catch {
      return null;
    }
  },
};

export const trackingApi = {
  getLiveVehicles: async (): Promise<VehicleLiveStatus[]> => {
    try {
      const res = await api.get('/api/tracking/vehicles');
      return res.data;
    } catch {
      return [
        {
          vehicleId: 1,
          registrationNumber: 'KA-01-EA-1001',
          vehicleType: 'VAN',
          driverName: 'Suresh Kumar',
          latitude: 12.9716,
          longitude: 77.5946,
          speedKmh: 38.5,
          heading: 85,
          batteryOrFuelPercent: 78,
          currentLoadKg: 380,
          capacityKg: 500,
          status: 'IN_TRANSIT',
          currentAddress: 'MG Road Junction, Bengaluru',
          activeOrderId: 1,
          activeOrderNumber: 'ORD-2026-1001',
          etaMinutes: 12,
          lastUpdated: new Date().toISOString(),
        },
        {
          vehicleId: 2,
          registrationNumber: 'KA-01-MJ-2045',
          vehicleType: 'ELECTRIC_VAN',
          driverName: 'Deepak Rao',
          latitude: 12.9279,
          longitude: 77.6271,
          speedKmh: 42.0,
          heading: 140,
          batteryOrFuelPercent: 92,
          currentLoadKg: 290,
          capacityKg: 400,
          status: 'AVAILABLE',
          currentAddress: 'Silk Board flyover, Bengaluru',
          etaMinutes: 24,
          lastUpdated: new Date().toISOString(),
        },
      ];
    }
  },
  getHistory: async (id: number, limit = 50) => {
    try {
      const res = await api.get(`/api/tracking/vehicles/${id}/history?limit=${limit}`);
      return res.data;
    } catch {
      return [];
    }
  },
  startSimulation: async () => {
    try {
      const res = await api.post('/api/simulation/start');
      return res.data;
    } catch {
      return { status: 'RUNNING' };
    }
  },
  stopSimulation: async () => {
    try {
      const res = await api.post('/api/simulation/stop');
      return res.data;
    } catch {
      return { status: 'STOPPED' };
    }
  },
  getSimulationStatus: async () => {
    try {
      const res = await api.get('/api/simulation/status');
      return res.data;
    } catch {
      return { running: true, speedMultiplier: 1.0 };
    }
  },
  setSimulationSpeed: async (speed: number) => {
    try {
      const res = await api.post('/api/simulation/speed', { speed });
      return res.data;
    } catch {
      return { speed };
    }
  },
};

export const trafficApi = {
  getScenarios: async (): Promise<TrafficScenario[]> => {
    try {
      const res = await api.get('/api/traffic/scenarios');
      return res.data;
    } catch {
      return mockScenarios;
    }
  },
  getActive: async (): Promise<TrafficScenario> => {
    try {
      const res = await api.get('/api/traffic/active');
      return res.data;
    } catch {
      return mockScenarios[0];
    }
  },
  activateScenario: async (id: number): Promise<TrafficScenario> => {
    try {
      const res = await api.patch(`/api/traffic/scenarios/${id}/activate`);
      return res.data;
    } catch {
      return mockScenarios.find((s) => s.id === id) || mockScenarios[0];
    }
  },
};

export const analyticsApi = {
  getSummary: async (): Promise<AnalyticsSummary> => {
    try {
      const res = await api.get('/api/analytics/summary');
      return res.data;
    } catch {
      return mockAnalyticsSummary;
    }
  },
  getOptimizationRuns: async (page = 0, size = 15) => {
    try {
      const res = await api.get(`/api/analytics/optimization-runs?page=${page}&size=${size}`);
      return res.data;
    } catch {
      return { content: [], totalElements: 0, totalPages: 1 };
    }
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
    try {
      const res = await api.get('/api/settings/config');
      return res.data;
    } catch {
      return {};
    }
  },
  updateConfig: async (data: any) => {
    try {
      const res = await api.post('/api/settings/config', data);
      return res.data;
    } catch {
      return data;
    }
  },
  resetData: async () => {
    try {
      const res = await api.post('/api/settings/reset-data');
      return res.data;
    } catch {
      return { success: true };
    }
  },
};
