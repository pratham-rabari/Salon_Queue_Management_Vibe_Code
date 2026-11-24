import React from 'react';
import { Link } from 'react-router-dom';
import { useQueueStore, calculateWaitTime } from '../utils/queueStore';
import { SALON_INFO } from '../constants';
import { Users, Clock, Scissors, UserCheck, Shield, Tv } from 'lucide-react';
import Header from '../components/Header';

export default function Home() {
  const { queue, barbers, isQueueOpen } = useQueueStore();

  const waitingCount = queue.filter((c) => c.status === 'Waiting').length;
  const waitTimeString = calculateWaitTime(queue, null, barbers);

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-[#111827]">
      <Header />

      <div className="flex-1 px-4 py-6 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Welcome / Brand Banner */}
          <div className="text-center pt-2">
            <span className="text-xs uppercase tracking-widest text-[#D4A017] font-semibold">
              Live Queue Tracking
            </span>
            <h2 className="text-2xl font-bold text-gray-100 mt-1">
              Skip the Wait, Join Online
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Fair, transparent turns updated in real time.
            </p>
          </div>

          {/* Live Queue Card */}
          <div className="bg-[#1F2937] border border-gray-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#D4A017]/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#D4A017]" /> Current Queue
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live
              </span>
            </div>

            {waitingCount === 0 ? (
              <div className="py-4 text-center">
                <div className="text-3xl mb-1">🎉</div>
                <p className="text-lg font-bold text-emerald-400">
                  No one waiting, walk right in!
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Barbers are ready for you right now.
                </p>
              </div>
            ) : (
              <div>
                <div className="text-3xl font-extrabold text-gray-100">
                  {waitingCount} <span className="text-base font-normal text-gray-400">{waitingCount === 1 ? 'person waiting' : 'people waiting'}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-[#D4A017] font-medium">
                  <Clock className="w-4 h-4" />
                  <span>{waitTimeString}</span>
                </div>
              </div>
            )}
          </div>

          {/* Barbers Chips with Status */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Barbers on duty
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {barbers.map((barber) => {
                let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                let label = 'Free';

                if (barber.onBreak) {
                  badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                  label = 'On break';
                } else if (barber.status === 'busy' || barber.currentTokenId) {
                  badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                  label = 'Busy';
                }

                return (
                  <div
                    key={barber.id}
                    className="bg-[#1F2937] border border-gray-800 rounded-xl p-3 flex flex-col items-center text-center shadow-sm"
                  >
                    <span className="text-2xl mb-1">{barber.avatar}</span>
                    <span className="font-semibold text-sm text-gray-200">{barber.name}</span>
                    <span
                      className={`mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${badgeColor}`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Button & Info */}
        <div className="pt-8 space-y-4">
          {isQueueOpen ? (
            <Link
              to="/join"
              className="w-full h-14 bg-[#D4A017] hover:bg-[#B8860B] active:scale-[0.98] text-gray-950 font-bold text-lg rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#D4A017]/20 transition-all min-h-[56px]"
            >
              <Scissors className="w-5 h-5 text-gray-950" />
              Join Queue
            </Link>
          ) : (
            <div className="space-y-2">
              <button
                disabled
                className="w-full h-14 bg-gray-800 text-gray-500 font-bold text-lg rounded-2xl flex items-center justify-center cursor-not-allowed opacity-75"
              >
                Join Queue
              </button>
              <p className="text-center text-xs text-amber-400 font-medium">
                Online queue is closed. Walk-ins are welcome.
              </p>
            </div>
          )}

          {/* Navigation Links requested in answers for quick testing */}
          <div className="pt-4 border-t border-gray-800/80">
            <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block text-center mb-2">
              Barber Screens
            </span>
            <div className="flex items-center justify-center gap-3">
              {barbers.map((b) => (
                <Link
                  key={b.id}
                  to={`/barber/${b.id}`}
                  className="text-xs text-gray-300 hover:text-[#D4A017] bg-[#1F2937] hover:bg-gray-800 border border-gray-800 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <span>{b.avatar}</span>
                  <span>{b.name}</span>
                </Link>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
              <Link to="/reception" className="hover:text-gray-300 flex items-center gap-1 underline underline-offset-2">
                <Shield className="w-3.5 h-3.5" /> Reception Dashboard
              </Link>
              <span>•</span>
              <Link to="/display" className="hover:text-gray-300 flex items-center gap-1 underline underline-offset-2">
                <Tv className="w-3.5 h-3.5" /> Waiting TV
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
