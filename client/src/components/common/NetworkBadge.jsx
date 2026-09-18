import React from 'react';
import { Wifi, WifiOff, Activity, AlertTriangle, PhoneCall } from 'lucide-react';

/**
 * NetworkBadge component adhering to design.md Section 3 semantic colors.
 * Statuses: 'stable' | 'degraded' | 'emergency' | 'offline'
 */
export default function NetworkBadge({ status = 'stable', rtt = null, label = null }) {
  let badgeStyles = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  let Icon = Wifi;
  let defaultLabel = 'Network: Stable (Video OK)';

  if (status === 'degraded' || status === 'audio-only') {
    badgeStyles = 'bg-amber-100 text-amber-900 border-amber-400 animate-pulse';
    Icon = PhoneCall;
    defaultLabel = rtt ? `Audio-Only Fallback (RTT ${Math.round(rtt)}ms)` : 'Audio-Only Fallback Active';
  } else if (status === 'emergency' || status === 'disconnected' || status === 'offline') {
    badgeStyles = 'bg-rose-100 text-rose-800 border-rose-300';
    Icon = AlertTriangle;
    defaultLabel = 'Connection Lost';
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm transition-colors ${badgeStyles}`}
      role="status"
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label || defaultLabel}</span>
      {rtt && status === 'stable' && (
        <span className="text-[10px] font-normal opacity-75">({Math.round(rtt)}ms)</span>
      )}
    </div>
  );
}
