import React from 'react';
import { CURRENT_USER_PROFILE } from '../constants';

const ProfileScreen: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      
      {/* Profile Details Section */}
      <div className="bg-[#1f2937] rounded-lg border border-gray-700 overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-lg font-medium text-gray-200">Profilim</h2>
          <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-1.5 rounded transition-colors">
            Düzenle
          </button>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">Görünen İsim</p>
            <p className="text-sm text-gray-300">-</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">E-posta</p>
            <p className="text-sm text-gray-300">-</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Yaş</p>
            <p className="text-sm text-gray-300">{CURRENT_USER_PROFILE.age}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Meslek</p>
            <p className="text-sm text-gray-300">{CURRENT_USER_PROFILE.job}</p>
          </div>
        </div>
      </div>

      {/* Lifestyle Answers Section */}
      <div className="bg-[#1f2937] rounded-lg border border-gray-700 overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-lg font-medium text-gray-200">Yaşam Tarzı Cevaplarım</h2>
          <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-1.5 rounded transition-colors">
            Düzenle
          </button>
        </div>
        <div className="p-4 space-y-3">
          {CURRENT_USER_PROFILE.answers.map((item, idx) => (
            <div key={idx} className="bg-[#1a2332] rounded p-3 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-300">{item.text}</span>
              <span className={`text-xs px-3 py-1 rounded-full border ${
                item.type === 'positive' ? 'border-green-800 text-green-500' :
                item.type === 'negative' ? 'border-red-800 text-red-500' :
                'border-orange-800 text-orange-500'
              }`}>
                {item.answer}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Account Section */}
      <div className="bg-[#1f2937] rounded-lg border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-medium text-gray-200">Hesap</h2>
        </div>
        <div className="p-6">
          <button className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded transition-colors shadow-sm">
            Çıkış Yap
          </button>
        </div>
      </div>

    </div>
  );
};

export default ProfileScreen;
