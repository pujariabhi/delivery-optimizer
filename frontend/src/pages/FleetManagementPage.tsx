import React, { useEffect, useState } from 'react';
import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  CheckCircle,
  AlertTriangle,
  X,
  Gauge,
  UserCheck,
} from 'lucide-react';
import { vehiclesApi } from '../services/api';
import type { Vehicle, VehicleStatus, VehicleType } from '../types';

export const FleetManagementPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [formData, setFormData] = useState({
    registrationNumber: '',
    vehicleType: 'VAN' as VehicleType,
    capacityKg: 500.0,
    status: 'AVAILABLE' as VehicleStatus,
    driverName: '',
    currentLatitude: 12.9716,
    currentLongitude: 77.5946,
  });
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const res = await vehiclesApi.getAll();
      setVehicles(res);
    } catch (err) {
      console.error('Failed to load fleet vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingVehicle(null);
    setFormData({
      registrationNumber: `KA-0${Math.floor(1 + Math.random() * 9)}-XY-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleType: 'VAN',
      capacityKg: 500.0,
      status: 'AVAILABLE',
      driverName: '',
      currentLatitude: 12.9716,
      currentLongitude: 77.5946,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (v: Vehicle) => {
    setEditingVehicle(v);
    setFormData({
      registrationNumber: v.registrationNumber,
      vehicleType: v.vehicleType,
      capacityKg: v.capacityKg,
      status: v.status,
      driverName: v.driverName,
      currentLatitude: v.currentLatitude,
      currentLongitude: v.currentLongitude,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.registrationNumber.trim() || !formData.driverName.trim()) {
      setFormError('Registration number and driver name are required.');
      return;
    }

    try {
      const payload: any = {
        registrationNumber: formData.registrationNumber,
        vehicleType: formData.vehicleType,
        capacityKg: Number(formData.capacityKg),
        status: formData.status,
        driverName: formData.driverName,
        currentLatitude: Number(formData.currentLatitude),
        currentLongitude: Number(formData.currentLongitude),
      };

      if (editingVehicle) {
        await vehiclesApi.update(editingVehicle.id, payload);
      } else {
        await vehiclesApi.create(payload);
      }

      setModalOpen(false);
      loadVehicles();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save vehicle.');
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await vehiclesApi.updateStatus(id, status);
      loadVehicles();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this vehicle from fleet?')) {
      try {
        await vehiclesApi.delete(id);
        loadVehicles();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            Fleet Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Vehicle registration, payload weight capacities, drivers, and availability states
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          Register Vehicle
        </button>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white block">
                  {v.registrationNumber}
                </span>
                <span className="text-[11px] text-slate-500">{v.vehicleType}</span>
              </div>
              <select
                value={v.status}
                onChange={(e) => handleStatusChange(v.id, e.target.value)}
                className={`px-2 py-1 rounded text-[10px] font-bold focus:outline-none ${
                  v.status === 'AVAILABLE'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : v.status === 'ON_DELIVERY'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="ON_DELIVERY">ON_DELIVERY</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Driver</span>
                <span className="font-semibold">{v.driverName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Payload Capacity</span>
                <span className="font-semibold">{v.capacityKg} kg</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-400">Location</span>
                <span>{v.currentLatitude.toFixed(3)}, {v.currentLongitude.toFixed(3)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t dark:border-slate-800">
              <button
                onClick={() => handleOpenEditModal(v)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-amber-600 transition"
                title="Edit Vehicle"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(v.id)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 transition"
                title="Delete Vehicle"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingVehicle ? 'Edit Vehicle Profile' : 'Register New Vehicle'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Registration Number</label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  placeholder="KA-01-EA-1001"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Vehicle Type</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as VehicleType })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  >
                    <option value="VAN">VAN</option>
                    <option value="ELECTRIC_VAN">ELECTRIC_VAN</option>
                    <option value="BIKE">BIKE</option>
                    <option value="TRUCK">TRUCK</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Capacity (kg)</label>
                  <input
                    type="number"
                    step="5"
                    value={formData.capacityKg}
                    onChange={(e) => setFormData({ ...formData, capacityKg: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Driver Name</label>
                <input
                  type="text"
                  value={formData.driverName}
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.currentLatitude}
                    onChange={(e) => setFormData({ ...formData, currentLatitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.currentLongitude}
                    onChange={(e) => setFormData({ ...formData, currentLongitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as VehicleStatus })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="ON_DELIVERY">ON_DELIVERY</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
