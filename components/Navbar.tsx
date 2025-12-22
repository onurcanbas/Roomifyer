import React from 'react';
import { Home, User, MessageSquare } from 'lucide-react';
import { ViewState } from '../types';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  hasUnread: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, hasUnread }) => {
  return (
    <nav className="bg-[#1f2937] border-b border-gray-800 px-4 py-3 flex justify-between items-center sticky top-0 z-50">
      {/* SOL TARAF: Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="font-bold text-white text-xl italic">R</span>
        </div>
        <span className="font-bold text-xl tracking-tight hidden sm:block text-white">ROOMIFYER</span>
      </div>

      {/* ORTA TARAF: Navigasyon Butonları */}
      <div className="flex items-center bg-[#111827] rounded-xl p-1 shadow-inner translate-x-4 md:translate-x-0">
        <button
          onClick={() => setView('profile')}
          className={`p-2 rounded-lg transition-all ${currentView === 'profile' ? 'text-white bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <User size={24} />
        </button>
        <button
          onClick={() => setView('home')}
          className={`p-2 rounded-lg transition-all ${currentView === 'home' ? 'text-white bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Home size={24} />
        </button>
        
        <button
          onClick={() => setView('chat')}
          className={`relative p-2 rounded-lg transition-all ${currentView === 'chat' ? 'text-white bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <MessageSquare size={24} />
          {hasUnread && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-[#111827]"></span>
            </span>
          )}
        </button>
      </div>

      {/* SAĞ TARAF: Boş Bırakıldı (Profil simgesi kaldırıldı) */}
      <div className="w-10 sm:w-20 md:w-24"></div>
    </nav>
  );
};

export default Navbar;