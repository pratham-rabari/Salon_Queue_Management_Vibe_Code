import { useState, useEffect, useCallback } from 'react';
import { SERVICES, BARBERS, SALON_INFO } from '../constants.js';

const STORAGE_KEY = 'salon_queue_v1';
const UPDATE_EVENT = 'salon_queue_update';

function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getInitialDemoData() {
  const today = getTodayDateString();
  const now = Date.now();

  return {
    date: today,
    tokenCounter: 7,
    isQueueOpen: true,
    barbers: [
      {
        id: 'ravi',
        name: 'Ravi',
        avatar: '👨🏽',
        status: 'busy', // 'free' | 'busy' | 'on_break'
        currentTokenId: 'S-1',
        onDuty: true,
        onBreak: false,
      },
      {
        id: 'amit',
        name: 'Amit',
        avatar: '👨🏻',
        status: 'free',
        currentTokenId: null,
        onDuty: true,
        onBreak: false,
      },
      {
        id: 'imran',
        name: 'Imran',
        avatar: '🧔🏽',
        status: 'on_break',
        currentTokenId: null,
        onDuty: true,
        onBreak: true,
      },
    ],
    queue: [
      {
        id: 'S-1',
        customerName: 'Kunal Shah',
        phone: '9820123456',
        services: ['haircut'],
        totalMinutes: 30,
        totalPrice: 150,
        barberChoice: 'ravi',
        status: 'In chair',
        assignedBarber: 'ravi',
        createdAt: now - 20 * 60 * 1000,
        calledAt: now - 15 * 60 * 1000,
        startedAt: now - 12 * 60 * 1000,
        completedAt: null,
      },
      {
        id: 'S-2',
        customerName: 'Jignesh Patel',
        phone: '9820234567',
        services: ['haircut', 'beard-trim'],
        totalMinutes: 45,
        totalPrice: 230,
        barberChoice: 'any',
        status: 'Waiting',
        assignedBarber: null,
        createdAt: now - 18 * 60 * 1000,
        calledAt: null,
        startedAt: null,
        completedAt: null,
      },
      {
        id: 'S-3',
        customerName: 'Manish Verma',
        phone: '9820345678',
        services: ['shave', 'head-massage'],
        totalMinutes: 35,
        totalPrice: 160,
        barberChoice: 'amit',
        status: 'Waiting',
        assignedBarber: null,
        createdAt: now - 15 * 60 * 1000,
        calledAt: null,
        startedAt: null,
        completedAt: null,
      },
      {
        id: 'S-4',
        customerName: 'Pritesh Sharma',
        phone: '9820456789',
        services: ['haircut'],
        totalMinutes: 30,
        totalPrice: 150,
        barberChoice: 'ravi',
        status: 'Waiting',
        assignedBarber: null,
        createdAt: now - 12 * 60 * 1000,
        calledAt: null,
        startedAt: null,
        completedAt: null,
      },
      {
        id: 'S-5',
        customerName: 'Chirag Modi',
        phone: '9820567890',
        services: ['beard-trim'],
        totalMinutes: 15,
        totalPrice: 80,
        barberChoice: 'any',
        status: 'Waiting',
        assignedBarber: null,
        createdAt: now - 10 * 60 * 1000,
        calledAt: null,
        startedAt: null,
        completedAt: null,
      },
      {
        id: 'S-6',
        customerName: 'Sanjay Rawal',
        phone: '9820678901',
        services: ['hair-spa'],
        totalMinutes: 45,
        totalPrice: 400,
        barberChoice: 'any',
        status: 'Waiting',
        assignedBarber: null,
        createdAt: now - 8 * 60 * 1000,
        calledAt: null,
        startedAt: null,
        completedAt: null,
      },
      {
        id: 'S-7',
        customerName: 'Alkesh Dave',
        phone: '9820789012',
        services: ['haircut'],
        totalMinutes: 30,
        totalPrice: 150,
        barberChoice: 'imran',
        status: 'Waiting',
        assignedBarber: null,
        createdAt: now - 5 * 60 * 1000,
        calledAt: null,
        startedAt: null,
        completedAt: null,
      },
    ],
  };
}

export function loadQueueData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialDemoData();
      saveQueueData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    const today = getTodayDateString();
    // Daily reset: Tokens reset automatically when the date changes
    if (parsed.date !== today) {
      const resetData = getInitialDemoData();
      saveQueueData(resetData);
      return resetData;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading queue data from localStorage', err);
    const fallback = getInitialDemoData();
    saveQueueData(fallback);
    return fallback;
  }
}

export function saveQueueData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(UPDATE_EVENT));
    }
  } catch (err) {
    console.error('Error saving queue data', err);
  }
}

