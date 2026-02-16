import React from 'react';
import { Briefcase, DollarSign, Home, Pencil, Settings } from 'lucide-react';
import { User } from '../types';

interface InfoCardProps {
  user: User;
  onEditProfile?: () => void; 
  onEditAnswers?: () => void;
}

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-4">
    {icon}
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-200">{value}</p>
    </div>
  </div>
);

const InfoCard: React.FC<InfoCardProps> = ({ user, onEditProfile, onEditAnswers }) => {
  return (
    <div className="bg-[#1f2937] rounded-xl p-6 shadow-xl w-full md:w-80 h-full flex flex-col border border-gray-700">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-gray-100">{user.name}, {user.age}</h2>
          <div className="h-0.5 w-20 bg-indigo-500 mt-2"></div>
        </div>
        
        {/* Sadece onEditProfile varsa Pencil ikonunu göster */}
        {onEditProfile && (
          <button 
            onClick={onEditProfile}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-indigo-400 transition-colors shadow-md"
            title="Profili Düzenle"
          >
            <Pencil size={18} />
          </button>
        )}
      </div>

      <div className="space-y-6 flex-1">
        <InfoItem 
          icon={<Briefcase className="text-gray-300 mt-1" size={20} />}
          label="İşi / Bölümü"
          value={user.job || 'Belirtilmemiş'}
        />
        <InfoItem 
          icon={<DollarSign className="text-gray-300 mt-1" size={20} />}
          label="Bütçe"
          value={user.budget ? `₺${user.budget}` : 'Belirtilmemiş'}
        />
        <InfoItem 
          icon={<Home className="text-gray-300 mt-1" size={20} />}
          label="Evi var mı?"
          value={user.hasHouse ? 'Evet' : 'Hayır'}
        />
      </div>

      <div className="mt-6 pt-4 border-t border-gray-600">
        <p className="text-sm font-semibold text-gray-300 mb-2">Önemli Özellikler</p>
        <p className="text-xs text-gray-400 italic mb-6">
          {user.description || 'Henüz bir açıklama eklenmemiş.'}
        </p>
        
        {/* Sadece onEditAnswers varsa "Soruları Düzenle" butonunu göster */}
        {onEditAnswers && (
          <button 
            onClick={onEditAnswers}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all font-medium text-sm shadow-lg"
          >
            <Settings size={18} />
            Soruları Düzenle
          </button>
        )}
      </div>
    </div>
  );
};

export default InfoCard;