import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Clock } from 'lucide-react';
import { SALON_INFO } from '../constants';

export default function Header({ showBack = false, title = null }) {
  return (
    <header className="bg-[#1F2937] border-b border-gray-800 px-4 py-3 sticky top-0 z-40">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-[#D4A017]/20 border border-[#D4A017] flex items-center justify-center text-[#D4A017] group-hover:scale-105 transition-transform">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base text-gray-100 leading-tight">
              {title || SALON_INFO.name}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Open · Closes {SALON_INFO.closeHour > 12 ? `${SALON_INFO.closeHour - 12} PM` : `${SALON_INFO.closeHour} AM`}</span>
            </div>
          </div>
        </Link>
        {showBack && (
          <Link
            to="/"
            className="text-xs font-medium text-gray-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
          >
            ← Home
          </Link>
        )}
      </div>
    </header>
  );
}
