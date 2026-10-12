import React, { useEffect, useState } from 'react';
import {
  Settings,
  RotateCcw,
  Sliders,
  Radio,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  Server,
  Zap,
} from 'lucide-react';
import { settingsApi, trafficApi, trackingApi } from '../services/api';
import type { TrafficScenario, RouteObjective } from '../types';

export const SettingsPage: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [trafficScenarios, setTrafficScenarios] = useState<TrafficScenario[]>([]);
  const [defaultObjective, setDefaultObjective] = useState<RouteObjective>('MINIMIZE_TIME');
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [resetConfirmOpen, setResetConfirmOpen] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [cfgRes, trafRes] = await Promise.all([
        settingsApi.getConfig(),
        trafficApi.getScenarios(),
      ]);
      setConfig(cfgRes);
      if (cfgRes.defaultObjective) setDefaultObjective(cfgRes.defaultObjective);
      if (cfgRes.simulationSpeed) setSimulationSpeed(cfgRes.simulationSpeed);
      setTrafficScenarios(trafRes);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRuntimeConfig = async () => {
    try {
      await settingsApi.updateConfig({
        defaultObjective,
        simulationSpeed,
      });
      await trackingApi.setSimulationSpeed(simulationSpeed);
      setStatusMessage('Settings updated successfully.');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save config:', err);
    }
  };

  const handleActivateTrafficScenario = async (id: number) => {
    try {
      await trafficApi.activateScenario(id);
      setStatusMessage('Traffic scenario activated. Dynamic route recalculation broadcasted!');
      const updated = await trafficApi.getScenarios();
      setTrafficScenarios(updated);
      setTimeout(() => setStatusMessage(''), 3500);
    } catch (err) {
      console.error('Failed to activate scenario:', err);
    }
  };

  const handleResetDevData = async () => {
    setResetting(true);
    try {
      await settingsApi.resetData();
      setResetConfirmOpen(false);
      setStatusMessage('Database reset & re-seeded with clean sample demonstration data!');
      loadSettings();
    } catch (err) {
      console.error('Failed to reset data:', err);
    } finally {
      setResetting(false);
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
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          System Settings & Simulation Controls
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure default VRP optimization objectives, simulation playback speed, traffic scenarios, and dev reset
        </p>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {statusMessage}
        </div>
      )}

      {/* Optimization & Simulator Preferences */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3 dark:border-slate-800">
          <Sliders className="w-4 h-4 text-blue-600" />
          Runtime Solver & Simulator Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Default Optimization Objective
            </label>
            <select
              value={defaultObjective}
              onChange={(e) => setDefaultObjective(e.target.value as RouteObjective)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              <option value="MINIMIZE_TIME">Minimize Travel Time (Traffic-aware)</option>
              <option value="MINIMIZE_DISTANCE">Minimize Route Distance (Mileage)</option>
              <option value="BALANCE_WORKLOAD">Balance Workload Across Vehicles</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Simulation Playback Speed: {simulationSpeed}x
            </label>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
              className="w-full mt-2"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>0.5x (Slow)</span>
              <span>1.0x (Normal)</span>
              <span>5.0x (Fast)</span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSaveRuntimeConfig}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition shadow-sm"
          >
            Save Preferences
          </button>
        </div>
      </div>

      {/* Traffic Scenarios */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-500" />
              Dynamic Traffic Conditions & Road Scenarios
            </h2>
            <p className="text-[11px] text-slate-500">
              Activating a scenario modifies road graph travel costs and triggers automatic dynamic re-optimization
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {trafficScenarios.map((sc) => (
            <div
              key={sc.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                sc.active
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20'
              }`}
            >
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{sc.name}</p>
                <p className="text-[11px] text-slate-500 capitalize">Type: {sc.scenarioType}</p>
                {sc.active && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Currently Active
                  </span>
                )}
              </div>

              {!sc.active && (
                <button
                  onClick={() => handleActivateTrafficScenario(sc.id)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition shadow-sm"
                >
                  Activate
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Development Data Reset (Protected) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-rose-200 dark:border-rose-900/50 shadow-sm space-y-3">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Development Database Reset
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Clears temporary simulated locations and restores initial demonstration dataset (2 users, 4 vehicles, 12 orders, 4 traffic scenarios).
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 shadow-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              Confirm Database Reset
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              This will reset orders, vehicles, and route history to initial demonstration state. Are you sure you want to proceed?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleResetDevData}
                disabled={resetting}
                className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700"
              >
                {resetting ? 'Resetting...' : 'Yes, Reset Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
