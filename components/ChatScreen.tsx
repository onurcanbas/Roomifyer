import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, limit, doc, updateDoc, getDoc 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { ChatMatch, Message } from '../types';
import { Send, ArrowLeft, MessageCircle, X, Briefcase, Wallet, Home, Star } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';

// --- YARDIMCI FONKSİYONLAR ---
const getChatId = (u1: string, u2: string) => u1 > u2 ? `${u1}_${u2}` : `${u2}_${u1}`;

const formatTime = (ts: any) => {
  if (!ts?.toDate) return 'Şimdi';
  const d = ts.toDate();
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
};

// --- MODAL: PROFIL DETAYI ---
const UserProfileView: React.FC<{ user: ChatMatch; onClose: () => void }> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-[#1a2332] w-full max-w-xl max-h-[90dvh] overflow-y-auto rounded-[40px] border border-gray-700 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white z-10"><X size={24} /></button>
        <div className={`h-40 w-full ${user.avatarColor || 'bg-indigo-600'} flex items-center justify-center relative`}>
          <span className="text-9xl font-black text-white/10 uppercase select-none">{user.name?.[0]}</span>
        </div>
        <div className="p-8 pt-6">
          <h2 className="text-4xl font-black text-white italic uppercase">{user.name}, {user.age}</h2>
          <p className="text-indigo-400 font-bold flex items-center gap-2 mt-1 mb-8"><Briefcase size={18}/> {user.job}</p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-800/50 p-5 rounded-3xl border border-gray-700/50">
              <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest block mb-1">Bütçe</span>
              <span className="text-white font-bold flex items-center gap-2"><Wallet size={18} className="text-emerald-500"/> {user.budget} TL</span>
            </div>
            <div className="bg-gray-800/50 p-5 rounded-3xl border border-gray-700/50">
              <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest block mb-1">Durum</span>
              <span className="text-white font-bold flex items-center gap-2"><Home size={18} className="text-amber-500"/> {user.hasHouse ? 'Evi Var' : 'Ev Arıyor'}</span>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-black text-[10px] tracking-[0.3em] uppercase border-b border-gray-700 pb-2">Yaşam Tarzı Analizi</h4>
            {user.answers?.map((ans, i) => (
              <div key={i} className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-2xl flex justify-between items-center">
                <span className="text-[11px] text-gray-400 font-medium max-w-[65%]">{ans.text}</span>
                <span className="text-indigo-400 font-black text-xs italic uppercase">{ans.answer}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ANA EKRAN BİLEŞENİ ---
const ChatScreen: React.FC<{ matches: ChatMatch[]; isLoading: boolean }> = ({ matches, isLoading }) => {
  const [selectedMatch, setSelectedMatch] = useState<ChatMatch | null>(null);
  const [currentUser] = useAuthState(auth);
  const [richMatches, setRichMatches] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser || matches.length === 0) return;

    const unsubscribes = matches.map((match) => {
      const chatId = getChatId(currentUser.uid, match.id);
      const lastMsgQuery = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'desc'), limit(1));

      return onSnapshot(lastMsgQuery, async (snapshot) => {
        const lastMsg = snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        const userDoc = await getDoc(doc(db, 'users', match.id));
        const userData = userDoc.exists() ? userDoc.data() : {};

        setRichMatches((prev) => {
          const filtered = prev.filter(m => m.id !== match.id);
          const updated = { ...match, ...userData, lastMessage: lastMsg };
          return [...filtered, updated].sort((a, b) => {
            const tA = a.lastMessage?.createdAt?.seconds || 0;
            const tB = b.lastMessage?.createdAt?.seconds || 0;
            return tB - tA; // En yeni mesaj en üste 
          });
        });
      });
    });

    return () => unsubscribes.forEach(fn => fn());
  }, [matches, currentUser]);

  if (!currentUser) return <div className="h-full bg-[#111827]" />;

  return (
    <div className="max-w-7xl mx-auto h-[calc(100dvh-64px)] flex bg-[#111827] overflow-hidden">
      {/* Liste Paneli */}
      <div className={`w-full md:w-1/3 border-r border-gray-800 flex flex-col ${selectedMatch ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-gray-800 bg-[#1a2332] flex items-center gap-3">
          <MessageCircle className="text-indigo-500" size={24}/>
          <h1 className="text-xl font-black text-white italic uppercase italic">Mesajlar</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {richMatches.map((m) => {
            const isUnread = m.lastMessage?.to === currentUser.uid && m.lastMessage?.read === false;
            return (
              <div key={m.id} onClick={() => setSelectedMatch(m)} className={`p-5 flex items-center border-b border-gray-800/40 cursor-pointer hover:bg-gray-800 transition-all ${isUnread ? 'bg-indigo-500/5' : ''}`}>
                <div className={`w-12 h-12 rounded-2xl ${m.avatarColor} flex items-center justify-center text-white font-black mr-4 relative`}>
                  {m.name?.[0]}
                  {isUnread && <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-[#111827] animate-pulse"></div>}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className={`truncate italic uppercase tracking-tighter ${isUnread ? 'font-black text-white text-sm' : 'font-bold text-gray-500 text-xs'}`}>{m.name}</h3>
                    <span className="text-[9px] font-black text-gray-600 uppercase">{formatTime(m.lastMessage?.createdAt)}</span>
                  </div>
                  <p className={`text-xs truncate ${isUnread ? 'font-black text-indigo-400' : 'text-gray-500'}`}>
                    {m.lastMessage ? (m.lastMessage.senderId === currentUser.uid ? `Siz: ${m.lastMessage.text}` : m.lastMessage.text) : 'Sohbeti başlatın...'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sohbet Paneli */}
      <div className={`w-full md:w-2/3 ${selectedMatch ? 'flex' : 'hidden md:flex'} flex-col bg-[#0F172A]`}>
        {selectedMatch ? <ChatWindow match={selectedMatch} onBack={() => setSelectedMatch(null)} /> : 
          <div className="h-full w-full flex items-center justify-center text-gray-700 font-black uppercase text-[10px] tracking-[0.3em]">Sohbet Seçin</div>
        }
      </div>
    </div>
  );
};

// --- CHAT WINDOW BİLEŞENİ ---
const ChatWindow: React.FC<{ match: ChatMatch; onBack: () => void }> = ({ match, onBack }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [currentUser] = useAuthState(auth);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) return;
    const chatId = getChatId(currentUser.uid, match.id);
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snap) => {
      const msgs: Message[] = [];
      snap.forEach(d => {
        const data = d.data();
        msgs.push({ id: d.id, ...data } as Message);
        if (data.to === currentUser.uid && data.read === false) {
          updateDoc(doc(db, 'chats', chatId, 'messages', d.id), { read: true });
        }
      });
      setMessages(msgs);
    });
  }, [currentUser, match.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;
    const chatId = getChatId(currentUser.uid, match.id);
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: newMessage,
      senderId: currentUser.uid,
      to: match.id,
      read: false,
      createdAt: serverTimestamp(),
    });
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#111827] relative">
      <div className="flex items-center p-4 border-b border-gray-800 bg-[#1a2332] z-[50]">
        <button onClick={onBack} className="mr-3 text-gray-400 md:hidden p-1"><ArrowLeft size={22}/></button>
        <div onClick={() => setShowProfile(true)} className="flex items-center cursor-pointer group">
          <div className={`w-10 h-10 rounded-xl ${match.avatarColor} flex items-center justify-center text-white font-black mr-3 shadow-lg group-hover:ring-2 ring-indigo-500/50 transition-all`}>{match.name?.[0]}</div>
          <div>
            <h2 className="text-white font-bold text-sm tracking-tight leading-none">{match.name}</h2>
            <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mt-1">Profili Gör</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-3.5 rounded-2xl text-[13px] font-medium shadow-sm ${
              msg.senderId === currentUser?.uid ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700/50'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[#1a2332] border-t border-gray-800">
         <form className="flex gap-2" onSubmit={handleSend}>
            <input 
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-1 ring-indigo-500/50"
              placeholder="Mesajınızı yazın..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit" className="bg-indigo-600 p-3 rounded-xl text-white active:scale-95 transition-transform shadow-lg"><Send size={18}/></button>
         </form>
      </div>

      {showProfile && <UserProfileView user={match} onClose={() => setShowProfile(false)} />}
    </div>
  );
};

export default ChatScreen;