import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import {
  Play,
  Pause,
  Radio,
  Truck,
  MapPin,
  Clock,
  Navigation,
  Compass,
  AlertTriangle,
  RefreshCw,
  Gauge,
} from 'lucide-react';
import { trackingApi, routesApi } from '../services/api';
import type { VehicleLiveStatus, Coordinate } from '../types';
import { wsService } from '../services/websocket';

// Custom Leaflet icons using Lucide SVG templates
const createVehicleIcon = (status: string, heading: number = 0) => {
  const color = status === 'ON_DELIVERY' ? '#10b981' : '#3b82f6';
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="background-color: ${color}; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.3); border: 2px solid white; transform: rotate(${heading}deg);">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path>
          <path d="M15 18H9"></path>
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path>
          <circle cx="17" cy="18" r="2"></circle>
          <circle cx="7" cy="18" r="2"></circle>
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

const stopIcon = L.divIcon({
  className: 'custom-stop-marker',
  html: `
    <div style="background-color: #ef4444; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.25); border: 2px solid white;">
      <div style="background-color: white; width: 8px; height: 8px; border-radius: 50%;"></div>
    </div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const depotIcon = L.divIcon({
  className: 'custom-depot-marker',
  html: `
    <div style="background-color: #1e3a8a; width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.35); border: 2px solid white;">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

export const LiveTrackingPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleLiveStatus[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleLiveStatus | null>(null);
  const [activePolylines, setActivePolylines] = useState<[number, number][][]>([]);
  const [isSimRunning, setIsSimRunning] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);

  // Depot location (Bangalore Central Hub)
  const depotPosition: [number, number] = [12.9716, 77.5946];

  useEffect(() => {
    loadLiveTrackingData();

    // Subscribe to STOMP WebSocket topic for vehicle location updates
    const unsubscribeLocations = wsService.subscribe('/topic/vehicle-locations', (event) => {
      const incoming: VehicleLiveStatus[] = Array.isArray(event.payload) ? event.payload : [event.payload];
      setVehicles((prev) => {
        const map = new Map<number, VehicleLiveStatus>();
        prev.forEach((v) => map.set(v.vehicleId, v));
        incoming.forEach((v) => map.set(v.vehicleId, v));
        return Array.from(map.values());
      });
    });

    return () => {
      unsubscribeLocations();
    };
  }, []);

  const loadLiveTrackingData = async () => {
    try {
      const [vehRes, simRes, routesRes] = await Promise.all([
        trackingApi.getLiveVehicles(),
        trackingApi.getSimulationStatus(),
        routesApi.getAll(),
      ]);
      setVehicles(vehRes);
      if (vehRes.length > 0 && !selectedVehicle) {
        setSelectedVehicle(vehRes[0]);
      }
      setIsSimRunning(simRes.running);
      if (simRes.speed) setSpeed(simRes.speed);

      // Extract active route plan polylines if available
      if (routesRes && routesRes.length > 0) {
        const activePlan = routesRes.find((r: any) => r.status === 'ACTIVE') || routesRes[0];
        if (activePlan) {
          const detail = await routesApi.getById(activePlan.id);
          // If stops are present, draw polylines between depot and stops
          if (detail?.stops?.length > 0) {
            const coords: [number, number][] = [depotPosition];
            detail.stops.forEach((s: any) => {
              if (s.order) {
                coords.push([Number(s.order.latitude), Number(s.order.longitude)]);
              }
            });
            coords.push(depotPosition);
            setActivePolylines([coords]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load tracking data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSimulation = async () => {
    try {
      if (isSimRunning) {
        await trackingApi.stopSimulation();
        setIsSimRunning(false);
      } else {
        await trackingApi.startSimulation();
        setIsSimRunning(true);
      }
    } catch (err) {
      console.error('Failed to toggle simulation:', err);
    }
  };

  const changeSpeed = async (newSpeed: number) => {
    try {
      await trackingApi.setSimulationSpeed(newSpeed);
      setSpeed(newSpeed);
    } catch (err) {
      console.error('Failed to change speed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-[calc(100vh-6rem)] flex flex-col">
      {/* Top Banner & Simulator Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-600" />
            Live Fleet Tracking Map
          </h1>
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
            <Radio className="w-3 h-3 text-amber-600 animate-pulse" />
            SIMULATED GPS
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={toggleSimulation}
              className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold transition ${
                isSimRunning
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isSimRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isSimRunning ? 'Pause Sim' : 'Start Sim'}
            </button>
            <div className="flex items-center px-2 space-x-1 text-xs">
              <span className="text-slate-500 font-medium">Speed:</span>
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => changeSpeed(spd)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                    speed === spd
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={loadLiveTrackingData}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Refresh map"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Map + Side Panel Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Interactive Leaflet Map (3 Cols) */}
        <div className="lg:col-span-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative z-0">
          <MapContainer
            center={depotPosition}
            zoom={13}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Depot Hub Marker */}
            <Marker position={depotPosition} icon={depotIcon}>
              <Popup>
                <div className="text-xs">
                  <p className="font-bold text-blue-900">Central Logistics Hub (Depot)</p>
                  <p className="text-slate-600">Origin dispatch point & return station</p>
                  <p className="font-mono text-[10px] text-slate-400">12.9716 N, 77.5946 E</p>
                </div>
              </Popup>
            </Marker>

            {/* Route Polylines */}
            {activePolylines.map((poly, idx) => (
              <Polyline
                key={idx}
                positions={poly}
                pathOptions={{
                  color: '#2563eb',
                  weight: 4,
                  opacity: 0.8,
                  dashArray: '4, 8',
                }}
              />
            ))}

            {/* Vehicle Markers */}
            {vehicles.map((v) => (
              <Marker
                key={v.vehicleId}
                position={[v.latitude, v.longitude]}
                icon={createVehicleIcon(v.status, v.headingDegrees)}
                eventHandlers={{
                  click: () => setSelectedVehicle(v),
                }}
              >
                <Popup>
                  <div className="text-xs space-y-1 p-1">
                    <div className="flex items-center justify-between gap-2 border-b pb-1">
                      <span className="font-bold text-slate-900">{v.registrationNumber}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                        {v.status}
                      </span>
                    </div>
                    <p className="text-slate-600">
                      <strong>Driver:</strong> {v.driverName} ({v.vehicleType})
                    </p>
                    <p className="text-slate-600">
                      <strong>Speed:</strong> {Math.round(v.speedKmh)} km/h
                    </p>
                    {v.nextStopAddress && (
                      <p className="text-slate-600">
                        <strong>Next Stop:</strong> {v.nextStopAddress}
                      </p>
                    )}
                    <p className="text-[10px] text-amber-700 bg-amber-50 p-1 rounded font-semibold flex items-center gap-1">
                      <Radio className="w-3 h-3 text-amber-600" />
                      SIMULATED GPS FEED
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Vehicle Telemetry & Stop Details Sidebar (1 Col) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              Fleet Telemetry
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
              {vehicles.length} Units
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {vehicles.map((v) => {
              const isSelected = selectedVehicle?.vehicleId === v.vehicleId;
              return (
                <div
                  key={v.vehicleId}
                  onClick={() => setSelectedVehicle(v)}
                  className={`p-3 rounded-xl border cursor-pointer transition text-xs ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {v.registrationNumber}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        v.status === 'ON_DELIVERY'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>

                  <p className="text-slate-500 text-[11px] mb-2">{v.driverName} • {v.vehicleType}</p>

                  <div className="grid grid-cols-2 gap-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Speed</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {Math.round(v.speedKmh)} km/h
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Remaining Stops</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {v.remainingStopsCount}
                      </span>
                    </div>
                  </div>

                  {v.nextStopAddress && (
                    <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className="truncate">{v.nextStopAddress}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
