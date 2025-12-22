import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from './firebase';
import Navbar from './components/Navbar';
import MatchingScreen from './components/MatchingScreen';
import ProfilePage from './components/ProfilePage';
import ChatScreen from './components/ChatScreen';
import LoginScreen from './components/LoginScreen';
import OnboardingScreen from './components/OnboardingScreen'; // Yeni ekledik
import { ViewState, ChatMatch, User } from './types';
import { Loader2 } from 'lucide-react';
import { 
  doc, getDoc, onSnapshot, updateDoc, arrayUnion, 
  collectionGroup, query, where 
} from 'firebase/firestore';
import { Toaster, toast } from 'react-hot-toast';

function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [matches, setMatches] = useState<ChatMatch[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userProfileData, setUserProfileData] = useState<User | null>(null);

  // 1. Auth Durumu
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setAuthLoading(false);
        setUserProfileData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Profil Verisi ve Onboarding Kontrolü
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as User;
        setUserProfileData(data);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 3. Eşleşmeler ve Unread Mesaj dinleyicileri (Kodun geri kalanı aynı...)
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    const q = query(collectionGroup(db, 'messages'), where('to', '==', user.uid), where('read', '==', false));
    const unsubscribe = onSnapshot(q, (snapshot) => setUnreadCount(snapshot.size));
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) { setMatches([]); setMatchesLoading(false); return; }
    setMatchesLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, async (userDoc) => {
      if (userDoc.exists()) {
        const matchIds = userDoc.data().matches || [];
        if (matchIds.length > 0) {
          const matchProfiles = await Promise.all(matchIds.map(async (id: string) => {
            const matchDoc = await getDoc(doc(db, 'users', id));
            return matchDoc.exists() ? { uid: id, ...matchDoc.data() } as User : null;
          }));
          setMatches(matchProfiles.filter((p): p is User => p !== null).map(profile => ({
            id: profile.uid, name: profile.name, message: 'Sohbeti başlat...', time: '', avatarColor: profile.avatarColor || 'bg-blue-500'
          })));
        } else { setMatches([]); }
      }
      setMatchesLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleNewMatch = async (matchedUser: User) => {
    if (!user || user.uid === matchedUser.uid || matches.some(m => m.id === matchedUser.uid)) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { matches: arrayUnion(matchedUser.uid) });
      await updateDoc(doc(db, 'users', matchedUser.uid), { matches: arrayUnion(user.uid) });
    } catch (error) { console.error(error); }
  };

  // --- RENDER MANTIĞI ---

  if (authLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#111827]">
      <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
      <p className="text-gray-400">Roomifyer hazırlanıyor...</p>
    </div>
  );

  if (!user) return <LoginScreen />;

  // BEKÇİ: Eğer kullanıcı mülakatı tamamlamadıysa Onboarding'e zorla
  // isOnboarded alanı false ise veya hiç yoksa (answers boşsa) mülakat açılır.
  if (userProfileData && (!userProfileData.isOnboarded || !userProfileData.answers || userProfileData.answers.length === 0)) {
    return <OnboardingScreen onComplete={() => {
        toast.success("Mülakat başarıyla tamamlandı! Yapay zeka eşleşmeleri hazırlıyor.");
        // Sayfayı yenilemeye gerek kalmadan onSnapshot zaten veriyi güncelleyecek
    }} />;
  }

  return (
    <div className="min-h-screen bg-[#111827] text-gray-100 font-sans">
      <Toaster position="top-center" />
      <Navbar currentView={currentView} setView={setCurrentView} hasUnread={unreadCount > 0} />
      <main className="w-full">
        {currentView === 'home' && <MatchingScreen onMatch={handleNewMatch} onGoToChat={() => setCurrentView('chat')} />}
        {currentView === 'profile' && <ProfilePage />}
        {currentView === 'chat' && <ChatScreen matches={matches} isLoading={matchesLoading} />}
      </main>
    </div>
  );
}

export default App;