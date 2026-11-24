import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueueStore, calculateWaitTime } from '../utils/queueStore';
import { SERVICES, BARBERS } from '../constants';
import Header from '../components/Header';
import { Check, AlertCircle, Sparkles, Clock, IndianRupee, Scissors } from 'lucide-react';

export default function JoinQueue() {
  const navigate = useNavigate();
  const { queue, barbers, addCustomer } = useQueueStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [barberChoice, setBarberChoice] = useState('any');
  const [serviceLimitError, setServiceLimitError] = useState('');
  const [activeSpotError, setActiveSpotError] = useState(null);

  // Validate phone: exactly 10 digits
  const cleanPhone = phone.replace(/\D/g, '');
  const isPhoneValid = cleanPhone.length === 10;
  const isNameValid = name.trim().length > 0;
  const isServicesValid = selectedServices.length >= 1;
  const isFormValid = isNameValid && isPhoneValid && isServicesValid;

  const toggleService = (serviceId) => {
    setServiceLimitError('');
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId));
    } else {
      if (selectedServices.length >= 3) {
        setServiceLimitError('Maximum 3 services');
        return;
      }
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const selectedObjects = useMemo(() => {
    return SERVICES.filter((s) => selectedServices.includes(s.id));
  }, [selectedServices]);

  const totalMinutes = selectedObjects.reduce((acc, s) => acc + s.minutes, 0);
  const totalPrice = selectedObjects.reduce((acc, s) => acc + s.price, 0);

  // Expected wait updates on every change
  const expectedWait = useMemo(() => {
    return calculateWaitTime(queue, null, barbers);
  }, [queue, barbers]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const res = addCustomer({
      name,
      phone: cleanPhone,
      serviceIds: selectedServices,
      barberChoice,
    });

    if (res.success) {
      navigate(`/status/${res.token.id}`);
    } else if (res.existingToken) {
      // "If the phone already has an active spot: skip creating, go to that spot's My Status with a note."
      navigate(`/status/${res.existingToken.id}`, {
        state: { note: 'You already have an active spot in the queue.' },
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-[#111827]">
      <Header showBack title="Join Queue" />

      <form onSubmit={handleSubmit} className="flex-1 px-4 py-5 flex flex-col justify-between pb-28">
        <div className="space-y-6">
          {activeSpotError && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{activeSpotError} Redirecting to your active spot...</span>
            </div>
          )}

          {/* Customer Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              1. Your Details
            </h3>
            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Full Name <span className="text-[#D4A017]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kunal Shah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1F2937] border border-gray-700 focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017] rounded-xl px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Mobile Number <span className="text-[#D4A017]">* (10 digits)</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9820123456"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className={`w-full bg-[#1F2937] border rounded-xl px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors ${
                    phone.length > 0 && !isPhoneValid
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-gray-700 focus:border-[#D4A017]'
                  }`}
                  required
                />
                {phone.length > 0 && !isPhoneValid && (
                  <p className="text-xs text-rose-400 mt-1">
                    Phone must be exactly 10 digits ({cleanPhone.length}/10)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Select Services */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                2. Select Services (Max 3)
              </h3>
              <span className="text-xs text-[#D4A017]">
                {selectedServices.length}/3 selected
              </span>
            </div>

            {serviceLimitError && (
              <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serviceLimitError}</span>
              </div>
            )}

            <div className="space-y-2">
              {SERVICES.map((service) => {
                const isSelected = selectedServices.includes(service.id);
                return (
                  <div
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#D4A017]/10 border-[#D4A017] shadow-sm'
                        : 'bg-[#1F2937] border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-[#D4A017] border-[#D4A017] text-gray-950'
                            : 'border-gray-600 bg-gray-900/40 text-transparent'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-100">
                          {service.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {service.minutes} min
                        </div>
                      </div>
                    </div>
                    <div className="font-semibold text-sm text-gray-200">
                      ₹{service.price}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Barber Selection */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              3. Preferred Barber
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {/* Any barber option */}
              <div
                onClick={() => setBarberChoice('any')}
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  barberChoice === 'any'
                    ? 'bg-[#D4A017]/10 border-[#D4A017]'
                    : 'bg-[#1F2937] border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">⚡</span>
                  {barberChoice === 'any' && (
                    <span className="w-2 h-2 rounded-full bg-[#D4A017]" />
                  )}
                </div>
                <div className="mt-2">
                  <div className="text-xs font-semibold text-gray-200">
                    Any barber
                  </div>
                  <div className="text-[11px] text-[#D4A017]">Fastest</div>
                </div>
              </div>

              {/* Specific barbers */}
              {barbers.map((b) => {
                const isSelected = barberChoice === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => setBarberChoice(b.id)}
                    className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'bg-[#D4A017]/10 border-[#D4A017]'
                        : 'bg-[#1F2937] border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{b.avatar}</span>
                      {b.onBreak && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                          On break
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-semibold text-gray-200">
                        {b.name}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {b.onBreak ? 'Available later' : 'Preferred'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Fixed Summary Bar at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#1F2937] border-t border-gray-800 p-4 shadow-2xl z-30">
          <div className="flex items-center justify-between text-xs text-gray-300 mb-2">
            <span>
              Total <strong className="text-gray-100">{totalMinutes} min</strong> · <strong className="text-[#D4A017]">₹{totalPrice}</strong>
            </span>
            <span className="text-gray-400">
              Expected wait ~<strong className="text-gray-200">{expectedWait.replace('about ', '')}</strong>
            </span>
          </div>

          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all min-h-[48px] ${
              isFormValid
                ? 'bg-[#D4A017] hover:bg-[#B8860B] active:scale-[0.99] text-gray-950 shadow-md shadow-[#D4A017]/20 cursor-pointer'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700/50'
            }`}
          >
            <Scissors className="w-4 h-4" />
            Confirm & Get Token
          </button>
        </div>
      </form>
    </div>
  );
}
