import type {
  DeliveryOrder,
  Vehicle,
  RouteOptimizationResult,
  TrafficScenario,
  DashboardSummary,
  AnalyticsSummary,
  VehicleLiveStatus,
  DeliveryTrend,
  VehicleUtilization
} from '../types';

export const mockOrders: DeliveryOrder[] = [
  {
    id: 1,
    orderNumber: 'ORD-2026-1001',
    customerName: 'Ananya Deshmukh',
    deliveryAddress: 'Indiranagar 100ft Road, Bengaluru',
    latitude: 12.9719,
    longitude: 77.6412,
    packageWeightKg: 4.5,
    priority: 'HIGH',
    status: 'IN_TRANSIT',
    assignedVehicleId: 1,
    timeWindowStart: '10:00',
    timeWindowEnd: '12:00',
    createdAt: '2026-10-13T09:00:00Z',
    updatedAt: '2026-10-13T10:30:00Z'
  },
  {
    id: 2,
    orderNumber: 'ORD-2026-1002',
    customerName: 'Rahul Sharma',
    deliveryAddress: 'Koramangala 4th Block, Bengaluru',
    latitude: 12.9352,
    longitude: 77.6245,
    packageWeightKg: 2.1,
    priority: 'MEDIUM',
    status: 'DELIVERED',
    assignedVehicleId: 1,
    timeWindowStart: '11:00',
    timeWindowEnd: '13:00',
    createdAt: '2026-10-13T09:15:00Z',
    updatedAt: '2026-10-13T11:45:00Z'
  },
  {
    id: 3,
    orderNumber: 'ORD-2026-1003',
    customerName: 'Pooja Hegde',
    deliveryAddress: 'Whitefield Main Road, Bengaluru',
    latitude: 12.9698,
    longitude: 77.7500,
    packageWeightKg: 8.0,
    priority: 'CRITICAL',
    status: 'PENDING',
    assignedVehicleId: undefined,
    timeWindowStart: '14:00',
    timeWindowEnd: '16:00',
    createdAt: '2026-10-13T10:00:00Z',
    updatedAt: '2026-10-13T10:00:00Z'
  },
  {
    id: 4,
    orderNumber: 'ORD-2026-1004',
    customerName: 'Arjun Varma',
    deliveryAddress: 'HSR Layout Sector 2, Bengaluru',
    latitude: 12.9116,
    longitude: 77.6389,
    packageWeightKg: 1.5,
    priority: 'LOW',
    status: 'OPTIMIZED',
    assignedVehicleId: 2,
    timeWindowStart: '15:00',
    timeWindowEnd: '17:00',
    createdAt: '2026-10-13T10:30:00Z',
    updatedAt: '2026-10-13T11:00:00Z'
  }
];

export const mockVehicles: Vehicle[] = [
  {
    id: 1,
    registrationNumber: 'KA-01-EA-1001',
    vehicleType: 'VAN',
    capacityKg: 500.0,
    status: 'IN_TRANSIT',
    driverName: 'Suresh Kumar',
    currentLatitude: 12.9716,
    currentLongitude: 77.5946,
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-13T10:00:00Z'
  },
  {
    id: 2,
    registrationNumber: 'KA-01-MJ-2045',
    vehicleType: 'ELECTRIC_VAN',
    capacityKg: 400.0,
    status: 'AVAILABLE',
    driverName: 'Deepak Rao',
    currentLatitude: 12.9279,
    currentLongitude: 77.6271,
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-13T10:00:00Z'
  },
  {
    id: 3,
    registrationNumber: 'KA-05-TR-3390',
    vehicleType: 'TWO_WHEELER',
    capacityKg: 30.0,
    status: 'AVAILABLE',
    driverName: 'Manjunath B',
    currentLatitude: 12.9854,
    currentLongitude: 77.6056,
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-13T10:00:00Z'
  }
];

export const mockDashboardSummary: DashboardSummary = {
  totalOrders: 48,
  pendingOrders: 14,
  inTransitOrders: 8,
  deliveredOrders: 26,
  activeVehicles: 5,
  totalVehicles: 8,
  fleetUtilizationRate: 72.5,
  onTimeDeliveryRate: 94.2,
  averageDeliveryTimeMinutes: 28.4,
  totalDistanceSavedKm: 142.8,
  carbonEmissionSavedKg: 38.6
};

export const mockDeliveryTrends: DeliveryTrend[] = [
  { date: 'Mon', completed: 18, pending: 4, delayed: 1 },
  { date: 'Tue', completed: 24, pending: 3, delayed: 0 },
  { date: 'Wed', completed: 31, pending: 5, delayed: 2 },
  { date: 'Thu', completed: 28, pending: 2, delayed: 1 },
  { date: 'Fri', completed: 35, pending: 6, delayed: 0 },
  { date: 'Sat', completed: 42, pending: 7, delayed: 3 },
  { date: 'Sun', completed: 22, pending: 2, delayed: 0 }
];

export const mockVehicleUtilization: VehicleUtilization[] = [
  { vehicleId: 1, registrationNumber: 'KA-01-EA-1001', vehicleType: 'VAN', capacityKg: 500, currentLoadKg: 380, utilizationPercentage: 76.0, assignedOrdersCount: 8, status: 'IN_TRANSIT' },
  { vehicleId: 2, registrationNumber: 'KA-01-MJ-2045', vehicleType: 'ELECTRIC_VAN', capacityKg: 400, currentLoadKg: 290, utilizationPercentage: 72.5, assignedOrdersCount: 6, status: 'AVAILABLE' },
  { vehicleId: 3, registrationNumber: 'KA-05-TR-3390', vehicleType: 'TWO_WHEELER', capacityKg: 30, currentLoadKg: 24, utilizationPercentage: 80.0, assignedOrdersCount: 4, status: 'AVAILABLE' }
];

export const mockScenarios: TrafficScenario[] = [
  { id: 1, name: 'Normal Traffic Flow', description: 'Typical baseline traffic conditions', congestionLevel: 'LOW', speedMultiplier: 1.0, active: true },
  { id: 2, name: 'Peak Evening Congestion', description: 'Heavy stop-and-go along outer ring road', congestionLevel: 'HIGH', speedMultiplier: 0.55, active: false },
  { id: 3, name: 'Monsoon Rain Impact', description: 'Waterlogging and reduced road capacity', congestionLevel: 'SEVERE', speedMultiplier: 0.40, active: false }
];

export const mockAnalyticsSummary: AnalyticsSummary = {
  totalOptimizationsRun: 154,
  averageComputationTimeMs: 245,
  totalDistanceOptimizedKm: 1840.5,
  totalDurationSavedHours: 68.2,
  averageImprovementPercentage: 24.8,
  algorithmType: 'Hybrid VRP with Google OR-Tools + Simulated Annealing'
};
