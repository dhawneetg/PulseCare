import React, { useState } from 'react';
import { MessageSquare, Send, Zap, ShieldCheck, WifiOff, FileText, AlertTriangle } from 'lucide-react';
import { TRANSLATIONS } from '../../utils/translations.js';

export default function EmergencyTextRelay({
  messages = [],
  onSendMessage,
  currentUserRole = 'Doctor', // 'Doctor' | 'Patient'
  isOffline = false,
  isAudioOnly = false,
  lang = 'en',
}) {
  const [inputText, setInputText] = useState('');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const isHi = lang === 'hi';

  const quickTemplates = currentUserRole === 'Doctor' ? [
    t.docTemplate1,
    t.docTemplate2,
    t.docTemplate3,
    t.docTemplate4,
  ] : [
    t.patTemplate1,
    t.patTemplate2,
    t.patTemplate3,
    t.patTemplate4,
  ];

  const handleSend = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;
    if (onSendMessage) {
      onSendMessage(text.trim());
    }
    setInputText('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[320px] sm:h-[360px] text-left">
      {/* Header Bar */}
      <div className={`p-3 sm:p-3.5 flex items-center justify-between text-white ${
        isOffline ? 'bg-slate-900 border-b border-slate-800' : 'bg-brand-tealDark border-b border-white/10'
      }`}>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-marigold" />
          <span className="text-xs sm:text-sm font-bold tracking-tight">
            {t.textRelayTitle}
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-emerald-300 border border-white/15">
          {isOffline ? 'IndexedDB Offline Cache' : 'WebRTC + Socket Dual-Relay'}
        </span>
      </div>

      {/* Notice Banner */}
      <div className="px-3 py-1.5 bg-amber-50 border-b border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-1.5 font-medium">
        <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>{t.textRelayNotice}</span>
      </div>

      {/* Message Feed */}
      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-2 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-4 space-y-1.5">
            <ShieldCheck className="w-8 h-8 text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">
              {isHi ? 'सुरक्षित डॉक्टर-मरीज़ दो-तरफा चैनल सक्रिय है' : 'Secure Peer-to-Peer Data Channel Active'}
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs">
              {isHi ? 'चिकित्सीय निर्देश लिखें या नीचे दिए गए त्वरित संदेशों में से चुनें।' : 'Send clinical instructions or select a quick medical template below.'}
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isSelf = msg.sender === currentUserRole || msg.sender === 'You';
            return (
              <div
                key={msg.id || idx}
                className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-xs shadow-2xs ${
                    isSelf
                      ? 'bg-brand-teal text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}
                >
                  <span className="text-[9px] font-bold block opacity-75 mb-0.5">
                    {msg.sender === currentUserRole ? (isHi ? 'आप' : 'You') : msg.sender} • {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 1-Tap Quick Clinical Chips */}
      <div className="p-2 bg-slate-100/90 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0 pl-1">
          {t.quickChips}
        </span>
        {quickTemplates.map((template, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(template)}
            className="shrink-0 px-2 py-1 rounded-md bg-white hover:bg-slate-200 text-[10px] font-semibold text-slate-700 border border-slate-200 shadow-2xs transition-colors"
          >
            {template.slice(0, 22)}...
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2 sm:p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isHi ? `${currentUserRole === 'Doctor' ? 'डॉक्टर' : 'मरीज़'} के रूप में संदेश लिखें...` : `Type message as ${currentUserRole}...`}
          className="flex-1 h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-teal"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="h-9 px-3 rounded-lg bg-brand-marigold hover:bg-brand-marigoldDark disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.send}</span>
        </button>
      </form>
    </div>
  );
}
