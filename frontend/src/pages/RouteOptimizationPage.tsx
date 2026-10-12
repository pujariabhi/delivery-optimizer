import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import {
  Route,
  Play,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Save,
  Send,
  TrendingDown,
  Clock,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import { ordersApi, vehiclesApi, routesApi } from '../services/api';
import type {
  DeliveryOrder,
  Vehicle,
  RouteOptimizationResult,
  RouteObjective,
  VehicleRouteResult,
} from '../types';

// Create numbered marker icon for route stop sequence
const createNumberedIcon = (sequence: number, color: string = '#2563eb') => {
  return L.divIcon({
    className: 'numbered-stop-marker',
    html: `
      <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px; box-shadow: 0 3px 6px rgba(0,0,0,0.3); border: 2px solid white;">
        ${sequence}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const depotIcon = L.divIcon({
  className: 'custom-depot-marker',
  html: `
    <div style="background-color: #1e3a8a; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.35); border: 2px solid white; color: white; font-weight: bold; font-size: 10px;">
      DEPOT
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const ROUTE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];

export const RouteOptimizationPage: React.FC = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<number[]>([]);
  const [objective, setObjective] = useState<RouteObjective>('MINIMIZE_TIME');
  const [saveAsActive, setSaveAsActive] = useState<boolean>(true);

  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [result, setResult] = useState<RouteOptimizationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const depotPos: [number, number] = [12.9716, 77.5946];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordRes, vehRes] = await Promise.all([
        ordersApi.getPendingOrders(),
        vehiclesApi.getAvailable(),
      ]);
      setOrders(ordRes);
      setVehicles(vehRes);

      // Pre-select pending orders & vehicles
      if (ordRes.length > 0) {
        setSelectedOrderIds(ordRes.map((o) => o.id));
      }
      if (vehRes.length > 0) {
        setSelectedVehicleIds(vehRes.map((v) => v.id));
      }
    } catch (err) {
      console.error('Failed to load optimization input data:', err);
    }
  };

  const handleToggleOrder = (id: number) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleVehicle = (id: number) => {
    setSelectedVehicleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRunOptimization = async () => {
    if (selectedOrderIds.length === 0) {
      setErrorMessage('Please select at least one delivery order to optimize.');
      return;
    }
    if (selectedVehicleIds.length === 0) {
      setErrorMessage('Please select at least one available vehicle.');
      return;
    }

    setOptimizing(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await routesApi.optimize(
        selectedOrderIds,
        selectedVehicleIds,
        objective,
        saveAsActive
      );

      if (res.status === 'INFEASIBLE') {
        setErrorMessage(res.message);
        setResult(null);
      } else {
        setResult(res);
        setSuccessMessage(
          `Optimization finished in ${res.computationDurationMs} ms! Distance reduced by ${res.distanceSavedPercentage}%.`
        );
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error occurred during route optimization.');
    } finally {
      setOptimizing(false);
    }
  };

  const handleAssignFleet = async () => {
    if (!result?.routePlanId) return;
    try {
      await routesApi.assignPlan(result.routePlanId);
      setSuccessMessage('Route plan dispatched and assigned to active fleet successfully!');
    } catch (err) {
      console.error('Assignment error:', err);
    }
  };

  const handleRecalculate = async () => {
    if (!result?.routePlanId) return;
    setOptimizing(true);
    try {
      const recalculated = await routesApi.recalculate(result.routePlanId, 'Manual dispatcher re-optimization');
      setResult(recalculated);
      setSuccessMessage(`Route plan dynamically updated (v2) with latest conditions!`);
    } catch (err) {
      console.error('Recalculate error:', err);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Route className="w-5 h-5 text-blue-600" />
            Dynamic Multi-Vehicle Route Optimizer
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Capacitated VRP with Time Windows (CVRPTW), 2-Opt local search improvement, and predictive arrival ETA
          </p>
        </div>

        <button
          onClick={handleRunOptimization}
          disabled={optimizing}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/25 disabled:opacity-50 transition"
        >
          {optimizing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Play className="w-4 h-4 fill-white" />
          )}
          <span>{optimizing ? 'Computing Optimal VRP...' : 'Run Route Optimization'}</span>
        </button>
      </div>

      {/* Alert Notices */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-200">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Optimization Infeasibility Warning</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          {result?.routePlanId && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleRecalculate}
                className="px-3 py-1 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold hover:bg-slate-50 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3 text-blue-600" />
                Recalculate
              </button>
              <button
                onClick={handleAssignFleet}
                className="px-3 py-1 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700 flex items-center gap-1 shadow-sm"
              >
                <Send className="w-3 h-3" />
                Dispatch Fleet
              </button>
            </div>
          )}
        </div>
      )}

      {/* Configuration & Selection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Objective & Settings (Col 1) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Optimization Objective</h2>
          </div>

          <div className="space-y-2 text-xs">
            {[
              {
                id: 'MINIMIZE_TIME',
                label: 'Minimize Total Travel Time',
                desc: 'Considers dynamic road traffic, delays & speed limits',
              },
              {
                id: 'MINIMIZE_DISTANCE',
                label: 'Minimize Total Route Distance',
                desc: 'Reduces mileage & fuel consumption across fleet',
              },
              {
                id: 'BALANCE_WORKLOAD',
                label: 'Balance Vehicle Workload',
                desc: 'Equalizes deliveries and load evenly among vehicles',
              },
            ].map((obj) => (
              <label
                key={obj.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  objective === obj.id
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="objective"
                  value={obj.id}
                  checked={objective === obj.id}
                  onChange={(e) => setObjective(e.target.value as RouteObjective)}
                  className="mt-0.5 text-blue-600"
                />
                <div>
                  <p>{obj.label}</p>
                  <p className="text-[11px] text-slate-500 font-normal">{obj.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="pt-2 border-t dark:border-slate-800 text-xs">
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={saveAsActive}
                onChange={(e) => setSaveAsActive(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>Save & activate as active route plan upon completion</span>
            </label>
          </div>
        </div>

        {/* Vehicle Selection (Col 2) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800 mb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Fleet Vehicles ({selectedVehicleIds.length}/{vehicles.length})
            </h2>
            <button
              onClick={() =>
                setSelectedVehicleIds(
                  selectedVehicleIds.length === vehicles.length ? [] : vehicles.map((v) => v.id)
                )
              }
              className="text-[11px] text-blue-600 hover:underline font-semibold"
            >
              {selectedVehicleIds.length === vehicles.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-60 pr-1 text-xs">
            {vehicles.map((v) => (
              <label
                key={v.id}
                className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${
                  selectedVehicleIds.includes(v.id)
                    ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedVehicleIds.includes(v.id)}
                    onChange={() => handleToggleVehicle(v.id)}
                    className="rounded text-blue-600"
                  />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {v.registrationNumber}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {v.driverName} • {v.vehicleType}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {v.capacityKg} kg
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Orders Selection (Col 3) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800 mb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Pending Orders ({selectedOrderIds.length}/{orders.length})
            </h2>
            <button
              onClick={() =>
                setSelectedOrderIds(
                  selectedOrderIds.length === orders.length ? [] : orders.map((o) => o.id)
                )
              }
              className="text-[11px] text-blue-600 hover:underline font-semibold"
            >
              {selectedOrderIds.length === orders.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-60 pr-1 text-xs">
            {orders.map((ord) => (
              <label
                key={ord.id}
                className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${
                  selectedOrderIds.includes(ord.id)
                    ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedOrderIds.includes(ord.id)}
                    onChange={() => handleToggleOrder(ord.id)}
                    className="rounded text-blue-600"
                  />
                  <div>
                    <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                      {ord.orderNumber}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                      {ord.customerName} ({ord.deliveryAddress})
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                    {ord.packageWeightKg} kg
                  </span>
                  <span className="text-[9px] font-bold text-amber-600">{ord.priority}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Side-by-Side Baseline vs Optimized Comparison Metrics */}
      {result && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-500" />
            Algorithm Benchmark: Baseline vs 2-Opt Local Search
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 block">Baseline Distance</span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200">
                {(result.baselineDistanceMeters / 1000).toFixed(1)} km
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Naive Sequential Route</span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block font-semibold">
                Optimized Distance
              </span>
              <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                {(result.optimizedDistanceMeters / 1000).toFixed(1)} km
              </span>
              <span className="text-[10px] font-bold text-emerald-600 block mt-1">
                ↓ {result.distanceSavedPercentage}% saved
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 block">Baseline Duration</span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200">
                {Math.round(result.baselineDurationSeconds / 60)} mins
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Estimated baseline time</span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block font-semibold">
                Optimized Duration
              </span>
              <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                {Math.round(result.optimizedDurationSeconds / 60)} mins
              </span>
              <span className="text-[10px] font-bold text-emerald-600 block mt-1">
                ↓ {result.durationSavedPercentage}% time saved ({result.computationDurationMs} ms)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Stop Sequence & Map Visualization */}
      {result && result.vehicleRoutes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stop-by-Stop Itinerary Sequence (1 Col) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Optimized Stop Sequences
            </h2>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-[460px] pr-1 text-xs">
              {result.vehicleRoutes.map((vRoute, vIdx) => (
                <div key={vRoute.vehicleId} className="space-y-2">
                  <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2 rounded-lg font-bold">
                    <span style={{ color: ROUTE_COLORS[vIdx % ROUTE_COLORS.length] }}>
                      {vRoute.registrationNumber} ({vRoute.driverName})
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      Load: {vRoute.totalLoadKg} / {vRoute.maxCapacityKg} kg
                    </span>
                  </div>

                  <div className="space-y-2 pl-2 border-l-2 border-blue-400">
                    {vRoute.stops.map((stop) => (
                      <div
                        key={stop.orderId}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>
                            Stop #{stop.stopSequence}: {stop.orderNumber}
                          </span>
                          <span className="text-blue-600 font-mono text-[11px]">
                            {stop.estimatedArrivalTime ? new Date(stop.estimatedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">{stop.customerName} • {stop.deliveryAddress}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Leg: {(stop.distanceFromPrevMeters / 1000).toFixed(2)} km (approx {Math.round(stop.travelTimeFromPrevSeconds / 60)} mins)
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Map Visualizing Planned Stops and Polylines (2 Cols) */}
          <div className="lg:col-span-2 h-[500px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative">
            <MapContainer center={depotPos} zoom={12} scrollWheelZoom={true} className="w-full h-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Depot Marker */}
              <Marker position={depotPos} icon={depotIcon}>
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold">Central Logistics Hub (Depot)</p>
                    <p>Origin dispatch and route termination hub</p>
                  </div>
                </Popup>
              </Marker>

              {/* Render Stops & Polylines per Vehicle */}
              {result.vehicleRoutes.map((vRoute, vIdx) => {
                const color = ROUTE_COLORS[vIdx % ROUTE_COLORS.length];
                const polylinePoints: [number, number][] = vRoute.polyline.map((p) => [
                  p.latitude,
                  p.longitude,
                ]);

                return (
                  <React.Fragment key={vRoute.vehicleId}>
                    {/* Road polyline for this vehicle tour */}
                    {polylinePoints.length > 0 && (
                      <Polyline
                        positions={polylinePoints}
                        pathOptions={{ color, weight: 5, opacity: 0.85 }}
                      />
                    )}

                    {/* Delivery stop markers numbered 1, 2, 3... */}
                    {vRoute.stops.map((stop) => (
                      <Marker
                        key={stop.orderId}
                        position={[stop.latitude, stop.longitude]}
                        icon={createNumberedIcon(stop.stopSequence, color)}
                      >
                        <Popup>
                          <div className="text-xs space-y-1">
                            <p className="font-bold text-blue-900">
                              Stop #{stop.stopSequence}: {stop.orderNumber}
                            </p>
                            <p>{stop.customerName}</p>
                            <p className="text-slate-500">{stop.deliveryAddress}</p>
                            <p className="font-semibold text-emerald-700">
                              ETA:{' '}
                              {stop.estimatedArrivalTime
                                ? new Date(stop.estimatedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : '--:--'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Assigned: {vRoute.registrationNumber} ({vRoute.driverName})
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </React.Fragment>
                );
              })}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};
