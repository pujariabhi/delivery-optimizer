import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  Package,
  Search,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  LogOut,
  Navigation,
  ShieldCheck,
  Calendar,
  Weight,
  User,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ordersApi, trackingApi } from '../services/api';
import type { DeliveryOrder, VehicleLiveStatus, OrderPriority } from '../types';

// Custom Map Markers
const customerDestIcon = L.divIcon({
  className: 'custom-dest-marker',
  html: `
    <div style="background-color: #ef4444; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4); border: 2px solid white;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const deliveryTruckIcon = L.divIcon({
  className: 'custom-truck-marker',
  html: `
    <div style="background-color: #3b82f6; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.5); border: 2px solid white;">
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

export const CustomerPortalPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Active view tab
  const [activeTab, setActiveTab] = useState<'track' | 'book'>('track');

  // Orders list
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [searchTrackingId, setSearchTrackingId] = useState<string>('');
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [vehicles, setVehicles] = useState<VehicleLiveStatus[]>([]);

  // Booking Form State
  const [recipientName, setRecipientName] = useState<string>(user?.name || '');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('Indiranagar 100ft Road, Bangalore');
  const [packageWeight, setPackageWeight] = useState<number>(3.5);
  const [priority, setPriority] = useState<OrderPriority>('HIGH');
  const [timeWindowStart, setTimeWindowStart] = useState<string>('10:00');
  const [timeWindowEnd, setTimeWindowEnd] = useState<string>('14:00');
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<string>('');
  const [bookingError, setBookingError] = useState<string>('');

  useEffect(() => {
    loadCustomerOrders();
    loadLiveVehicles();
    const interval = setInterval(loadLiveVehicles, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadCustomerOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await ordersApi.getOrders('', undefined, undefined, 0, 50);
      const allOrders: DeliveryOrder[] = res.content || [];
      setOrders(allOrders);
      if (allOrders.length > 0 && !selectedOrder) {
        setSelectedOrder(allOrders[0]);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadLiveVehicles = async () => {
    try {
      const live = await trackingApi.getLiveVehicles();
      setVehicles(live);
    } catch (err) {
      // Backend maybe offline
    }
  };

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTrackingId.trim()) return;
    const found = orders.find(
      (o) =>
        o.orderNumber.toLowerCase() === searchTrackingId.trim().toLowerCase() ||
        o.customerName.toLowerCase().includes(searchTrackingId.trim().toLowerCase())
    );
    if (found) {
      setSelectedOrder(found);
      setActiveTab('track');
    } else {
      alert(`No active order found with tracking number "${searchTrackingId}"`);
    }
  };

  const handleBookOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingSuccess('');
    setBookingError('');

    try {
      // Generate realistic coordinate near Bangalore center for demonstration
      const baseLat = 12.9716;
      const baseLng = 77.5946;
      const offsetLat = (Math.random() - 0.5) * 0.08;
      const offsetLng = (Math.random() - 0.5) * 0.08;

      const newOrderPayload = {
        customerName: recipientName || 'Customer',
        deliveryAddress: deliveryAddress,
        latitude: parseFloat((baseLat + offsetLat).toFixed(6)),
        longitude: parseFloat((baseLng + offsetLng).toFixed(6)),
        packageWeightKg: packageWeight,
        priority: priority,
        timeWindowStart: timeWindowStart,
        timeWindowEnd: timeWindowEnd,
        status: 'PENDING' as const,
      };

      const created = await ordersApi.createOrder(newOrderPayload as any);
      setBookingSuccess(`Order #${created.orderNumber} placed successfully! Route optimization will schedule it shortly.`);
      await loadCustomerOrders();
      setSelectedOrder(created);
      setActiveTab('track');
    } catch (err: any) {
      setBookingError(err.response?.data?.message || 'Failed to submit order. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Find assigned vehicle if order is in transit or assigned
  const assignedVehicle = selectedOrder?.assignedVehicleRegistration
    ? vehicles.find((v) => v.registrationNumber === selectedOrder.assignedVehicleRegistration)
    : vehicles[0];

  // Helper to determine status progress step (1 to 4)
  const getStatusStep = (status?: string) => {
    switch (status) {
      case 'PENDING':
        return 1;
      case 'ASSIGNED':
        return 2;
      case 'IN_TRANSIT':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = getStatusStep(selectedOrder?.status);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Customer Navigation Bar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base text-white tracking-wide flex items-center gap-2">
              OptiDeliver <span className="text-blue-400 font-semibold text-xs sm:text-sm">Customer Portal</span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Real-Time Package Tracking & Dispatch
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {/* User Profile Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-[11px]">
              {user?.name ? user.name[0].toUpperCase() : 'C'}
            </div>
            <div className="text-left hidden md:block">
              <p className="font-semibold text-white leading-tight">{user?.name || 'Customer'}</p>
              <p className="text-[10px] text-slate-400 leading-tight">{user?.email || 'customer@delivery.com'}</p>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
              Customer
            </span>
          </div>

          {/* Switch to Admin link */}
          <button
            onClick={() => navigate('/login')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Admin Portal</span>
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 transition border border-rose-800/80"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('track')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'track'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Track Deliveries</span>
            </button>
            <button
              onClick={() => setActiveTab('book')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'book'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book New Delivery</span>
            </button>
          </div>

          {/* Quick Tracking Search Form */}
          <form onSubmit={handleSearchOrder} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchTrackingId}
                onChange={(e) => setSearchTrackingId(e.target.value)}
                placeholder="Search Tracking ID (e.g. ORD-8410)..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-sm"
            >
              Search
            </button>
          </form>
        </div>

        {/* TAB 1: TRACK DELIVERIES */}
        {activeTab === 'track' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Live Status & Details */}
            <div className="lg:col-span-1 space-y-6">
              {/* Selected Order Summary Card */}
              {selectedOrder ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Tracking Number</span>
                      <h2 className="text-lg font-bold text-blue-400 font-mono">{selectedOrder.orderNumber}</h2>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                        selectedOrder.status === 'DELIVERED'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          : selectedOrder.status === 'IN_TRANSIT'
                          ? 'bg-blue-950/80 text-blue-300 border-blue-800 animate-pulse'
                          : selectedOrder.status === 'ASSIGNED'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {selectedOrder.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* 4-Step Progress Tracker */}
                  <div className="py-2">
                    <p className="text-xs font-semibold text-slate-300 mb-3">Delivery Progress</p>
                    <div className="relative flex items-center justify-between">
                      {/* Progress Line */}
                      <div className="absolute top-3.5 left-3 right-3 h-0.5 bg-slate-800 -z-0">
                        <div
                          className="h-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                        ></div>
                      </div>

                      {/* Step 1 */}
                      <div className="flex flex-col items-center z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            currentStep >= 1 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/50' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          ✓
                        </div>
                        <span className="text-[10px] mt-1 text-slate-400 font-medium">Placed</span>
                      </div>

                      {/* Step 2 */}
                      <div className="flex flex-col items-center z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            currentStep >= 2 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/50' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {currentStep >= 2 ? '✓' : '2'}
                        </div>
                        <span className="text-[10px] mt-1 text-slate-400 font-medium">Assigned</span>
                      </div>

                      {/* Step 3 */}
                      <div className="flex flex-col items-center z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            currentStep >= 3 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/50' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {currentStep >= 3 ? '✓' : '3'}
                        </div>
                        <span className="text-[10px] mt-1 text-slate-400 font-medium">In Transit</span>
                      </div>

                      {/* Step 4 */}
                      <div className="flex flex-col items-center z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            currentStep >= 4 ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/50' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {currentStep >= 4 ? '✓' : '4'}
                        </div>
                        <span className="text-[10px] mt-1 text-slate-400 font-medium">Delivered</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery ETA & Driver Card */}
                  <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        Estimated Arrival
                      </span>
                      <span className="font-semibold text-emerald-400">
                        {selectedOrder.estimatedArrivalTime || 'Within 25 mins'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-amber-400" />
                        Assigned Vehicle
                      </span>
                      <span className="font-medium text-slate-200">
                        {selectedOrder.assignedVehicleRegistration || assignedVehicle?.registrationNumber || 'KA-01-EA-1001'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-purple-400" />
                        Courier Driver
                      </span>
                      <span className="font-medium text-slate-200">
                        {assignedVehicle?.driverName || 'Rahul Sharma'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Weight className="w-3.5 h-3.5 text-indigo-400" />
                        Package Weight
                      </span>
                      <span className="font-medium text-slate-200">
                        {selectedOrder.packageWeightKg} kg
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        Destination Address
                      </span>
                      <p className="font-medium text-slate-200 pl-5 text-[11px] leading-relaxed">
                        {selectedOrder.deliveryAddress}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
                  Select an order from the list below to view tracking.
                </div>
              )}

              {/* Order Selection List */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-xs text-slate-300 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-blue-400" />
                    Available Deliveries ({orders.length})
                  </h3>
                  <button
                    onClick={loadCustomerOrders}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Refresh orders"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      onClick={() => setSelectedOrder(o)}
                      className={`p-3 rounded-xl border cursor-pointer transition text-xs ${
                        selectedOrder?.id === o.id
                          ? 'bg-blue-950/40 border-blue-500/60 shadow-sm'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold font-mono text-blue-400">{o.orderNumber}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {o.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] truncate">{o.deliveryAddress}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Live Geospatial Map */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col space-y-3 min-h-[460px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-400" />
                  <h3 className="font-bold text-xs sm:text-sm text-white">Live Courier Location & Delivery Path</h3>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Courier Vehicle
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Destination
                  </span>
                </div>
              </div>

              {/* Map Container */}
              <div className="flex-1 w-full rounded-xl overflow-hidden border border-slate-800 relative min-h-[380px]">
                <MapContainer
                  center={[
                    selectedOrder?.latitude || 12.9716,
                    selectedOrder?.longitude || 77.5946,
                  ]}
                  zoom={13}
                  className="w-full h-full"
                  style={{ minHeight: '380px' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />

                  {/* Customer Destination Marker */}
                  {selectedOrder && (
                    <Marker
                      position={[selectedOrder.latitude, selectedOrder.longitude]}
                      icon={customerDestIcon}
                    >
                      <Popup>
                        <div className="text-slate-900 text-xs">
                          <p className="font-bold text-rose-600">Your Delivery Address</p>
                          <p>{selectedOrder.deliveryAddress}</p>
                          <p className="text-[10px] text-slate-500 mt-1">Recipient: {selectedOrder.customerName}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Active Delivery Courier Marker */}
                  {assignedVehicle && (
                    <Marker
                      position={[assignedVehicle.latitude, assignedVehicle.longitude]}
                      icon={deliveryTruckIcon}
                    >
                      <Popup>
                        <div className="text-slate-900 text-xs">
                          <p className="font-bold text-blue-600">Active Delivery Vehicle</p>
                          <p>Driver: {assignedVehicle.driverName}</p>
                          <p>Registration: {assignedVehicle.registrationNumber}</p>
                          <p className="text-emerald-600 font-semibold mt-1">Speed: {assignedVehicle.speedKmh.toFixed(0)} km/h</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOOK NEW DELIVERY ORDER */}
        {activeTab === 'book' && (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-500" />
                Book a New Last-Mile Delivery
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your shipment details. Our VRP optimization engine will assign the nearest vehicle and compute the fastest traffic-aware route.
              </p>
            </div>

            {bookingSuccess && (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{bookingSuccess}</span>
              </div>
            )}

            {bookingError && (
              <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleBookOrder} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Recipient Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Recipient Full Name"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Delivery Address (Indiranagar / Koramangala / HSR)</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Street Address, City"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Package Weight (kg)</label>
                  <div className="relative">
                    <Weight className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="1000"
                      value={packageWeight}
                      onChange={(e) => setPackageWeight(parseFloat(e.target.value) || 1)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Delivery Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as OrderPriority)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH (Standard Delivery)</option>
                    <option value="URGENT">URGENT (Express)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Time Window Start</label>
                  <input
                    type="time"
                    value={timeWindowStart}
                    onChange={(e) => setTimeWindowStart(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Time Window End</label>
                  <input
                    type="time"
                    value={timeWindowEnd}
                    onChange={(e) => setTimeWindowEnd(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {bookingLoading ? (
                  <span>Scheduling Order...</span>
                ) : (
                  <>
                    <span>Confirm & Dispatch Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
