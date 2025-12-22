import React from 'react';
import { X, MapPin, Briefcase, Wallet, Home, Star } from 'lucide-react';
import { ChatMatch } from '../types';

const UserProfileView: React.FC<{ user: ChatMatch; onClose: () => void }> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a2332] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[40px] border border-gray-700 shadow-2xl relative animate-in zoom-in-95 duration-300">
        
        {/* Kapatma Butonu */}
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white z-10">
          <X size={24} />
        </button>

        {/* Header / Avatar Bölümü */}
        <div className={`h-48 w-full ${user.avatarColor || 'bg-indigo-600'} flex items-center justify-center relative`}>
          <span className="text-8xl font-black text-white/20 uppercase tracking-tighter">{user.name[0]}</span>
          <div className="absolute -bottom-12 left-10 w-24 h-24 rounded-3xl bg-gray-900 border-4 border-[#1a2332] flex items-center justify-center shadow-xl">
             <span className="text-4xl font-bold text-white uppercase">{user.name[0]}</span>
          </div>
        </div>

        <div className="p-10 pt-16">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">{user.name}, {user.age}</h2>
              <p className="text-indigo-400 font-bold flex items-center gap-2 mt-1"><Briefcase size={16}/> {user.job}</p>
            </div>
          </div>

          {/* Temel Bilgiler Kartları */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-gray-800/50 p-4 rounded-3xl border border-gray-700/50">
              <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Aylık Bütçe</div>
              <div className="text-white font-bold flex items-center gap-2"><Wallet size={18} className="text-emerald-500"/> {user.budget} TL</div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-3xl border border-gray-700/50">
              <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Ev Durumu</div>
              <div className="text-white font-bold flex items-center gap-2"><Home size={18} className="text-amber-500"/> {user.hasHouse ? 'Evi Var' : 'Ev Arıyor'}</div>
            </div>
          </div>

          {/* Yaşam Tarzı Detayları (Anket Cevapları) */}
          <div className="space-y-6">
            <h4 className="text-white font-black text-xs tracking-[0.3em] uppercase border-b border-gray-700 pb-2">Yaşam Tarzı Analizi</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.answers?.map((ans, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter italic">{ans.text}</span>
                  <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-2xl">
                    <span className="text-indigo-200 font-bold text-xs italic">{ans.answer}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;