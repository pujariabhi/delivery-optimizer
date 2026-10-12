import React, { useEffect, useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  MapPin,
  Clock,
  AlertCircle,
  X,
  CheckCircle2,
} from 'lucide-react';
import { ordersApi, vehiclesApi } from '../services/api';
import type { DeliveryOrder, OrderPriority, OrderStatus, Vehicle } from '../types';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);
  const [editingOrder, setEditingOrder] = useState<DeliveryOrder | null>(null);
  const [viewingOrder, setViewingOrder] = useState<DeliveryOrder | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    orderNumber: '',
    customerName: '',
    deliveryAddress: '',
    latitude: 12.9716,
    longitude: 77.5946,
    packageWeightKg: 5.0,
    priority: 'MEDIUM' as OrderPriority,
    timeWindowStart: '09:00',
    timeWindowEnd: '13:00',
    status: 'PENDING' as OrderStatus,
    assignedVehicleId: '',
  });
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    loadOrders();
    vehiclesApi.getAll().then(setVehicles).catch(console.error);
  }, [searchQuery, statusFilter, priorityFilter, page]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersApi.getOrders(
        searchQuery || undefined,
        statusFilter || undefined,
        priorityFilter || undefined,
        page,
        15
      );
      setOrders(res.content || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to load delivery orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingOrder(null);
    setFormData({
      orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: '',
      deliveryAddress: '',
      latitude: 12.9750,
      longitude: 77.6090,
      packageWeightKg: 5.0,
      priority: 'MEDIUM',
      timeWindowStart: '10:00',
      timeWindowEnd: '14:00',
      status: 'PENDING',
      assignedVehicleId: '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (ord: DeliveryOrder) => {
    setEditingOrder(ord);
    setFormData({
      orderNumber: ord.orderNumber,
      customerName: ord.customerName,
      deliveryAddress: ord.deliveryAddress,
      latitude: ord.latitude,
      longitude: ord.longitude,
      packageWeightKg: ord.packageWeightKg,
      priority: ord.priority,
      timeWindowStart: ord.timeWindowStart || '09:00',
      timeWindowEnd: ord.timeWindowEnd || '13:00',
      status: ord.status,
      assignedVehicleId: ord.assignedVehicleId ? String(ord.assignedVehicleId) : '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.deliveryAddress.trim()) {
      setFormError('Customer name and delivery address are required.');
      return;
    }
    if (formData.latitude < -90 || formData.latitude > 90 || formData.longitude < -180 || formData.longitude > 180) {
      setFormError('Invalid geographic coordinates (Latitude: -90..90, Longitude: -180..180)');
      return;
    }

    try {
      const payload: any = {
        orderNumber: formData.orderNumber,
        customerName: formData.customerName,
        deliveryAddress: formData.deliveryAddress,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        packageWeightKg: Number(formData.packageWeightKg),
        priority: formData.priority,
        timeWindowStart: formData.timeWindowStart,
        timeWindowEnd: formData.timeWindowEnd,
        status: formData.status,
        assignedVehicleId: formData.assignedVehicleId ? Number(formData.assignedVehicleId) : null,
      };

      if (editingOrder) {
        await ordersApi.updateOrder(editingOrder.id, payload);
      } else {
        await ordersApi.createOrder(payload);
      }

      setModalOpen(false);
      loadOrders();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save delivery order.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this delivery order?')) {
      try {
        await ordersApi.deleteOrder(id);
        loadOrders();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await ordersApi.updateStatus(id, status);
      loadOrders();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Delivery Orders
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage customer orders, package payloads, delivery time windows, and coordinates
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          Create Order
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search order #, customer, address..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_TRANSIT">IN_TRANSIT</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">Coordinates</th>
                <th className="py-3 px-4">Weight</th>
                <th className="py-3 px-4">Time Window</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Loading delivery orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No delivery orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {ord.customerName}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 truncate max-w-xs">
                      {ord.deliveryAddress}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {ord.latitude.toFixed(4)}, {ord.longitude.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {ord.packageWeightKg} kg
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {ord.timeWindowStart || '--:--'} - {ord.timeWindowEnd || '--:--'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ord.priority === 'URGENT'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : ord.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {ord.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold focus:outline-none ${
                          ord.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : ord.status === 'IN_TRANSIT'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : ord.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="ASSIGNED">ASSIGNED</option>
                        <option value="IN_TRANSIT">IN_TRANSIT</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setViewingOrder(ord);
                          setDetailsModalOpen(true);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(ord)}
                        className="p-1 rounded text-slate-400 hover:text-amber-600 transition"
                        title="Edit Order"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ord.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Page {page + 1} of {totalPages}</span>
          <div className="space-x-1.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit Order Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingOrder ? 'Edit Delivery Order' : 'Create New Delivery Order'}
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

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Order #</label>
                  <input
                    type="text"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Customer Name</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Delivery Address</label>
                <input
                  type="text"
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  placeholder="e.g. 100ft Road, Indiranagar, Bangalore"
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
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Package Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.packageWeightKg}
                    onChange={(e) => setFormData({ ...formData, packageWeightKg: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as OrderPriority })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Time Window Start</label>
                  <input
                    type="time"
                    value={formData.timeWindowStart}
                    onChange={(e) => setFormData({ ...formData, timeWindowStart: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Time Window End</label>
                  <input
                    type="time"
                    value={formData.timeWindowEnd}
                    onChange={(e) => setFormData({ ...formData, timeWindowEnd: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-sm transition"
                >
                  Save Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {detailsModalOpen && viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Order Details: {viewingOrder.orderNumber}
              </h2>
              <button onClick={() => setDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <p><strong>Customer:</strong> {viewingOrder.customerName}</p>
              <p><strong>Address:</strong> {viewingOrder.deliveryAddress}</p>
              <p><strong>Coordinates:</strong> {viewingOrder.latitude}, {viewingOrder.longitude}</p>
              <p><strong>Package Weight:</strong> {viewingOrder.packageWeightKg} kg</p>
              <p><strong>Priority:</strong> {viewingOrder.priority}</p>
              <p><strong>Time Window:</strong> {viewingOrder.timeWindowStart} - {viewingOrder.timeWindowEnd}</p>
              <p><strong>Status:</strong> {viewingOrder.status}</p>
              <p><strong>Assigned Vehicle:</strong> {viewingOrder.assignedVehicleRegistration || 'None'}</p>
              <p><strong>Created:</strong> {new Date(viewingOrder.createdAt).toLocaleString()}</p>
            </div>

            <div className="flex justify-end pt-3 border-t dark:border-slate-800">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