// Core queue calculation:
// Waiting time ≈ total minutes of services ahead ÷ number of working barbers (on duty, not on break).
// Round up to nearest 5 min. Minimum 0.
export function calculateWaitTime(queue, targetTokenId = null, barbers = []) {
  const workingBarbers = barbers.filter((b) => b.onDuty && !b.onBreak);
  if (workingBarbers.length === 0) {
    return 'Waiting for a barber';
  }

  let totalMinutesAhead = 0;

  if (targetTokenId) {
    const targetIndex = queue.findIndex((item) => item.id === targetTokenId);
    if (targetIndex === -1) return '0 min';

    const targetCustomer = queue[targetIndex];
    if (targetCustomer.status === 'In chair') return 'In chair';
    if (targetCustomer.status === 'Called') return '0 min';
    if (['Done', 'Cancelled', 'No-show'].includes(targetCustomer.status)) return '0 min';

    // Sum service minutes for customers who joined earlier and are still Waiting
    for (let i = 0; i < targetIndex; i++) {
      const item = queue[i];
      if (item.status === 'Waiting') {
        totalMinutesAhead += item.totalMinutes || 0;
      }
    }

    // Add estimated remaining time for customers currently In chair
    const inChairCustomers = queue.filter((item) => item.status === 'In chair');
    inChairCustomers.forEach((item) => {
      const elapsed = item.startedAt ? Math.floor((Date.now() - item.startedAt) / 60000) : 0;
      const remaining = Math.max(0, (item.totalMinutes || 30) - elapsed);
      totalMinutesAhead += remaining;
    });
  } else {
    // Overall queue wait time for a new joiner
    queue.forEach((item) => {
      if (item.status === 'Waiting') {
        totalMinutesAhead += item.totalMinutes || 0;
      } else if (item.status === 'In chair') {
        const elapsed = item.startedAt ? Math.floor((Date.now() - item.startedAt) / 60000) : 0;
        const remaining = Math.max(0, (item.totalMinutes || 30) - elapsed);
        totalMinutesAhead += remaining;
      }
    });
  }

  const rawWait = totalMinutesAhead / workingBarbers.length;
  const roundedWait = Math.ceil(rawWait / 5) * 5;
  const finalWait = Math.max(0, roundedWait);
  return `about ${finalWait} min`;
}

// Find customer's position among waiting customers
export function getPositionInLine(queue, tokenId) {
  const waitingList = queue.filter((item) => item.status === 'Waiting');
  const index = waitingList.findIndex((item) => item.id === tokenId);
  if (index === -1) return null;
  const pos = index + 1;
  const suffix = (n) => {
    if (n % 10 === 1 && n % 100 !== 11) return 'st';
    if (n % 10 === 2 && n % 100 !== 12) return 'nd';
    if (n % 10 === 3 && n % 100 !== 13) return 'rd';
    return 'th';
  };
  return {
    number: pos,
    label: `${pos}${suffix(pos)} in line`,
  };
}

