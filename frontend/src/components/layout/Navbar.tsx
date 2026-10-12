import React, { useState, useEffect } from 'react';
import { Play, Pause, Radio, Zap, Bell, User as UserIcon, Moon, Sun, RefreshCw } from 'lucide-react';
import { trackingApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ darkMode, setDarkMode }) => {
  const { user, logout, demoLogin } = useAuth();
  const [isSimRunning, setIsSimRunning] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1.0);
  const [loadingSim, setLoadingSim] = useState<boolean>(false);

  useEffect(() => {
    checkSimulationStatus();
  }, []);

  const checkSimulationStatus = async () => {
    try {
      const res = await trackingApi.getSimulationStatus();
      setIsSimRunning(res.running);
      if (res.speed) setSimSpeed(res.speed);
    } catch (err) {
      // Backend maybe offline yet
    }
  };

  const toggleSimulation = async () => {
    setLoadingSim(true);
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
    } finally {
      setLoadingSim(false);
    }
  };

  const handleSpeedChange = async (newSpeed: number) => {
    try {
      await trackingApi.setSimulationSpeed(newSpeed);
      setSimSpeed(newSpeed);
    } catch (err) {
      console.error('Failed to set speed:', err);
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE VRP ENGINE
          </span>
          <span className="hidden sm:inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <Radio className="w-3 h-3 text-amber-600" />
            SIMULATED GPS
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Simulation Play/Pause & Speed Controller */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={toggleSimulation}
            disabled={loadingSim}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              isSimRunning
                ? 'bg-rose-600 text-white shadow-sm hover:bg-rose-700'
                : 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
            }`}
          >
            {isSimRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Fleet</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Run Simulator</span>
              </>
            )}
          </button>

          <div className="hidden lg:flex items-center pl-2 pr-1 space-x-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Speed:</span>
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => handleSpeedChange(spd)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition ${
                  simSpeed === spd
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition"
          title="Toggle light/dark theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Account / Profile */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          {user ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {user.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left text-xs">
                <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">{user.name}</p>
                <p className="text-[10px] text-slate-500 capitalize">{user.role.replace('ROLE_', '').toLowerCase()}</p>
              </div>
              <button
                onClick={logout}
                className="text-xs text-slate-500 hover:text-rose-600 ml-1 underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={demoLogin}
              className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100 transition"
            >
              Demo Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
