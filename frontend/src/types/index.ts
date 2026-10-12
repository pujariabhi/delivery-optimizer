export type VehicleStatus = 'AVAILABLE' | 'ON_DELIVERY' | 'MAINTENANCE' | 'INACTIVE';
export type VehicleType = 'VAN' | 'BIKE' | 'TRUCK' | 'ELECTRIC_VAN';
export type OrderStatus = 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
export type OrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type RouteObjective = 'MINIMIZE_TIME' | 'MINIMIZE_DISTANCE' | 'BALANCE_WORKLOAD';
export type TrafficType = 'NORMAL' | 'LOW' | 'MODERATE' | 'HEAVY' | 'ROAD_CLOSURE';
export type OptimizationResultStatus = 'SUCCESS' | 'INFEASIBLE' | 'FAILED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface DeliveryOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  deliveryAddress: string;
  latitude: number;
  longitude: number;
  packageWeightKg: number;
  priority: OrderPriority;
  timeWindowStart?: string;
  timeWindowEnd?: string;
  status: OrderStatus;
  assignedVehicleId?: number;
  assignedVehicleRegistration?: string;
  estimatedArrivalTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: number;
  registrationNumber: string;
  vehicleType: VehicleType;
  capacityKg: number;
  status: VehicleStatus;
  driverName: string;
  currentLatitude: number;
  currentLongitude: number;
  createdAt: string;
  updatedAt: string;
}

export interface RouteStop {
  id: number;
  orderId: number;
  orderNumber: string;
  customerName: string;
  deliveryAddress: string;
  latitude: number;
  longitude: number;
  packageWeightKg: number;
  priority: OrderPriority;
  timeWindowStart?: string;
  timeWindowEnd?: string;
  stopSequence: number;
  estimatedArrivalTime?: string;
  actualArrivalTime?: string;
  status: 'PENDING' | 'ARRIVED' | 'DELIVERED' | 'FAILED';
  distanceFromPrevMeters: number;
  travelTimeFromPrevSeconds: number;
}

export interface VehicleRouteResult {
  vehicleId: number;
  registrationNumber: string;
  driverName: string;
  vehicleType: string;
  totalLoadKg: number;
  maxCapacityKg: number;
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  stops: RouteStop[];
  polyline: Coordinate[];
}

export interface RouteOptimizationResult {
  routePlanId?: number;
  name: string;
  objective: RouteObjective;
  status: OptimizationResultStatus;
  message: string;
  baselineDistanceMeters: number;
  baselineDurationSeconds: number;
  optimizedDistanceMeters: number;
  optimizedDurationSeconds: number;
  distanceSavedPercentage: number;
  durationSavedPercentage: number;
  computationDurationMs: number;
  vehicleRoutes: VehicleRouteResult[];
  baselineRoutes: VehicleRouteResult[];
}

export interface VehicleLiveStatus {
  vehicleId: number;
  registrationNumber: string;
  driverName: string;
  vehicleType: string;
  status: VehicleStatus;
  latitude: number;
  longitude: number;
  speedKmh: number;
  headingDegrees: number;
  sourceType: 'SIMULATED' | 'GPS';
  nextStopAddress?: string;
  nextStopCustomer?: string;
  estimatedArrivalTime?: string;
  remainingStopsCount: number;
  remainingDistanceMeters: number;
  lastPingTime: string;
}

export interface TrafficScenario {
  id: number;
  name: string;
  scenarioType: TrafficType;
  configurationJson: string;
  active: boolean;
  createdAt: string;
}

export interface DashboardSummary {
  totalOrders: number;
  pendingOrders: number;
  inTransitOrders: number;
  completedDeliveries: number;
  activeVehicles: number;
  totalVehicles: number;
  averageDeliveryTimeMinutes: number;
  totalPlannedDistanceKm: number;
  onTimeDeliveryPercentage: number;
}

export interface DeliveryTrend {
  dateLabel: string;
  totalOrders: number;
  completedOrders: number;
  onTimeOrders: number;
  avgCompletionTimeMinutes: number;
}

export interface VehicleUtilization {
  vehicleId: number;
  registrationNumber: string;
  driverName: string;
  vehicleType: string;
  capacityKg: number;
  currentAssignedLoadKg: number;
  utilizationPercentage: number;
  assignedStopsCount: number;
  status: string;
}

export interface AnalyticsSummary {
  totalPlannedDistanceMeters: number;
  totalEstimatedTravelTimeSeconds: number;
  totalDistanceSavedMeters: number;
  totalDurationSavedSeconds: number;
  distanceSavedPercentage: number;
  durationSavedPercentage: number;
  avgComputationDurationMs: number;
  onTimeDeliveryRate: number;
  avgVehicleUtilizationPercentage: number;
  deliveryCompletionRate: number;
  etaMaeMinutes: number;
  etaRmseMinutes: number;
  totalOptimizationRuns: number;
}

export interface OptimizationRun {
  id: number;
  algorithmName: string;
  inputOrderCount: number;
  inputVehicleCount: number;
  baselineDistanceMeters: number;
  optimizedDistanceMeters: number;
  baselineDurationSeconds: number;
  optimizedDurationSeconds: number;
  computationDurationMs: number;
  resultStatus: OptimizationResultStatus;
  createdAt: string;
}

export interface WebSocketEvent<T = any> {
  id: string;
  eventType: string;
  timestamp: string;
  payload: T;
}
