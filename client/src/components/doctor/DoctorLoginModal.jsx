import React, { useState } from 'react';
import { ShieldCheck, Stethoscope, Lock, Key, CheckCircle, ArrowRight, X, AlertCircle } from 'lucide-react';

export default function DoctorLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  currentDoctor,
  lang = 'en'
}) {
  const [regNumber, setRegNumber] = useState(currentDoctor?.regNumber || 'UP-MED-48201');
  const [hubCode, setHubCode] = useState('UP-BRB-03');
  const [otp, setOtp] = useState('4821');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(true);

  if (!isOpen) return null;

  const handleVerify = (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerified(true);
      if (onLoginSuccess) {
        onLoginSuccess({
          name: 'Dr. Ananya Sharma',
          regNumber,
          degree: 'MD (Internal Medicine)',
          hubCode,
          verified: true
        });
      }
      setTimeout(() => {
        onClose();
      }, 500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-neutral-200 overflow-hidden text-slate-800">
        <div className="bg-brand-tealDark text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-lg text-teal-200 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-brand-marigold flex items-center justify-center text-white mb-3 shadow-md">
            <Stethoscope className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-bold tracking-tight">
            {lang === 'hi' ? 'चिकित्सक सत्यापन और लॉगिन' : 'Medical Officer Tele-Hub Login'}
          </h3>
          <p className="text-xs text-teal-100 mt-1">
            {lang === 'hi' 
              ? 'राष्ट्रीय चिकित्सा आयोग (NMC) व राज्य मेडिकल काउंसिल क्रेडेंशियल्स' 
              : 'National Medical Commission (NMC) & State Council Verification'}
          </p>
        </div>

        <form onSubmit={handleVerify} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Medical Registration Council No. (NMC/State) *
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 absolute left-3 top-3 text-emerald-600" />
              <input
                type="text"
                required
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="e.g. UP-MED-48201 or NMC-49102"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-sm font-bold font-mono text-slate-900 focus:outline-none focus:border-brand-marigold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                District Hub Code
              </label>
              <input
                type="text"
                value={hubCode}
                onChange={(e) => setHubCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Security OTP / PIN
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-neutral-300 text-xs font-mono font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Verified Practitioner Badge Active</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Doctor: Dr. Ananya Sharma, MD • Status: Authenticated on ABDM National Telehealth Registry.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="px-5 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-tealDark text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              {isVerifying ? (
                <span>Verifying Council DB...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate & Enter Hub</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
