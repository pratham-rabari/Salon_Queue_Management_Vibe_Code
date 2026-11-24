import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQueueStore } from '../utils/queueStore';
import { BARBERS, SERVICES } from '../constants';
import Header from '../components/Header';
import { Scissors, Coffee, CheckCircle, Clock, Play, UserCheck, AlertCircle } from 'lucide-react';

export default function BarberView() {
  const { name } = useParams();
  const {
    barbers,
    queue,
    startService,
    doneService,
    toggleBreak,
  } = useQueueStore();

  const [breakError, setBreakError] = useState('');

  // Find barber case-insensitively
  const barber = barbers.find(
    (b) => b.id.toLowerCase() === name?.toLowerCase() || b.name.toLowerCase() === name?.toLowerCase()
  );

  // Elapsed timer ticker for active customer
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!barber) {
    return (
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-[#111827]">
        <Header showBack title="Barber View" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold text-gray-200">Barber not found</h2>
          <p className="text-sm text-gray-400 mt-2">
            "{name}" is not registered on duty. Available barbers:
          </p>
          <div className="flex gap-2 mt-4">
            {barbers.map((b) => (
              <Link
                key={b.id}
                to={`/barber/${b.id}`}
                className="px-3 py-1.5 bg-[#1F2937] hover:bg-gray-800 border border-gray-700 text-xs font-semibold rounded-lg text-gray-200"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Active customer for this barber
  const currentCustomer = queue.find((c) => c.id === barber.currentTokenId);

  // Next candidate in waiting line who chose this barber or 'any'
  const nextInLine = queue.find(
    (c) => c.status === 'Waiting' && (c.barberChoice === barber.id || c.barberChoice === 'any')
  );

  // Timer since start
  let elapsedString = '00:00';
  if (currentCustomer && currentCustomer.status === 'In chair' && currentCustomer.startedAt) {
    const diffSec = Math.floor((now - currentCustomer.startedAt) / 1000);
    const mins = Math.floor(diffSec / 60);
    const secs = diffSec % 60;
    elapsedString = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  } else if (currentCustomer && currentCustomer.status === 'Called' && currentCustomer.calledAt) {
    const diffSec = Math.floor((now - currentCustomer.calledAt) / 1000);
    const mins = Math.floor(diffSec / 60);
    const secs = diffSec % 60;
    elapsedString = `Called ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  const handleToggleBreak = () => {
    setBreakError('');
    const res = toggleBreak(barber.id);
    if (res?.error) {
      setBreakError(res.error);
      setTimeout(() => setBreakError(''), 4000);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-[#111827]">
      <Header showBack title={`Barber View · ${barber.name}`} />

      <div className="flex-1 px-4 py-5 flex flex-col justify-between">
        <div className="space-y-5">
          {/* Barber Header Card & Break Toggle */}
          <div className="bg-[#1F2937] border border-gray-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-1 bg-gray-900 rounded-xl border border-gray-700/60">
                {barber.avatar}
              </span>
              <div>
                <h2 className="font-bold text-lg text-gray-100">{barber.name}</h2>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    barber.onBreak
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : barber.currentTokenId
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {barber.onBreak ? 'On break' : barber.currentTokenId ? 'Busy' : 'Available'}
                </span>
              </div>
            </div>

            {/* Toggle: On break / Available */}
            <button
              type="button"
              onClick={handleToggleBreak}
              disabled={currentCustomer && currentCustomer.status === 'In chair'}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[44px] ${
                barber.onBreak
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-gray-950 border border-amber-500/30'
              } ${
                currentCustomer && currentCustomer.status === 'In chair'
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>{barber.onBreak ? 'Available' : 'On break'}</span>
            </button>
          </div>

          {breakError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{breakError}</span>
            </div>
          )}

          {/* Current Customer Card */}
          <div className="bg-[#1F2937] border border-gray-800 rounded-3xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Current Customer
              </span>
              {currentCustomer && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    currentCustomer.status === 'In chair'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-[#D4A017]/15 text-[#D4A017] border border-[#D4A017]/30'
                  }`}
                >
                  {currentCustomer.status}
                </span>
              )}
            </div>

            {currentCustomer ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-3xl font-black text-gray-100 font-mono">
                      {currentCustomer.id}
                    </div>
                    <div className="text-lg font-bold text-gray-200 mt-0.5">
                      {currentCustomer.customerName}
                    </div>
                    <div className="text-xs text-gray-400">
                      📞 {currentCustomer.phone}
                    </div>
                  </div>

                  {/* Timer since start */}
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl px-3.5 py-2 text-right">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest block">
                      Elapsed
                    </span>
                    <span className="font-mono text-lg font-bold text-[#D4A017]">
                      {elapsedString}
                    </span>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <span className="text-xs text-gray-400 block mb-1">Services:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentCustomer.services.map((sid) => {
                      const s = SERVICES.find((item) => item.id === sid);
                      return (
                        <span
                          key={sid}
                          className="px-2.5 py-1 bg-gray-900 border border-gray-700/80 rounded-lg text-xs text-gray-300 font-medium"
                        >
                          {s?.name || sid} ({s?.minutes}m)
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Big Action Buttons: [ Start ] then [ Done ]. Only one active at a time */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    disabled={currentCustomer.status !== 'Called'}
                    onClick={() => startService(barber.id)}
                    className={`h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all min-h-[56px] ${
                      currentCustomer.status === 'Called'
                        ? 'bg-[#D4A017] hover:bg-[#B8860B] active:scale-95 text-gray-950 shadow-md shadow-[#D4A017]/20 cursor-pointer'
                        : 'bg-gray-800/60 text-gray-600 border border-gray-800 cursor-not-allowed'
                    }`}
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Start
                  </button>

                  <button
                    type="button"
                    disabled={currentCustomer.status !== 'In chair'}
                    onClick={() => doneService(barber.id)}
                    className={`h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all min-h-[56px] ${
                      currentCustomer.status === 'In chair'
                        ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-md shadow-emerald-600/20 cursor-pointer'
                        : 'bg-gray-800/60 text-gray-600 border border-gray-800 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-gray-400 space-y-2">
                <Scissors className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-sm font-semibold text-gray-300">Chair is currently empty</p>
                <p className="text-xs text-gray-500">
                  Call the next customer from the Reception dashboard when you are ready.
                </p>
              </div>
            )}
          </div>

          {/* Next For You Section */}
          <div className="bg-[#1F2937] border border-gray-800 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Up Next For You
            </span>
            {nextInLine ? (
              <div className="flex items-center justify-between text-sm bg-gray-900/60 border border-gray-800 p-3 rounded-xl">
                <div>
                  <span className="font-mono font-bold text-[#D4A017] mr-2">
                    {nextInLine.id}
                  </span>
                  <span className="font-semibold text-gray-200">
                    {nextInLine.customerName}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    ({nextInLine.services.join(', ')})
                  </span>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  {nextInLine.barberChoice === 'any' ? '⚡ Any barber' : 'Preferred'}
                </span>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic py-1">
                No one waiting for you right now.
              </p>
            )}
          </div>
        </div>

        {/* Quick Switch Barber Footer */}
        <div className="pt-6 border-t border-gray-800/60 mt-4">
          <span className="text-[11px] uppercase tracking-wider text-gray-500 block text-center mb-2">
            Switch Barber Screen
          </span>
          <div className="flex justify-center gap-2">
            {barbers.map((b) => (
              <Link
                key={b.id}
                to={`/barber/${b.id}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  b.id === barber.id
                    ? 'bg-[#D4A017] text-gray-950'
                    : 'bg-[#1F2937] text-gray-300 hover:text-white border border-gray-700'
                }`}
              >
                <span>{b.avatar}</span>
                <span>{b.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
