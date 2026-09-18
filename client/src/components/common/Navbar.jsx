import React from 'react';
import { Activity, User, Stethoscope, Truck, Home } from 'lucide-react';
import NetworkBadge from './NetworkBadge.jsx';

export default function Navbar({ currentRoute, onNavigate, networkStatus = 'stable', rtt = null }) {
  return (
    <header className="bg-brand-tealDark text-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-marigold flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight">PulseCare</span>
              <span className="hidden sm:inline-block text-[11px] uppercase px-2 py-0.5 rounded bg-brand-teal text-white font-medium tracking-wider">
                Rural Telehealth
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 hidden md:block">
              Low-Bandwidth Adaptive Telemedicine
            </p>
          </div>
        </div>

        {/* Center / Right Navigation Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="flex items-center gap-1 bg-black/20 p-1 rounded-xl">
            <button
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                currentRoute === 'home'
                  ? 'bg-brand-marigold text-white shadow-sm'
                  : 'text-neutral-200 hover:text-white hover:bg-white/10'
              }`}
              title="Overview"
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden xs:inline sm:inline">Home</span>
            </button>

            <button
              onClick={() => onNavigate('patient')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                currentRoute === 'patient'
                  ? 'bg-brand-marigold text-white shadow-sm'
                  : 'text-neutral-200 hover:text-white hover:bg-white/10'
              }`}
              title="Patient Triage & Call"
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Patient</span>
            </button>

            <button
              onClick={() => onNavigate('doctor')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                currentRoute === 'doctor'
                  ? 'bg-brand-marigold text-white shadow-sm'
                  : 'text-neutral-200 hover:text-white hover:bg-white/10'
              }`}
              title="Doctor Command Hub"
            >
              <Stethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Doctor</span>
            </button>

            <button
              onClick={() => onNavigate('asha')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                currentRoute === 'asha'
                  ? 'bg-brand-marigold text-white shadow-sm'
                  : 'text-neutral-200 hover:text-white hover:bg-white/10'
              }`}
              title="ASHA Community Delivery"
            >
              <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">ASHA Delivery</span>
              <span className="inline sm:hidden">ASHA</span>
            </button>
          </nav>

          <div className="hidden lg:block">
            <NetworkBadge status={networkStatus} rtt={rtt} />
          </div>
        </div>
      </div>
    </header>
  );
}
