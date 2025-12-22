import React, { useState } from 'react';
import { User } from '../types';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Camera, Loader2, X, Briefcase, Banknote, Home } from 'lucide-react';

interface EditProfileFormProps {
  user: User;
  onSave: (data: Partial<User>) => Promise<void>;
  onCancel: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState(user);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `profiles/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData({ ...formData, photoUrl: url });
    } catch (error) {
      console.error("Resim yükleme hatası:", error);
      alert("Resim yüklenirken bir hata oluştu.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-gray-800 rounded-[40px] p-8 md:p-10 border border-gray-700 shadow-2xl animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Profili Düzenle</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Kişisel Bilgiler ve Tercihler</p>
        </div>
        <button onClick={onCancel} className="p-2 bg-gray-700/50 hover:bg-gray-700 rounded-xl text-gray-400 hover:text-white transition-all"><X size={24} /></button>
      </div>

      <div className="space-y-8">
        {/* RESİM YÜKLEME ALANI */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className={`w-32 h-32 rounded-[32px] overflow-hidden border-4 border-gray-700 ${formData.avatarColor} flex items-center justify-center shadow-2xl`}>
              {formData.photoUrl ? (
                <img src={formData.photoUrl} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <span className="text-5xl font-black text-white opacity-40 uppercase">{formData.name[0]}</span>
              )}
              
              {uploading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" />
                </div>
              )}
            </div>
            
            <label className="absolute -bottom-2 -right-2 bg-indigo-600 p-3.5 rounded-2xl cursor-pointer hover:bg-indigo-700 transition-all shadow-2xl border-4 border-gray-800 active:scale-90">
              <Camera size={20} className="text-white" />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={uploading} />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* İSİM ALANI */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 ml-1 uppercase tracking-widest">İsim Soyisim</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-white font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          {/* YAŞ ALANI */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 ml-1 uppercase tracking-widest">Yaş</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
              className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-white font-bold focus:border-indigo-500 outline-none"
            />
          </div>

          {/* MESLEK ALANI */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 ml-1 uppercase tracking-widest flex items-center gap-1">
              <Briefcase size={12} /> Meslek / Durum
            </label>
            <input
              type="text"
              placeholder="Örn: Yazılım Mühendisi, Öğrenci"
              value={formData.job}
              onChange={(e) => setFormData({ ...formData, job: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-white font-bold focus:border-indigo-500 outline-none"
            />
          </div>

          {/* BÜTÇE ALANI */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 ml-1 uppercase tracking-widest flex items-center gap-1">
              <Banknote size={12} /> Aylık Bütçe (₺)
            </label>
            <input
              type="number"
              placeholder="Örn: 7500"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
              className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-white font-bold focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* EV DURUMU ALANI (Toggle) */}
        <div className="bg-gray-900/50 p-6 rounded-[28px] border border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${formData.hasHouse ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-500'}`}>
              <Home size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight">Kullanıma Hazır Evim Var</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Eşleşme algoritmasını etkiler</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setFormData({ ...formData, hasHouse: !formData.hasHouse })}
            className={`w-14 h-8 rounded-full relative transition-all duration-300 ${formData.hasHouse ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md ${formData.hasHouse ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* AÇIKLAMA ALANI */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 ml-1 uppercase tracking-widest">Hakkımda</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Kendinden bahset..."
            rows={3}
            className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-white font-medium focus:border-indigo-500 outline-none resize-none"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-2xl transition-all"
          >
            Vazgeç
          </button>
          <button
            onClick={() => onSave(formData)}
            disabled={uploading}
            className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            Değişiklikleri Uygula
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileForm;