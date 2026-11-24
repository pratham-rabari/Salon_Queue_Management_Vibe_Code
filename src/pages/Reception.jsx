import React, { useState, useEffect } from 'react';
import { useQueueStore, calculateWaitTime } from '../utils/queueStore';
import { SERVICES, BARBERS, SALON_INFO } from '../constants';
import { UserPlus, RotateCcw, Clock, Scissors, AlertCircle, Check, X, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Reception() {
  const {
    queue,
    barbers,
    isQueueOpen,
    callNext,
    markNoShow,
    cancelSpot,
    resetDemoData,
    addCustomer,
  } = useQueueStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [callError, setCallError] = useState('');

  // Walk-in form state
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinServices, setWalkinServices] = useState(['haircut']);
  const [walkinBarber, setWalkinBarber] = useState('any');
  const [walkinError, setWalkinError] = useState('');

  // Clear call error after 4 seconds
  useEffect(() => {
    if (callError) {
      const t = setTimeout(() => setCallError(''), 4000);
      return () => clearTimeout(t);
    }
  }, [callError]);

  const waitingQueue = queue.filter((c) => c.status === 'Waiting');
  const calledOrActive = queue.filter((c) => ['Called', 'In chair'].includes(c.status));

  const handleCallNext = (barberId) => {
    setCallError('');
    const res = callNext(barberId);
    if (res?.error) {
      setCallError(res.error);
    }
  };

  const handleAddWalkin = (e) => {
    e.preventDefault();
    setWalkinError('');
    const clean = walkinPhone.replace(/\D/g, '');
    if (!walkinName.trim()) {
      setWalkinError('Name is required');
      return;
    }
    if (clean.length !== 10) {
      setWalkinError('Phone must be exactly 10 digits');
      return;
    }
    if (walkinServices.length === 0) {
      setWalkinError('Select at least one service');
      return;
    }

    const res = addCustomer({
      name: walkinName,
      phone: clean,
      serviceIds: walkinServices,
      barberChoice: walkinBarber,
    });

    if (res.success) {
      setShowAddModal(false);
      setWalkinName('');
      setWalkinPhone('');
      setWalkinServices(['haircut']);
      setWalkinBarber('any');
    } else {
      setWalkinError(res.message || 'Could not add walk-in');
    }
  };

  const toggleWalkinService = (id) => {
    if (walkinServices.includes(id)) {
      if (walkinServices.length > 1) {
        setWalkinServices(walkinServices.filter((s) => s !== id));
      }
    } else {
      if (walkinServices.length < 3) {
        setWalkinServices([...walkinServices, id]);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#111827] text-gray-100 min-h-screen">
      {/* Top Bar */}
      <header className="bg-[#1F2937] border-b border-gray-800 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#D4A017]/20 border border-[#D4A017] flex items-center justify-center text-[#D4A017]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-gray-100">Reception Dashboard</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {isQueueOpen ? 'Queue Open' : 'Queue Closed'}
              </span>
            </div>
            <p className="text-xs text-gray-400">10-inch Tablet View · Real-Time Control</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Add Walk-in Button */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#D4A017] hover:bg-[#B8860B] text-gray-950 font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm min-h-[44px] transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            + Add walk-in
          </button>

          {/* Reset Demo Data Button (Required in user answers) */}
          <button
            type="button"
            onClick={resetDemoData}
            title="Reset to fresh demo queue"
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-gray-700 min-h-[44px] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset demo data
          </button>

          <Link
            to="/"
            className="px-3 py-2 text-xs text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Home
          </Link>
        </div>
      </header>

      {/* Global Toast for Call Error */}
      {callError && (
        <div className="bg-rose-500/10 border-b border-rose-500/30 text-rose-300 px-6 py-2.5 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            {callError}
          </span>
          <button onClick={() => setCallError('')} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Split Layout: Left Barbers, Right Queue */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        {/* Left Column: Barbers (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[#D4A017]" /> Barbers on Duty
            </h2>
            <span className="text-xs text-gray-400">
              {barbers.filter((b) => !b.onBreak).length} Active
            </span>
          </div>

          <div className="space-y-3">
            {barbers.map((barber) => {
              const activeCust = queue.find((c) => c.id === barber.currentTokenId);
              const isFree = !barber.onBreak && !barber.currentTokenId;
              const isBusy = barber.status === 'busy' || !!barber.currentTokenId;
              const isOnBreak = barber.onBreak;

              // Calculate time progress if In chair
              let progressPercent = 0;
              let elapsedMinutes = 0;
              if (activeCust && activeCust.status === 'In chair' && activeCust.startedAt) {
                elapsedMinutes = Math.floor((Date.now() - activeCust.startedAt) / 60000);
                progressPercent = Math.min(100, Math.round((elapsedMinutes / (activeCust.totalMinutes || 30)) * 100));
              }

              return (
                <div
                  key={barber.id}
                  className="bg-[#1F2937] border border-gray-800 rounded-2xl p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-1 bg-gray-900 rounded-xl border border-gray-700/60">
                        {barber.avatar}
                      </span>
                      <div>
                        <h3 className="font-bold text-base text-gray-100 flex items-center gap-2">
                          {barber.name}
                          <Link
                            to={`/barber/${barber.id}`}
                            className="text-[11px] text-[#D4A017] hover:underline font-normal"
                          >
                            (View phone screen)
                          </Link>
                        </h3>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold mt-0.5 ${
                            isOnBreak
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : isBusy
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {isOnBreak ? 'On break' : isBusy ? (activeCust?.status || 'Busy') : 'Free'}
                        </span>
                      </div>
                    </div>

                    {/* Call Next Button */}
                    <button
                      type="button"
                      disabled={!isFree}
                      onClick={() => handleCallNext(barber.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] flex items-center gap-1.5 ${
                        isFree
                          ? 'bg-[#D4A017] hover:bg-[#B8860B] active:scale-95 text-gray-950 shadow-md shadow-[#D4A017]/20 cursor-pointer'
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700/50'
                      }`}
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      Call next
                    </button>
                  </div>

                  {/* Current Customer Info */}
                  {activeCust ? (
                    <div className="bg-[#111827] rounded-xl p-3 border border-gray-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#D4A017]">
                          {activeCust.id} · {activeCust.customerName}
                        </span>
                        <span className="text-gray-400">{activeCust.phone}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-400">
                        <span>Services: {activeCust.services.join(', ')}</span>
                        <span>{activeCust.totalMinutes}m total</span>
                      </div>

                      {/* Progress bar for In chair */}
                      {activeCust.status === 'In chair' && (
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[10px] text-gray-400">
                            <span>In chair: {elapsedMinutes}m elapsed</span>
                            <span>{progressPercent}%</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[#D4A017] h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic py-1">
                      {isOnBreak ? 'Barber is taking a break' : 'Ready for next customer'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Waiting & Active List (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-[#D4A017]" /> Queue List
            </h2>
            <span className="text-xs text-gray-400">
              {waitingQueue.length} Waiting · {calledOrActive.length} In Progress
            </span>
          </div>

          <div className="bg-[#1F2937] border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            {queue.filter((c) => ['Waiting', 'Called', 'In chair'].includes(c.status)).length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-base font-semibold text-gray-300">No one waiting.</p>
                <p className="text-xs text-gray-500 mt-1">
                  Walk-ins or online customers will appear here in FIFO order.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800/80 max-h-[700px] overflow-y-auto">
                {queue
                  .filter((c) => ['Waiting', 'Called', 'In chair'].includes(c.status))
                  .map((customer) => {
                    const elapsedWait = Math.floor((Date.now() - customer.createdAt) / 60000);
                    // Waiting more than 60 min: row highlighted amber
                    const isLongWait = customer.status === 'Waiting' && elapsedWait > 60;
                    const prefBarber = BARBERS.find((b) => b.id === customer.barberChoice);

                    return (
                      <div
                        key={customer.id}
                        className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                          isLongWait
                            ? 'bg-amber-950/20 border-l-4 border-amber-500'
                            : customer.status === 'Called'
                            ? 'bg-[#D4A017]/5 border-l-4 border-[#D4A017]'
                            : customer.status === 'In chair'
                            ? 'bg-emerald-950/15 border-l-4 border-emerald-500'
                            : 'hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono font-extrabold text-base text-gray-100">
                              {customer.id}
                            </span>
                            <span className="font-semibold text-sm text-gray-200">
                              {customer.customerName}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                customer.status === 'Called'
                                  ? 'bg-[#D4A017] text-gray-950'
                                  : customer.status === 'In chair'
                                  ? 'bg-emerald-500 text-gray-950'
                                  : 'bg-gray-800 text-gray-300'
                              }`}
                            >
                              {customer.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                            <span>📞 {customer.phone}</span>
                            <span>•</span>
                            <span>
                              Pref:{' '}
                              <strong className="text-gray-300">
                                {customer.barberChoice === 'any'
                                  ? 'Any'
                                  : prefBarber?.name || customer.barberChoice}
                              </strong>
                            </span>
                            <span>•</span>
                            <span>
                              Services: {customer.services.join(', ')} ({customer.totalMinutes}m)
                            </span>
                            <span>•</span>
                            <span className={isLongWait ? 'text-amber-400 font-semibold' : ''}>
                              Wait: {elapsedWait}m
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {/* No-show button: only for Called customers (per lite scope: can mark No-show anytime on Called) */}
                          {customer.status === 'Called' && (
                            <button
                              type="button"
                              onClick={() => markNoShow(customer.id)}
                              className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl text-xs font-semibold transition-colors min-h-[44px]"
                            >
                              No-show
                            </button>
                          )}

                          {/* Cancel button: for Waiting customers */}
                          {customer.status === 'Waiting' && (
                            <button
                              type="button"
                              onClick={() => cancelSpot(customer.id)}
                              className="px-3 py-1.5 bg-gray-800 hover:bg-rose-900/30 text-gray-400 hover:text-rose-300 border border-gray-700 hover:border-rose-500/30 rounded-xl text-xs font-semibold transition-colors min-h-[44px]"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Walk-in Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#1F2937] border border-gray-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-bold text-base text-gray-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#D4A017]" /> Add Walk-in Customer
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {walkinError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                {walkinError}
              </div>
            )}

            <form onSubmit={handleAddWalkin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Bhai"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className="w-full bg-[#111827] border border-gray-700 focus:border-[#D4A017] rounded-xl px-3.5 py-2.5 text-sm text-gray-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Mobile Number * (10 digits)
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="e.g. 9820123456"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#111827] border border-gray-700 focus:border-[#D4A017] rounded-xl px-3.5 py-2.5 text-sm text-gray-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Services (Max 3)
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {SERVICES.map((s) => {
                    const isSelected = walkinServices.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleWalkinService(s.id)}
                        className={`p-2 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#D4A017]/15 border-[#D4A017] text-gray-100 font-semibold'
                            : 'bg-[#111827] border-gray-700 text-gray-400'
                        }`}
                      >
                        <span>{s.name}</span>
                        <span className="text-[11px] text-[#D4A017]">₹{s.price}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Preferred Barber
                </label>
                <select
                  value={walkinBarber}
                  onChange={(e) => setWalkinBarber(e.target.value)}
                  className="w-full bg-[#111827] border border-gray-700 focus:border-[#D4A017] rounded-xl px-3.5 py-2.5 text-sm text-gray-100 outline-none"
                >
                  <option value="any">⚡ Any barber (Fastest)</option>
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.onBreak ? '(On break)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#D4A017] hover:bg-[#B8860B] text-gray-950 text-xs font-bold rounded-xl min-h-[44px]"
                >
                  Confirm Walk-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