// Queue store hook with instant window-storage listener & 2s polling fallback
export function useQueueStore() {
  const [data, setData] = useState(() => loadQueueData());

  useEffect(() => {
    const handleUpdate = () => {
      setData(loadQueueData());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleUpdate);
      window.addEventListener(UPDATE_EVENT, handleUpdate);

      // 2-second polling fallback
      const interval = setInterval(handleUpdate, 2000);

      return () => {
        window.removeEventListener('storage', handleUpdate);
        window.removeEventListener(UPDATE_EVENT, handleUpdate);
        clearInterval(interval);
      };
    }
  }, []);

  // Actions
  const addCustomer = useCallback(({ name, phone, serviceIds, barberChoice }) => {
    const current = loadQueueData();

    // Check active spot by phone: Waiting, Called, In chair
    const existingActive = current.queue.find(
      (item) => item.phone === phone && ['Waiting', 'Called', 'In chair'].includes(item.status)
    );

    if (existingActive) {
      return {
        success: false,
        existingToken: existingActive,
        message: 'You already have an active spot in the queue.',
      };
    }

    const selectedServices = SERVICES.filter((s) => serviceIds.includes(s.id));
    const totalMinutes = selectedServices.reduce((sum, s) => sum + s.minutes, 0);
    const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

    const nextCounter = current.tokenCounter + 1;
    const newTokenId = `S-${nextCounter}`;

    const newCustomer = {
      id: newTokenId,
      customerName: name.trim(),
      phone: phone.trim(),
      services: serviceIds,
      totalMinutes,
      totalPrice,
      barberChoice: barberChoice || 'any',
      status: 'Waiting',
      assignedBarber: null,
      createdAt: Date.now(),
      calledAt: null,
      startedAt: null,
      completedAt: null,
    };

    const updated = {
      ...current,
      tokenCounter: nextCounter,
      queue: [...current.queue, newCustomer],
    };

    saveQueueData(updated);
    setData(updated);
    return { success: true, token: newCustomer };
  }, []);

  const callNext = useCallback((barberId) => {
    const current = loadQueueData();
    const barberIndex = current.barbers.findIndex((b) => b.id === barberId);
    if (barberIndex === -1) return { error: 'Barber not found' };

    const barber = current.barbers[barberIndex];
    if (barber.onBreak) return { error: `${barber.name} is on break` };
    if (!barber.onDuty) return { error: `${barber.name} is not on duty` };

    // Barber has only one customer at a time
    if (barber.currentTokenId) {
      const existing = current.queue.find((c) => c.id === barber.currentTokenId);
      if (existing && ['Called', 'In chair'].includes(existing.status)) {
        return { error: `${barber.name} already has an active customer (${existing.id})` };
      }
    }

    // Pick earliest Waiting customer who chose this barber or 'any' (FIFO)
    const candidate = current.queue.find(
      (c) => c.status === 'Waiting' && (c.barberChoice === barberId || c.barberChoice === 'any')
    );

    if (!candidate) {
      return { error: `No one waiting for ${barber.name}` };
    }

    const updatedQueue = current.queue.map((c) => {
      if (c.id === candidate.id) {
        return {
          ...c,
          status: 'Called',
          assignedBarber: barberId,
          calledAt: Date.now(),
        };
      }
      return c;
    });

    const updatedBarbers = current.barbers.map((b) => {
      if (b.id === barberId) {
        return {
          ...b,
          status: 'busy',
          currentTokenId: candidate.id,
        };
      }
      return b;
    });

    const updated = {
      ...current,
      queue: updatedQueue,
      barbers: updatedBarbers,
    };

    saveQueueData(updated);
    setData(updated);
    return { success: true, customer: candidate };
  }, []);

  const startService = useCallback((barberId) => {
    const current = loadQueueData();
    const barber = current.barbers.find((b) => b.id === barberId);
    if (!barber || !barber.currentTokenId) return;

    const updatedQueue = current.queue.map((c) => {
      if (c.id === barber.currentTokenId && c.status === 'Called') {
        return {
          ...c,
          status: 'In chair',
          startedAt: Date.now(),
        };
      }
      return c;
    });

    const updated = {
      ...current,
      queue: updatedQueue,
    };

    saveQueueData(updated);
    setData(updated);
  }, []);

  const doneService = useCallback((barberId) => {
    const current = loadQueueData();
    const barber = current.barbers.find((b) => b.id === barberId);
    if (!barber || !barber.currentTokenId) return;

    const tokenId = barber.currentTokenId;

    const updatedQueue = current.queue.map((c) => {
      if (c.id === tokenId) {
        return {
          ...c,
          status: 'Done',
          completedAt: Date.now(),
        };
      }
      return c;
    });

    const updatedBarbers = current.barbers.map((b) => {
      if (b.id === barberId) {
        return {
          ...b,
          status: b.onBreak ? 'on_break' : 'free',
          currentTokenId: null,
        };
      }
      return b;
    });

    const updated = {
      ...current,
      queue: updatedQueue,
      barbers: updatedBarbers,
    };

    saveQueueData(updated);
    setData(updated);
  }, []);

  const markNoShow = useCallback((tokenId) => {
    const current = loadQueueData();
    const target = current.queue.find((c) => c.id === tokenId);
    if (!target) return;

    const assignedBarberId = target.assignedBarber;

    const updatedQueue = current.queue.map((c) => {
      if (c.id === tokenId) {
        return {
          ...c,
          status: 'No-show',
        };
      }
      return c;
    });

    const updatedBarbers = current.barbers.map((b) => {
      if (b.id === assignedBarberId && b.currentTokenId === tokenId) {
        return {
          ...b,
          status: b.onBreak ? 'on_break' : 'free',
          currentTokenId: null,
        };
      }
      return b;
    });

    const updated = {
      ...current,
      queue: updatedQueue,
      barbers: updatedBarbers,
    };

    saveQueueData(updated);
    setData(updated);
  }, []);

  const cancelSpot = useCallback((tokenId) => {
    const current = loadQueueData();
    const updatedQueue = current.queue.map((c) => {
      if (c.id === tokenId && c.status === 'Waiting') {
        return {
          ...c,
          status: 'Cancelled',
        };
      }
      return c;
    });

    const updated = {
      ...current,
      queue: updatedQueue,
    };

    saveQueueData(updated);
    setData(updated);
  }, []);

  const toggleBreak = useCallback((barberId) => {
    const current = loadQueueData();
    const barber = current.barbers.find((b) => b.id === barberId);
    if (!barber) return;

    // Cannot go on break while a customer is in the chair
    if (barber.currentTokenId) {
      const active = current.queue.find((c) => c.id === barber.currentTokenId);
      if (active && active.status === 'In chair') {
        return { error: 'Cannot go on break while customer is in the chair' };
      }
    }

    const nextOnBreak = !barber.onBreak;

    const updatedBarbers = current.barbers.map((b) => {
      if (b.id === barberId) {
        return {
          ...b,
          onBreak: nextOnBreak,
          status: nextOnBreak ? 'on_break' : b.currentTokenId ? 'busy' : 'free',
        };
      }
      return b;
    });

    const updated = {
      ...current,
      barbers: updatedBarbers,
    };

    saveQueueData(updated);
    setData(updated);
  }, []);

  const resetDemoData = useCallback(() => {
    const fresh = getInitialDemoData();
    saveQueueData(fresh);
    setData(fresh);
  }, []);

  return {
    ...data,
    addCustomer,
    callNext,
    startService,
    doneService,
    markNoShow,
    cancelSpot,
    toggleBreak,
    resetDemoData,
  };
}
