import React, { useState, useEffect } from 'react';
import { X, Heart, CheckCircle, Loader2, Filter, Zap, Sparkles, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { collection, getDocs, doc, setDoc, getDoc, serverTimestamp, addDoc, query, where, limit } from 'firebase/firestore';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { db, auth } from '../firebase';
import InfoCard from './InfoCard';
import LifestyleCard from './LifestyleCard';
import { User, FilterSettings } from '../types';

interface MatchingScreenProps {
  onMatch: (user: User) => void;
  onGoToChat: () => void;
}

const MatchingScreen: React.FC<MatchingScreenProps> = ({ onMatch, onGoToChat }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserData, setCurrentUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState<string | null>(null);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [mlPreferenceVector, setMlPreferenceVector] = useState<{avgAge: number, avgBudget: number} | null>(null);

  const [filters, setFilters] = useState<FilterSettings>({
    maxAge: 60,
    maxBudget: 100000,
    mustHaveHouse: false
  });

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const myUid = auth.currentUser?.uid;
        if (!myUid) return;

        const querySnapshot = await getDocs(collection(db, "users"));
        const allUsersParsed: User[] = querySnapshot.docs.map((doc: any) => {
          const data = doc.data();
          return {
            uid: doc.id,
            ...data,
            age: parseInt(data.age) || 20,
            budget: data.budget || 0,
          } as User;
        });

        const me = allUsersParsed.find(u => u.uid === myUid);
        const others = allUsersParsed.filter(u => u.uid !== myUid);

        if (me) setCurrentUserData(me);
        setUsers(others);
        await fetchMLPreferences(myUid);
      } catch (error) {
        console.error("Yükleme hatası:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, [currentIndex]);

  const fetchMLPreferences = async (uid: string) => {
    try {
      const q = query(collection(db, 'user_behavior'), where('userId', '==', uid), where('action', '==', 'right'), limit(15));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const behaviors = snap.docs.map(d => d.data());
        const avgAge = behaviors.reduce((acc, b) => acc + b.targetUserFeatures.age, 0) / behaviors.length;
        const avgBudget = behaviors.reduce((acc, b) => acc + b.targetUserFeatures.budget, 0) / behaviors.length;
        setMlPreferenceVector({ avgAge, avgBudget });
      }
    } catch (e) { console.error(e); }
  };

  const getDetailedAnalysis = (otherUser: User) => {
    if (!currentUserData || !otherUser || !otherUser.answers) return null;

    const categories = {
      "Alışkanlıklar": { earned: 0, total: 0 },
      "Sosyal Yaşam": { earned: 0, total: 0 },
      "Paylaşım": { earned: 0, total: 0 }
    };

    currentUserData.answers.forEach(myAns => {
      const otherAns = otherUser.answers.find(oa => oa.text === myAns.text);
      const weight = myAns.weight || 5;
      const cat = myAns.category as keyof typeof categories;

      if (categories[cat]) {
        categories[cat].total += weight;
        if (otherAns && myAns.answer === otherAns.answer) {
          categories[cat].earned += weight;
        }
      }
    });

    const scores = {
      habit: categories["Alışkanlıklar"].total > 0 ? Math.round((categories["Alışkanlıklar"].earned / categories["Alışkanlıklar"].total) * 100) : 0,
      social: categories["Sosyal Yaşam"].total > 0 ? Math.round((categories["Sosyal Yaşam"].earned / categories["Sosyal Yaşam"].total) * 100) : 0,
      logistics: categories["Paylaşım"].total > 0 ? Math.round((categories["Paylaşım"].earned / categories["Paylaşım"].total) * 100) : 0,
    };

    const budgetDiff = Math.abs(currentUserData.budget - otherUser.budget);
    const budgetScore = Math.max(0, 100 - (budgetDiff / 1000) * 10);
    const overall = Math.round(((scores.habit + scores.social + scores.logistics) / 3) * 0.7 + budgetScore * 0.3);

    return { ...scores, budget: budgetScore, overall };
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    const activeUser = filteredUsers[currentIndex];
    if (!activeUser || !auth.currentUser) return;
    setLastDirection(direction);

    try {
      await addDoc(collection(db, 'user_behavior'), {
        userId: auth.currentUser.uid,
        targetUserId: activeUser.uid,
        action: direction,
        targetUserFeatures: { age: activeUser.age, budget: activeUser.budget },
        timestamp: serverTimestamp()
      });

      if (direction === 'right') {
        await setDoc(doc(db, 'likes', `${auth.currentUser.uid}_${activeUser.uid}`), { from: auth.currentUser.uid, to: activeUser.uid, timestamp: serverTimestamp() });
        const rev = await getDoc(doc(db, 'likes', `${activeUser.uid}_${auth.currentUser.uid}`));
        if (rev.exists()) {
          onMatch(activeUser);
          setMatchedUser(activeUser);
        } else { setCurrentIndex(prev => prev + 1); }
      } else { setCurrentIndex(prev => prev + 1); }
    } catch (e) { console.error(e); setCurrentIndex(prev => prev + 1); }
    setTimeout(() => { setLastDirection(null); setShowAnalysis(false); }, 300);
  };

  const filteredUsers = users.filter(u => u.age <= filters.maxAge && (filters.maxBudget === 100000 || u.budget <= filters.maxBudget) && (!filters.mustHaveHouse || u.hasHouse));
  const activeUser = filteredUsers[currentIndex];
  const analysis = activeUser ? getDetailedAnalysis(activeUser) : null;

  const radarData = analysis ? [
    { subject: 'Alışkanlık', A: analysis.habit, fullMark: 100 },
    { subject: 'Sosyal', A: analysis.social, fullMark: 100 },
    { subject: 'Paylaşım', A: analysis.logistics, fullMark: 100 },
    { subject: 'Bütçe', A: analysis.budget, fullMark: 100 },
    { subject: 'Genel', A: analysis.overall, fullMark: 100 },
  ] : [];

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0F172A]">
      <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
      <p className="text-gray-500 font-black text-[10px] tracking-[0.3em] uppercase">Hibrit Analiz Motoru v3.1</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-[#0F172A] overflow-x-hidden relative">
      {/* FILTER BUTTON */}
      <div className="absolute top-6 right-6 z-[60]">
        <button onClick={() => setShowFilters(!showFilters)} className={`p-4 rounded-[20px] border transition-all ${showFilters ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/30' : 'bg-gray-800 border-gray-700 text-indigo-400'}`}>
          <Filter size={24} />
        </button>
      </div>

      {!activeUser ? (
        <div className="mt-40 text-center">
          <div className="bg-indigo-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/20 shadow-2xl"><CheckCircle size={48} className="text-indigo-500"/></div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Aday Kalmadı</h2>
          <button onClick={()=>setCurrentIndex(0)} className="mt-8 bg-indigo-600 text-white px-10 py-4 rounded-[24px] font-black hover:bg-indigo-500 transition-all italic uppercase tracking-tighter shadow-lg shadow-indigo-600/30 text-sm">Listeyi Sıfırla</button>
        </div>
      ) : (
        <div className={`flex flex-col lg:flex-row gap-12 items-center lg:items-start justify-center w-full max-w-7xl pt-10 transition-all duration-500 ${matchedUser ? 'blur-3xl scale-95 pointer-events-none' : ''}`}>
          
          <div className="w-full lg:w-80 space-y-4 order-2 lg:order-1 opacity-90 transition-opacity hover:opacity-100">
            <InfoCard user={activeUser} />
            <LifestyleCard user={activeUser} />
          </div>

          <div className="flex flex-col items-center relative order-1 lg:order-2 flex-1 max-w-[450px]">
            {/* MATCH SCORE */}
            <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-40 bg-indigo-600 px-8 py-3 rounded-[24px] border-2 border-indigo-400 shadow-2xl animate-pulse">
              <Sparkles size={18} className="text-yellow-300 fill-yellow-300 inline-block mr-2" />
              <span className="text-white font-black text-2xl tracking-tighter">%{analysis?.overall || 0} UYUM</span>
            </div>

            {/* AVATAR/RESİM KARTI */}
            <div className={`relative w-full aspect-[3.5/4.5] rounded-[64px] overflow-hidden border-[6px] border-gray-800 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.7)] ${activeUser.avatarColor} transition-all duration-300 ${lastDirection === 'left' ? '-translate-x-40 opacity-0 rotate-[-12deg]' : lastDirection === 'right' ? 'translate-x-40 opacity-0 rotate-[12deg]' : ''}`}>
              {activeUser.photoUrl ? (
                <img src={activeUser.photoUrl} className="w-full h-full object-cover" alt={activeUser.name} />
              ) : (
                <span className="text-[12rem] font-black text-white/10 uppercase tracking-tighter">{activeUser?.name ? activeUser.name[0] : '?'}</span>
              )}
              <div className="absolute bottom-0 w-full p-10 bg-gradient-to-t from-black via-black/40 to-transparent">
                <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">{activeUser.name}, {activeUser.age}</h2>
                <div className="flex gap-2 mt-4">
                   <span className="bg-indigo-600/40 text-white border border-indigo-400/30 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest leading-none flex items-center">{activeUser.job}</span>
                   {analysis && analysis.overall > 85 && (
                     <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest leading-none flex items-center">AI Önerisi</span>
                   )}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-12 mt-10">
              <button onClick={() => handleSwipe('left')} className="w-16 h-16 bg-gray-800 rounded-[28px] flex items-center justify-center text-red-500 border-2 border-gray-700 shadow-xl hover:scale-110 active:scale-95 transition-all"><X size={32} strokeWidth={3} /></button>
              <button onClick={() => handleSwipe('right')} className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-indigo-600/30 hover:scale-110 active:scale-95 transition-all"><Heart size={40} fill="currentColor"/></button>
            </div>

            {/* RADAR CHART VE ANALİZ PANELİ */}
            <div className="w-full mt-10 bg-gray-800/40 border border-gray-700/50 rounded-[40px] overflow-hidden shadow-2xl">
              <button onClick={() => setShowAnalysis(!showAnalysis)} className="w-full py-6 px-10 flex items-center justify-between text-white font-black text-sm transition-all hover:bg-gray-800/60">
                <div className="flex items-center gap-4"><BarChart3 size={20} className="text-indigo-400"/> <span className="tracking-widest italic uppercase text-xs">Açıklanabilir AI Raporu</span></div>
                {showAnalysis ? <ChevronUp size={24}/> : <ChevronDown size={24}/>}
              </button>
              
              {showAnalysis && analysis && (
                <div className="p-10 pt-0 space-y-8 animate-in slide-in-from-top-4 duration-500">
                  <div className="w-full h-64 bg-gray-900/50 rounded-[32px] p-2 border border-gray-700/30">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }} />
                        <Radar name="Uyum" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {[
                      { label: "Alışkanlık Uyumu", val: analysis.habit, col: "bg-emerald-500", icon: "🏠" },
                      { label: "Sosyal Yaşam Paralelliği", val: analysis.social, col: "bg-blue-500", icon: "🎉" },
                      { label: "Paylaşım ve Düzen", val: analysis.logistics, col: "bg-purple-500", icon: "🧹" },
                      { label: "Bütçe Vektörü", val: analysis.budget, col: "bg-amber-500", icon: "💰" }
                    ].map((item, i) => (
                      <div key={i} className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">{item.icon} {item.label}</span>
                          <span className="text-white font-black text-xs tracking-tighter leading-none">%{item.val}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
                          <div className={`h-full ${item.col} shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-1000 ease-out`} style={{width: `${item.val}%`}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* SAĞ TARAF SMART INSIGHT */}
          <div className="hidden lg:block lg:w-80 order-3 pt-4">
             <div className="p-8 bg-indigo-600/5 border border-indigo-500/10 rounded-[48px] text-center shadow-inner">
                <Zap size={32} className="text-indigo-500 mx-auto mb-6 opacity-30"/>
                <h4 className="text-white font-black text-[10px] tracking-widest mb-4 italic uppercase">Vektörel Karar Destek</h4>
                <p className="text-gray-500 text-[11px] leading-relaxed font-bold uppercase tracking-tighter">
                  Algoritma, statik mülakat verilerini Euclidean mesafe metrikleri ile bütçe vektörünüze asimile ederek en doğru eşleşmeyi tahmin eder.
                </p>
             </div>
          </div>
        </div>
      )}

      {/* MATCH MODAL (SORUNU ÇÖZEN KISIM) */}
      {matchedUser && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl p-6">
          <div className="bg-indigo-600 p-8 md:p-12 rounded-[48px] text-center shadow-2xl border-2 border-indigo-400 max-w-lg w-full animate-in zoom-in-95 duration-300 relative overflow-hidden">
            {/* Arka plan süsü */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-white to-yellow-400 animate-pulse" />
            
            <Sparkles size={64} className="text-yellow-300 mx-auto mb-6 animate-bounce" />
            
            <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">
              HARİKA!<br/>EŞLEŞTİNİZ
            </h2>
            
            <p className="text-indigo-100 text-lg mb-10 font-medium">
              <span className="font-black text-white">{matchedUser.name}</span> ile yaşam tarzınızdaki uyum algoritmalarımız tarafından onaylandı.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => { setMatchedUser(null); setCurrentIndex(prev => prev + 1); }}
                className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white rounded-[24px] font-black uppercase text-xs tracking-widest transition-all border border-white/20"
              >
                Keşfetmeye Devam Et
              </button>
              <button 
                onClick={onGoToChat}
                className="px-10 py-5 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-[0_10px_30px_rgba(250,204,21,0.4)] transition-all transform hover:scale-105 active:scale-95"
              >
                Hemen Mesaj At
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingScreen;