import React from 'react';
import { Wifi, WifiOff, Activity, AlertTriangle, PhoneCall } from 'lucide-react';

/**
 * NetworkBadge component adhering to design.md Section 3 semantic colors.
 * Statuses: 'stable' | 'degraded' | 'emergency' | 'offline'
 */
export default function NetworkBadge({ status = 'stable', rtt = null, label = null, compact = false }) {
  let badgeStyles = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  let dotColor = 'bg-emerald-500';
  let Icon = Wifi;
  let defaultLabel = 'Network: Stable (Video OK)';
  let shortLabel = 'Stable';

  if (status === 'degraded' || status === 'audio-only') {
    badgeStyles = 'bg-amber-100 text-amber-900 border-amber-400 animate-pulse';
    dotColor = 'bg-amber-500';
    Icon = PhoneCall;
    defaultLabel = rtt ? `Audio-Only Fallback (RTT ${Math.round(rtt)}ms)` : 'Audio-Only Fallback Active';
    shortLabel = rtt ? `Audio (${Math.round(rtt)}ms)` : 'Audio-Only';
  } else if (status === 'emergency' || status === 'disconnected' || status === 'offline') {
    badgeStyles = 'bg-rose-100 text-rose-800 border-rose-300';
    dotColor = 'bg-rose-500';
    Icon = AlertTriangle;
    defaultLabel = 'Connection Lost';
    shortLabel = 'Offline';
  }

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-bold border shadow-xs transition-colors ${badgeStyles}`}
        title={label || defaultLabel}
        role="status"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor} ${status === 'degraded' ? 'animate-ping' : ''}`} />
        <span className="font-mono">{rtt && status === 'stable' ? `${Math.round(rtt)}ms` : shortLabel}</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm transition-colors ${badgeStyles}`}
      role="status"
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label || defaultLabel}</span>
      {rtt && status === 'stable' && (
        <span className="text-[10px] font-normal opacity-75 font-mono">({Math.round(rtt)}ms)</span>
      )}
    </div>
  );
}
