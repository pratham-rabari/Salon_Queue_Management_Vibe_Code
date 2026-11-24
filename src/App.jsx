import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import JoinQueue from './pages/JoinQueue';
import MyStatus from './pages/MyStatus';
import Reception from './pages/Reception';
import BarberView from './pages/BarberView';
import TvDisplay from './pages/TvDisplay';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#111827] text-gray-100 flex flex-col font-sans selection:bg-[#D4A017] selection:text-black">
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/join" element={<JoinQueue />} />
            <Route path="/status/:id" element={<MyStatus />} />
            <Route path="/reception" element={<Reception />} />
            <Route path="/barber/:name" element={<BarberView />} />
            <Route path="/display" element={<TvDisplay />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
