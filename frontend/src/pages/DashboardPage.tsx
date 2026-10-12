import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  Clock,
  MapPin,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Plus,
  Route,
  Activity,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { dashboardApi, ordersApi } from '../services/api';
import type { DashboardSummary, DeliveryTrend, VehicleUtilization, DeliveryOrder } from '../types';
import { wsService } from '../services/websocket';

const STATUS_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<DeliveryTrend[]>([]);
  const [utilization, setUtilization] = useState<VehicleUtilization[]>([]);
  const [recentOrders, setRecentOrders] = useState<DeliveryOrder[]>([]);
  const [activityFeed, setActivityFeed] = useState<string[]>([
    'System initialized with Bangalore Central Logistics Hub (Depot)',
    'Dynamic CVRPTW solver initialized with 2-Opt heuristic',
  ]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDashboardData();

    // Listen to real-time events via WebSocket
    const unsubOrders = wsService.subscribe('/topic/order-updates', (event) => {
      setActivityFeed((prev) => [
        `[${new Date().toLocaleTimeString()}] Order Event: ${typeof event.payload === 'string' ? event.payload : (event.payload?.orderNumber || 'Updated')}`,
        ...prev.slice(0, 7),
      ]);
      loadDashboardData();
    });

    const unsubRoutes = wsService.subscribe('/topic/route-updates', (event) => {
      setActivityFeed((prev) => [
        `[${new Date().toLocaleTimeString()}] Route Re-optimization triggered: Plan #${event.payload}`,
        ...prev.slice(0, 7),
      ]);
      loadDashboardData();
    });

    const unsubTraffic = wsService.subscribe('/topic/traffic-updates', (event) => {
      setActivityFeed((prev) => [
        `[${new Date().toLocaleTimeString()}] Traffic Alert: Scenario "${event.payload?.name}" activated`,
        ...prev.slice(0, 7),
      ]);
    });

    return () => {
      unsubOrders();
      unsubRoutes();
      unsubTraffic();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const [sumRes, trendRes, utilRes, ordersRes] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getTrends(),
        dashboardApi.getUtilization(),
        ordersApi.getOrders(undefined, undefined, undefined, 0, 5),
      ]);
      setSummary(sumRes);
      setTrends(trendRes);
      setUtilization(utilRes);
      setRecentOrders(ordersRes.content || []);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statusPieData = summary
    ? [
        { name: 'Pending', value: summary.pendingOrders },
        { name: 'In Transit', value: summary.inTransitOrders },
        { name: 'Delivered', value: summary.completedDeliveries },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            Delivery Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time multi-stop last-mile route optimization & predictive arrival tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            New Order
          </button>
          <button
            onClick={() => navigate('/routes')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition"
          >
            <Route className="w-3.5 h-3.5" />
            Optimize Routes
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Orders</span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {summary?.totalOrders ?? 0}
            </span>
            <span className="text-[11px] text-amber-600 font-medium">
              {summary?.pendingOrders ?? 0} pending
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Fleet Active</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {summary?.activeVehicles ?? 0} / {summary?.totalVehicles ?? 0}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">On delivery</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Average ETA</span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {summary?.averageDeliveryTimeMinutes ?? 28}m
            </span>
            <span className="text-[11px] text-slate-500 font-medium">per stop</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">On-Time Rate</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {summary?.onTimeDeliveryPercentage ?? 95}%
            </span>
            <span className="text-[11px] text-slate-500 font-medium">SLA fulfilled</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Delivery Trend (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Delivery Volume & Completed Trends</h2>
              <p className="text-[11px] text-slate-500">Historical daily completed orders over past 7 days</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="dateLabel" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Area type="monotone" dataKey="totalOrders" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTotal)" name="Total" />
                <Area type="monotone" dataKey="completedOrders" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" name="Completed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Breakdown Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Order Status Distribution</h2>
          <p className="text-[11px] text-slate-500 mb-4">Current state breakdown</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4}>
                  {statusPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fleet Capacity & Live Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Utilization Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Vehicle Payload Utilization (%)</h2>
              <p className="text-[11px] text-slate-500">Weight load vs maximum vehicle capacity in kg</p>
            </div>
            <button
              onClick={() => navigate('/fleet')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              Manage Fleet <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilization} barSize={28}>
                <XAxis dataKey="registrationNumber" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  formatter={(value: any) => [`${value}%`, 'Utilization']}
                />
                <Bar dataKey="utilizationPercentage" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Activity & WebSocket Feed */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
              Live Activity Feed
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">STOMP/WS</span>
          </div>
          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-56 pr-1">
            {activityFeed.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 leading-snug"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Delivery Orders Table */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Delivery Orders</h2>
            <p className="text-[11px] text-slate-500">Live active order queue in Bangalore hub</p>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            View All Orders <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Order Number</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Address</th>
                <th className="py-2.5 px-3">Weight</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Vehicle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 font-mono font-medium text-blue-600 dark:text-blue-400">
                    {ord.orderNumber}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">{ord.customerName}</td>
                  <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 truncate max-w-xs">
                    {ord.deliveryAddress}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{ord.packageWeightKg} kg</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        ord.priority === 'URGENT'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                          : ord.priority === 'HIGH'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {ord.priority}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        ord.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : ord.status === 'IN_TRANSIT'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                    {ord.assignedVehicleRegistration || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
