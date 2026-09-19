import React from 'react';
import { Activity, User, Stethoscope, Truck, Home, Globe, Smartphone, Database, ShieldCheck } from 'lucide-react';
import NetworkBadge from './NetworkBadge.jsx';
import { TRANSLATIONS } from '../../utils/translations.js';

export default function Navbar({
  currentRoute,
  onNavigate,
  networkStatus = 'stable',
  rtt = null,
  lang = 'en',
  onCycleLang,
  onOpenSmsUssd,
  onOpenDatabase,
  onOpenDoctorLogin,
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const getNextLangLabel = () => {
    if (lang === 'en') return 'हिन्दी';
    if (lang === 'hi') return 'বাংলা';
    return 'English';
  };

  const getCurrentLangBadge = () => {
    if (lang === 'en') return 'EN';
    if (lang === 'hi') return 'हिन्दी';
    if (lang === 'bn') return 'বাংলা';
    return 'EN';
  };

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
              <span className="text-base sm:text-xl font-bold tracking-tight">{t.appTitle}</span>
              <span className="hidden md:inline-block text-[10px] uppercase px-1.5 py-0.5 rounded bg-brand-teal text-white font-medium tracking-wider">
                {t.subtitle}
              </span>
            </div>
            <p className="text-[10px] text-neutral-300 hidden lg:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Center / Right Navigation Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap justify-end">
          {/* Clinical Table Database Trigger */}
          {onOpenDatabase && (
            <button
              type="button"
              onClick={onOpenDatabase}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-xs font-bold text-amber-300 transition-colors shrink-0 shadow-2xs"
              title="View Doctor List and Applied Patients Table Database"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{t.navDatabase || 'Database'}</span>
            </button>
          )}

          {/* Doctor Credential Verification Login Trigger */}
          {onOpenDoctorLogin && (
            <button
              type="button"
              onClick={onOpenDoctorLogin}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-xs font-bold text-teal-200 transition-colors shrink-0"
              title="Doctor Medical Council Login & Verification"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'hi' ? 'डॉक्टर NMC' : 'Doctor Login'}</span>
            </button>
          )}

          {/* Offline SMS/USSD Fallback Trigger */}
          {onOpenSmsUssd && (
            <button
              type="button"
              onClick={onOpenSmsUssd}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-xs font-bold text-emerald-300 transition-colors shrink-0"
              title="Test Offline GSM USSD & SMS Gateway"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'USSD/SMS' : 'SMS/USSD'}</span>
            </button>
          )}

          {/* Multilingual Switcher (English, Hindi, Bengali Regional) */}
          {onCycleLang && (
            <button
              type="button"
              onClick={onCycleLang}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/60 border border-amber-400/30 text-xs font-bold text-amber-300 transition-all shadow-2xs shrink-0"
              title={`Active: ${getCurrentLangBadge()}. Click to switch to ${getNextLangLabel()}`}
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{getCurrentLangBadge()}</span>
              <span className="text-[10px] text-amber-200/70 font-normal">({getNextLangLabel()})</span>
            </button>
          )}

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
              <span className="hidden sm:inline">{t.navHome}</span>
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
              <span className="hidden sm:inline">{t.navPatient}</span>
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
              <span className="hidden sm:inline">{t.navDoctor}</span>
            </button>

            <button
              onClick={() => onNavigate('asha')}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentRoute === 'asha'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-neutral-200 hover:text-white hover:bg-white/10'
              }`}
              title="ASHA Workload"
            >
              <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">{t.navAsha}</span>
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
