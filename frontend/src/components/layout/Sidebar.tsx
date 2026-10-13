import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Navigation,
  Package,
  Route,
  Truck,
  BarChart3,
  Settings,
  Zap,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tracking', label: 'Live Tracking', icon: Navigation },
  { path: '/orders', label: 'Delivery Orders', icon: Package },
  { path: '/routes', label: 'Route Optimization', icon: Route },
  { path: '/fleet', label: 'Fleet Management', icon: Truck },
  { path: '/analytics', label: 'Analytics & Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand logo & title */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Zap className="w-5 h-5 fill-white" />
        </div>
        <div>
          <h1 className="font-bold text-white text-sm tracking-wide leading-tight">OPTIDELIVER</h1>
          <p className="text-[10px] text-blue-400 font-medium tracking-wider uppercase">AI Route Optimizer</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Core Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <div className="pt-2 border-t border-slate-800/80 mt-2">
          <div className="px-3 pb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Client Portal
          </div>
          <NavLink
            to="/customer"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-blue-400 hover:text-white hover:bg-slate-800/60'
              }`
            }
          >
            <Package className="w-4 h-4 shrink-0 text-blue-400" />
            <span>Customer Portal</span>
          </NavLink>
        </div>
      </nav>

      {/* Project details card */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 m-3 rounded-xl text-[11px]">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="font-semibold text-slate-300">B.Tech Capstone AI/ML</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono">v1.0</span>
        </div>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          Dynamic CVRPTW • Traffic-Aware A* • Predictive ETA • STOMP Live Feeds
        </p>
      </div>
    </aside>
  );
};
