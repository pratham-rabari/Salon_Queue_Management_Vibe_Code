import React, { useState, useEffect, useRef } from 'react';
import { useQueueStore, calculateWaitTime } from '../utils/queueStore';
import { SALON_INFO, BARBERS } from '../constants';
import { Scissors, Clock, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TvDisplay() {
  const { queue, barbers } = useQueueStore();
  const [flashingTokenId, setFlashingTokenId] = useState(null);
  const prevCalledTokensRef = useRef(new Set());

  // Detect newly called token to flash gold
  useEffect(() => {
    const currentCalled = queue.filter((c) => c.status === 'Called').map((c) => c.id);
    const prevSet = prevCalledTokensRef.current;

    const newlyCalled = currentCalled.find((id) => !prevSet.has(id));
    if (newlyCalled) {
      setFlashingTokenId(newlyCalled);
      const timer = setTimeout(() => {
        setFlashingTokenId(null);
      }, 8000); // Flash for 8 seconds
      return () => clearTimeout(timer);
    }

    prevCalledTokensRef.current = new Set(currentCalled);
  }, [queue]);

  const workingBarbers = barbers.filter((b) => b.onDuty);
  const upNextTokens = queue
    .filter((c) => c.status === 'Waiting')
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#111827] text-gray-100 flex flex-col p-8 select-none">
      {/* TV Header */}
      <header className="flex items-center justify-between pb-6 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#D4A017]/20 border-2 border-[#D4A017] flex items-center justify-center text-[#D4A017]">
            <Scissors className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-100 tracking-tight">
              {SALON_INFO.name}
            </h1>
            <p className="text-lg text-gray-400 font-medium">
              Live Queue Board · Closes {SALON_INFO.closeHour > 12 ? `${SALON_INFO.closeHour - 12} PM` : `${SALON_INFO.closeHour} AM`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-sm uppercase tracking-widest text-[#D4A017] font-bold block">
              Waiting Area Display
            </span>
            <span className="text-xs text-gray-500">
              Updates in real-time
            </span>
          </div>
          <Link
            to="/"
            className="text-xs text-gray-600 hover:text-gray-400 border border-gray-800 px-3 py-1.5 rounded-lg"
          >
            Exit TV
          </Link>
        </div>
      </header>

      {/* Main TV Content Area: 2 Columns */}
      <div className="flex-1 grid grid-cols-12 gap-8 pt-8">
        {/* Left Column: Barbers & Current In-Chair (7 Cols) */}
        <div className="col-span-7 flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Scissors className="w-6 h-6 text-[#D4A017]" /> Current In Chair
            </h2>
            <span className="text-sm font-semibold text-gray-400">
              {workingBarbers.length} Barbers Stationed
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {workingBarbers.map((barber) => {
              const activeCust = queue.find((c) => c.id === barber.currentTokenId);
              const isFlashing = activeCust && flashingTokenId === activeCust.id;

              return (
                <div
                  key={barber.id}
                  className={`bg-[#1F2937] border-2 rounded-3xl p-6 flex items-center justify-between transition-all duration-500 ${
                    isFlashing
                      ? 'border-[#D4A017] bg-[#D4A017]/20 shadow-2xl shadow-[#D4A017]/40 scale-[1.02]'
                      : 'border-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <span className="text-6xl p-2 bg-gray-900 rounded-2xl border border-gray-800">
                      {barber.avatar}
                    </span>
                    <div>
                      {/* Name minimum 48px readable from 5m */}
                      <div className="text-[44px] font-black text-gray-100 leading-tight">
                        {barber.name}
                      </div>
                      <div className="text-base text-gray-400 font-medium">
                        {barber.onBreak ? (
                          <span className="text-amber-400 font-semibold">On Break</span>
                        ) : activeCust ? (
                          <span className="text-emerald-400 font-semibold">
                            Serving: {activeCust.customerName}
                          </span>
                        ) : (
                          <span className="text-gray-500">Available</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Token display: Minimum 48px readable from 5m */}
                  <div className="text-right">
                    {activeCust ? (
                      <div>
                        <span className="text-xs uppercase tracking-wider text-[#D4A017] font-bold block mb-1">
                          Now Serving
                        </span>
                        <div
                          className={`font-mono text-[52px] font-black tracking-tight leading-none ${
                            isFlashing
                              ? 'text-[#D4A017] animate-bounce'
                              : 'text-gray-100'
                          }`}
                        >
                          Now: {activeCust.id}
                        </div>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-gray-500 uppercase tracking-widest border border-gray-800 px-4 py-2 rounded-xl bg-gray-900/40">
                        {barber.onBreak ? 'ON BREAK' : 'FREE'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Up Next List (5 Cols) */}
        <div className="col-span-5 flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase tracking-wider text-[#D4A017] flex items-center gap-2">
              <Users className="w-6 h-6" /> Up Next (Next 5)
            </h2>
            <span className="text-sm font-semibold text-gray-400">
              {upNextTokens.length} Queued
            </span>
          </div>

          <div className="bg-[#1F2937] border-2 border-gray-800 rounded-3xl p-6 flex-1 flex flex-col justify-between">
            {upNextTokens.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
                <Users className="w-16 h-16 text-gray-700 mb-3" />
                <p className="text-2xl font-bold text-gray-300">No Customers Waiting</p>
                <p className="text-base text-gray-500 mt-1">
                  Walk right in or scan QR code to join.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800 space-y-3">
                {upNextTokens.map((token, index) => {
                  const wait = calculateWaitTime(queue, token.id, barbers);
                  const isNewlyCalled = flashingTokenId === token.id;

                  return (
                    <div
                      key={token.id}
                      className={`pt-3 first:pt-0 flex items-center justify-between transition-colors ${
                        isNewlyCalled
                          ? 'bg-[#D4A017]/20 p-3 rounded-2xl border-2 border-[#D4A017]'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-10 h-10 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center font-bold text-gray-400 text-lg">
                          {index + 1}
                        </span>
                        <div>
                          {/* Token minimum 48px readable from 5m */}
                          <div className="font-mono text-[48px] font-black text-gray-100 leading-none">
                            {token.id}
                          </div>
                          <div className="text-base font-semibold text-gray-300 mt-1">
                            {token.customerName}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs uppercase tracking-wider text-gray-500 block">
                          Est. Wait
                        </span>
                        <span className="text-xl font-bold text-[#D4A017]">
                          {wait.replace('about ', '')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom TV footer advice */}
            <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D4A017]" /> Gold flash indicates freshly called token
              </span>
              <span>Keep your token ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
