import React, { useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQueueStore, calculateWaitTime, getPositionInLine } from '../utils/queueStore';
import { SERVICES, BARBERS } from '../constants';
import Header from '../components/Header';
import { Clock, AlertTriangle, CheckCircle, XCircle, UserX, Scissors } from 'lucide-react';

export default function MyStatus() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { queue, barbers, cancelSpot } = useQueueStore();

  const [showCancelModal, setShowCancelModal] = useState(false);

  const customer = queue.find((c) => c.id === id);

  if (!customer) {
    return (
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-[#111827]">
        <Header showBack title="My Status" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-2xl mb-4">
            !
          </div>
          <h2 className="text-xl font-bold text-gray-100">Spot not found</h2>
          <p className="text-sm text-gray-400 mt-2 max-w-xs">
            We couldn't find a queue spot with token <span className="text-gray-200 font-mono font-semibold">{id}</span>.
          </p>
          <Link
            to="/"
            className="mt-6 px-6 py-2.5 bg-[#D4A017] hover:bg-[#B8860B] text-gray-950 font-bold rounded-xl text-sm transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const chosenBarber = BARBERS.find((b) => b.id === customer.barberChoice);
  const assignedBarberObj = BARBERS.find((b) => b.id === customer.assignedBarber);
  const barberOnBreak = chosenBarber
    ? barbers.find((b) => b.id === chosenBarber.id)?.onBreak
    : false;

  const position = getPositionInLine(queue, customer.id);
  const waitEstimate = calculateWaitTime(queue, customer.id, barbers);

  // When called: full-screen gold "It's your turn! Go to [Barber]"
  if (customer.status === 'Called') {
    return (
      <div className="fixed inset-0 bg-[#D4A017] text-gray-950 flex flex-col items-center justify-center p-6 text-center z-50 animate-pulse">
        <div className="w-20 h-20 rounded-full bg-black/10 flex items-center justify-center mb-6">
          <Scissors className="w-10 h-10 text-gray-950" />
        </div>
        <div className="text-6xl font-black tracking-tight">{customer.id}</div>
        <h1 className="text-3xl font-extrabold mt-4">It's your turn!</h1>
        <p className="text-xl font-medium mt-2 max-w-xs">
          Please proceed to <strong className="underline">{assignedBarberObj?.name || 'your barber'}</strong>'s chair now.
        </p>

        <div className="mt-8 bg-black/10 backdrop-blur-sm px-6 py-3 rounded-2xl text-sm font-semibold">
          Customer: {customer.customerName}
        </div>
      </div>
    );
  }

  // Cancelled or No-show states
  if (customer.status === 'Cancelled' || customer.status === 'No-show') {
    return (
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-[#111827]">
        <Header showBack title="My Status" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 mb-4">
            {customer.status === 'Cancelled' ? <XCircle className="w-8 h-8" /> : <UserX className="w-8 h-8" />}
          </div>
          <div className="text-3xl font-extrabold text-gray-400 font-mono">{customer.id}</div>
          <h2 className="text-xl font-bold text-gray-200 mt-2">
            Spot {customer.status}
          </h2>
          <p className="text-sm text-gray-400 mt-2 max-w-xs">
            {customer.status === 'Cancelled'
              ? 'You have cancelled this queue spot.'
              : 'You were marked as a no-show after being called.'}
          </p>
          <Link
            to="/join"
            className="mt-6 px-6 py-3 bg-[#D4A017] hover:bg-[#B8860B] text-gray-950 font-bold rounded-xl text-sm transition-colors min-h-[44px] flex items-center justify-center"
          >
            Join again
          </Link>
        </div>
      </div>
    );
  }

  // Done state
  if (customer.status === 'Done') {
    return (
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-[#111827]">
        <Header showBack title="My Status" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">{customer.id}</div>
          <h2 className="text-2xl font-bold text-gray-100 mt-2">Thank you!</h2>
          <p className="text-sm text-gray-400 mt-2 max-w-xs">
            Your service is complete. We hope you enjoyed your visit!
          </p>
          <Link
            to="/join"
            className="mt-6 px-6 py-3 bg-[#D4A017] hover:bg-[#B8860B] text-gray-950 font-bold rounded-xl text-sm transition-colors min-h-[44px] flex items-center justify-center"
          >
            Join again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-[#111827]">
      <Header showBack title="My Status" />

      <div className="flex-1 px-4 py-6 flex flex-col justify-between">
        <div className="space-y-5">
          {/* Active spot redirection notice if present */}
          {location.state?.note && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3 rounded-xl text-xs">
              {location.state.note}
            </div>
          )}

          {/* When 2nd in line: gold banner "Start coming to the salon" */}
          {customer.status === 'Waiting' && position && position.number <= 2 && (
            <div className="bg-[#D4A017] text-gray-950 px-4 py-3 rounded-2xl font-bold text-sm text-center shadow-lg flex items-center justify-center gap-2">
              <span className="text-lg">🚶</span>
              <span>Start coming to the salon</span>
            </div>
          )}

          {/* In chair notice */}
          {customer.status === 'In chair' && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-2xl font-bold text-sm text-center flex items-center justify-center gap-2">
              <Scissors className="w-4 h-4 animate-spin" />
              <span>Service in progress</span>
            </div>
          )}

          {/* Large Token Card */}
          <div className="bg-[#1F2937] border border-gray-800 rounded-3xl p-6 text-center shadow-xl relative overflow-hidden">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1">
              Your Token
            </span>
            <div className="text-5xl font-black text-gray-100 tracking-tight font-mono">
              {customer.id}
            </div>

            <div className="mt-3">
              {customer.status === 'Waiting' && position ? (
                <span className="inline-block px-3 py-1 bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/30 rounded-full text-sm font-semibold">
                  {position.label}
                </span>
              ) : (
                <span className="inline-block px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-medium">
                  Status: {customer.status}
                </span>
              )}
            </div>

            {/* Plain text countdown as specified in lite scope: "about 35 min", updates by itself */}
            {customer.status === 'Waiting' && (
              <div className="mt-6 pt-5 border-t border-gray-800">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                  Estimated wait time
                </div>
                <div className="text-2xl font-bold text-[#D4A017] flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{waitEstimate}</span>
                </div>
              </div>
            )}
          </div>

          {/* Barber on break alert */}
          {barberOnBreak && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-3 rounded-xl text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                <strong>{chosenBarber?.name}</strong> is currently on break. You remain in the queue and will be served as soon as they return.
              </span>
            </div>
          )}

          {/* Details Card */}
          <div className="bg-[#1F2937] border border-gray-800 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-800">
              <span className="text-gray-400">Name</span>
              <span className="font-semibold text-gray-200">{customer.customerName}</span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-800">
              <span className="text-gray-400">Phone</span>
              <span className="font-semibold text-gray-200">{customer.phone}</span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-800">
              <span className="text-gray-400">Barber Preference</span>
              <span className="font-semibold text-gray-200">
                {customer.barberChoice === 'any'
                  ? '⚡ Any barber (Fastest)'
                  : `${chosenBarber?.avatar || '👨'} ${chosenBarber?.name || customer.barberChoice}`}
              </span>
            </div>
            <div className="text-xs pt-1">
              <span className="text-gray-400 block mb-1.5">Services:</span>
              <div className="flex flex-wrap gap-1.5">
                {customer.services.map((sid) => {
                  const s = SERVICES.find((item) => item.id === sid);
                  return (
                    <span
                      key={sid}
                      className="px-2.5 py-1 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 font-medium"
                    >
                      {s?.name || sid} ({s?.minutes}m)
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Spot Button (Only while Waiting) */}
        {customer.status === 'Waiting' && (
          <div className="pt-6">
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="w-full py-3 px-4 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs font-semibold transition-colors min-h-[44px]"
            >
              Cancel my spot
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#1F2937] border border-gray-700 rounded-2xl p-5 max-w-xs w-full text-center space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-gray-100">Cancel queue spot?</h3>
            <p className="text-xs text-gray-400">
              Are you sure you want to give up token <span className="font-mono text-gray-200 font-bold">{customer.id}</span>? You will lose your position.
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl min-h-[44px]"
              >
                Keep Spot
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelSpot(customer.id);
                  setShowCancelModal(false);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl min-h-[44px]"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
