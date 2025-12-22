import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail // Şifre sıfırlama fonksiyonu eklendi
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Mail, Lock, User, ArrowRight, Loader2, ChevronLeft, Send } from 'lucide-react';

const LoginScreen = () => {
  // 'login', 'register' veya 'forgot-password' modlarını yönetir
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (mode === 'login') {
        // GİRİŞ YAPMA
        await signInWithEmailAndPassword(auth, email, password);
      } else if (mode === 'register') {
        // KAYIT OLMA
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: name,
          email: email,
          age: 20,
          job: '',
          budget: 0,
          hasHouse: false,
          avatarColor: 'bg-indigo-500',
          description: '',
          matches: [],
          answers: []
        });
      } else if (mode === 'forgot-password') {
        // ŞİFRE SIFIRLAMA E-POSTASI GÖNDERME
        await sendPasswordResetEmail(auth, email);
        setSuccessMsg('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
      }
    } catch (err: any) {
      if (mode === 'forgot-password' && err.code === 'auth/user-not-found') {
        setError('Bu e-posta adresine kayıtlı bir kullanıcı bulunamadı.');
      } else {
        setError('Bir hata oluştu. Lütfen bilgilerinizi kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* LOGO BÖLÜMÜ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/20">
            <span className="text-white text-3xl font-black italic">H</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ROOMIFYER</h1>
          <p className="text-gray-400 mt-2">
            {mode === 'login' ? 'Tekrar hoş geldin!' : 
             mode === 'register' ? 'Yeni bir hesap oluştur.' : 
             'Şifreni sıfırla.'}
          </p>
        </div>

        {/* ANA KART */}
        <div className="bg-[#1f2937] border border-gray-800 rounded-[32px] p-8 shadow-2xl">
          <form onSubmit={handleAuth} className="space-y-5">
            {mode === 'register' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Ad Soyad"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#111827] border border-gray-700 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="email"
                placeholder="E-posta Adresi"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111827] border border-gray-700 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {mode !== 'forgot-password' && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="password"
                  placeholder="Şifre"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#111827] border border-gray-700 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setMode('forgot-password'); setError(''); }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Şifremi Unuttum
                </button>
              </div>
            )}

            {error && <p className="text-red-400 text-sm text-center px-2">{error}</p>}
            {successMsg && <p className="text-green-400 text-sm text-center px-2">{successMsg}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : mode === 'forgot-password' ? (
                <>Bağlantı Gönder <Send size={20} /></>
              ) : (
                <>{mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'} <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          {/* ALT GEÇİŞ BUTONLARI */}
          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            {mode === 'forgot-password' ? (
              <button
                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                <ChevronLeft size={16} /> Giriş Ekranına Dön
              </button>
            ) : (
              <p className="text-gray-400 text-sm">
                {mode === 'login' ? 'Henüz hesabın yok mu?' : 'Zaten üye misin?'}
                <button
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setError('');
                  }}
                  className="ml-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
                >
                  {mode === 'login' ? 'Hemen Kayıt Ol' : 'Giriş Yap'}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;