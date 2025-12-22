import React, { useState, useEffect } from 'react';
import InfoCard from './InfoCard';
import EditProfileForm from './EditProfileForm';
import EditAnswersForm from './EditAnswersForm';
import { User } from '../types';
import { auth, db } from '../firebase'; 
import { signOut, updatePassword } from 'firebase/auth'; 
import { doc, updateDoc, getDoc , setDoc ,serverTimestamp} from 'firebase/firestore'; 
import { useAuthState } from 'react-firebase-hooks/auth';
import { LogOut, ShieldCheck, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';
import dummyData from '../dummyData.json';
const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAnswers, setIsEditingAnswers] = useState(false);
  const [currentUser] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<User | null>(null);

  const [showPassModal, setShowPassModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      try {
        // ARTIK getDocs(questions) YAPMIYORUZ
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as User);
        }
      } catch (error) { 
        console.error("Veri çekme hatası:", error); 
      }
    };
    fetchUserData();
  }, [currentUser]);
const uploadDummyData = async () => {
  const dummyUsers = [dummyData];
  
  for (const user of dummyUsers) {
    const id = "dummy_" + Math.random().toString(36).substr(2, 9);
    await setDoc(doc(db, 'users', id), {
      ...user,
      uid: id,
      email: `${id}@homie.test`,
      matches: [],
      lastUpdated: serverTimestamp()
    });
  }
  alert("20 Dummy Kullanıcı Yüklendi!");
};

// Return içinde geçici bir buton:
<button onClick={uploadDummyData} className="bg-orange-500 p-2 rounded">Veri Yükle</button>
  const handleSaveProfile = async (updatedData: Partial<User>) => {
    if (!currentUser) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, updatedData);
      setUserProfile(prev => prev ? { ...prev, ...updatedData } : null);
      setIsEditing(false);
    } catch (error) { console.error("Profil güncellenemedi:", error); }
  };

  const handleSaveAnswers = async (updatedAnswers: User['answers']) => {
    if (!currentUser || !userProfile) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      // Soruları güncellerken kategorileri ve ağırlıkları koruduğumuzdan emin oluyoruz
      await updateDoc(userDocRef, { answers: updatedAnswers });
      setUserProfile(prev => prev ? { ...prev, answers: updatedAnswers } : null);
      setIsEditingAnswers(false);
    } catch (error) { console.error("Cevaplar güncellenemedi:", error); }
  };

  const handleUpdatePassword = async () => {
    if (!auth.currentUser || newPassword.length < 6) {
      setPassError('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    setPassLoading(true);
    setPassError('');
    try {
      await updatePassword(auth.currentUser, newPassword);
      setPassSuccess(true);
      setNewPassword('');
      setTimeout(() => { setShowPassModal(false); setPassSuccess(false); }, 2000);
    } catch (err: any) {
      setPassError('Güvenlik gereği tekrar giriş yapmanız gerekebilir.');
    } finally { setPassLoading(false); }
  };

  const handleLogout = async () => {
    if (window.confirm('Oturumu kapatmak istediğinize emin misiniz?')) {
      try { await signOut(auth); } catch (error) { console.error("Hata:", error); }
    }
  };

  if (!userProfile) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
       <div className="text-indigo-400 font-bold animate-pulse tracking-widest uppercase text-xs">Profil Yükleniyor...</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 pt-10 pb-20 space-y-8 min-h-screen bg-gray-900">
      <div className="flex justify-center items-start">
        {isEditingAnswers ? (
          <EditAnswersForm 
            answers={userProfile.answers} 
            onSave={handleSaveAnswers} 
            onCancel={() => setIsEditingAnswers(false)} 
          />
        ) : isEditing ? (
          <EditProfileForm 
            user={userProfile} 
            onSave={handleSaveProfile} 
            onCancel={() => setIsEditing(false)} 
          />
        ) : (
          <InfoCard 
            user={userProfile} 
            onEditProfile={() => setIsEditing(true)} 
            onEditAnswers={() => setIsEditingAnswers(true)} 
          />
        )}
      </div>

      {!isEditing && !isEditingAnswers && (
        <div className="max-w-md mx-auto bg-gray-800/30 rounded-[32px] p-8 border border-gray-700/50 shadow-2xl mt-10">
          <div className="flex items-center gap-2 mb-8 text-gray-500">
            <ShieldCheck size={18} />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Güvenlik ve Hesap</h3>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={() => setShowPassModal(true)}
              className="w-full flex items-center justify-between p-5 bg-gray-700/20 hover:bg-gray-700/40 rounded-[24px] border border-gray-700/50 transition-all text-white group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400"><KeyRound size={20} /></div>
                <span className="font-bold text-sm tracking-tight">Şifreyi Güncelle</span>
              </div>
              <ArrowRight size={18} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-5 bg-red-500/5 hover:bg-red-500/10 rounded-[24px] border border-red-500/10 transition-all text-red-400"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-red-500/10 rounded-xl"><LogOut size={20} /></div>
                <span className="font-bold text-sm tracking-tight">Oturumu Sonlandır</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ŞİFRE MODAL (Aynı kalıyor) */}
      {showPassModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-[40px] p-10 max-w-sm w-full shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-2 tracking-tighter italic">GÜVENLİK</h3>
            <p className="text-gray-400 text-xs mb-8 uppercase font-bold tracking-widest">Yeni Şifre Belirle</p>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-2xl p-5 mb-6 outline-none focus:border-indigo-500 transition-colors"
            />
            {passError && <p className="text-red-400 text-[10px] mb-4 font-bold uppercase">{passError}</p>}
            <div className="flex gap-4">
              <button onClick={() => setShowPassModal(false)} className="flex-1 px-4 py-4 bg-gray-700 text-white rounded-2xl font-bold text-sm">İptal</button>
              <button onClick={handleUpdatePassword} className="flex-1 px-4 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-tight">Onayla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;