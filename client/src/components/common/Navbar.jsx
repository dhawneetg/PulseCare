import React from 'react';
import { Activity, User, Stethoscope, Truck, Home } from 'lucide-react';
import NetworkBadge from './NetworkBadge.jsx';

export default function Navbar({ currentRoute, onNavigate, networkStatus = 'stable', rtt = null }) {
  return (
    <header className="bg-brand-tealDark text-white shadow-sm sticky top-0 z-50 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none shrink-0"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-brand-marigold flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Activity className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-base sm:text-xl font-bold tracking-tight">PulseCare</span>
              <span className="hidden md:inline-block text-[10px] uppercase px-1.5 py-0.5 rounded bg-brand-teal text-white font-medium tracking-wider">
                Rural Telehealth
              </span>
            </div>
            <p className="text-[10px] text-neutral-300 hidden lg:block">
              Low-Bandwidth Adaptive Telemedicine
            </p>
          </div>
        </div>

        {/* Center / Right Navigation Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <nav className="flex items-center gap-0.5 sm:gap-1 bg-black/25 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-white/10 shrink-0">
            <button
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentRoute === 'home'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-neutral-200 hover:text-white hover:bg-white/10'
              }`}
              title="Home Overview"
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Home</span>
            </button>

            <button
              onClick={() => onNavigate('patient')}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentRoute === 'patient'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-neutral-200 hover:text-white hover:bg-white/10'
              }`}
              title="Patient Triage & Call"
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Patient</span>
            </button>

            <button
              onClick={() => onNavigate('doctor')}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentRoute === 'doctor'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-neutral-200 hover:text-white hover:bg-white/10'
              }`}
              title="Doctor Command Hub"
            >
              <Stethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Doctor</span>
            </button>

            <button
              onClick={() => onNavigate('asha')}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentRoute === 'asha'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-neutral-200 hover:text-white hover:bg-white/10'
              }`}
              title="ASHA Delivery Timeline"
            >
              <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">ASHA</span>
            </button>
          </nav>

          <div className="hidden sm:block shrink-0">
            <NetworkBadge status={networkStatus} rtt={rtt} />
          </div>
          <div className="sm:hidden block shrink-0">
            <NetworkBadge status={networkStatus} rtt={rtt} compact={true} />
          </div>
        </div>
      </div>
    </header>
  );
}
