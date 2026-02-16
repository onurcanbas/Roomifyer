import React, { useState } from 'react';
import { ChevronRight, Sparkles, ShieldCheck, Target, Loader2 } from 'lucide-react';
import { db, auth } from '../firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

// TEZ İÇİN ÖNERİLEN 12 BOYUTLU VERİ SETİ
const APP_QUESTIONS = [
  // KATEGORİ: ALIŞKANLIKLAR (HABITS)
  { id: "h1", category: "Alışkanlıklar", text: "Sigara kullanır mısın?", options: ["Evet", "Hayır", "Sosyal içiciyim"], weight: 15 },
  { id: "h2", category: "Alışkanlıklar", text: "Alkol kullanır mısın?", options: ["Evet", "Hayır", "Sosyal içiciyim"], weight: 10 },
  { id: "h3", category: "Alışkanlıklar", text: "Uyku düzenin nasıldır?", options: ["Erkenci", "Gece kuşu", "Düzensiz"], weight: 8 },
  { id: "h4", category: "Alışkanlıklar", text: "Temizlik sıklığın nedir?", options: ["Her gün", "Haftada bir", "Dağınığım"], weight: 12 },

  // KATEGORİ: SOSYAL YAŞAM (SOCIAL)
  { id: "s1", category: "Sosyal Yaşam", text: "Eve misafir gelmesine nasıl bakarsın?", options: ["Severim", "Önceden haber verilmeli", "İstemem"], weight: 12 },
  { id: "s2", category: "Sosyal Yaşam", text: "Evde gürültü/müzik toleransın nedir?", options: ["Sessizlik isterim", "Orta seviye", "Sorun değil"], weight: 7 },
  { id: "s3", category: "Sosyal Yaşam", text: "Evcil hayvan besler misin/ister misin?", options: ["Evet", "Hayır", "Fark etmez"], weight: 10 },
  { id: "s4", category: "Sosyal Yaşam", text: "Ev arkadaşınla sosyal ilişkin nasıl olmalı?", options: ["Sadece ev arkadaşı", "Yakın dost", "Mesafeli"], weight: 5 },

  // KATEGORİ: PAYLAŞIM VE DÜZEN (LOGISTICS)
  { id: "l1", category: "Paylaşım", text: "Mutfak kullanımı ve bulaşık düzenin?", options: ["Anında yıkarım", "Aynı gün içinde", "Birikince"], weight: 10 },
  { id: "l2", category: "Paylaşım", text: "Ortak giderler (deterjan vb.) nasıl alınmalı?", options: ["Ortak havuzdan", "Sırayla", "Herkes kendi"], weight: 6 },
  { id: "l3", category: "Paylaşım", text: "Ders çalışma/Çalışma ortamı nasıl olmalı?", options: ["Mutlak sessizlik", "Hafif müzik", "Fark etmez"], weight: 8 },
  { id: "l4", category: "Paylaşım", text: "Faturaların zamanında ödenmesi?", options: ["Çok hassasım", "Unutabiliyorum", "Genelde gününde"], weight: 10 }
];

interface OnboardingProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [isFinishing, setIsFinishing] = useState(false);

  const currentQ = APP_QUESTIONS[step];

  const handleAnswer = async (option: string) => {
    const newAnswers = [...answers, { 
      text: currentQ.text, 
      answer: option, 
      weight: currentQ.weight,
      category: currentQ.category 
    }];
    
    if (step < APP_QUESTIONS.length - 1) {
      setAnswers(newAnswers);
      setStep(step + 1);
    } else {
      setIsFinishing(true);
      try {
        if (auth.currentUser) {
          await updateDoc(doc(db, "users", auth.currentUser.uid), {
            answers: newAnswers,
            isOnboarded: true,
            lastUpdated: serverTimestamp()
          });
          onComplete();
        }
      } catch (error) {
        console.error("Mülakat kayıt hatası:", error);
        setIsFinishing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A] z-[999] flex items-center justify-center p-6 text-white overflow-y-auto">
      <div className="max-w-xl w-full py-10">
        
        {/* PROGRESS BAR (12 Adımlı) */}
        <div className="flex gap-1.5 mb-10">
          {APP_QUESTIONS.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${
                i <= step ? 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]' : 'bg-gray-800'
              }`} 
            />
          ))}
        </div>

        {/* AI BADGE */}
        <div className="flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-left-4 duration-1000">
          <div className="p-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <Sparkles size={20} className="text-indigo-400" />
          </div>
          <div>
            <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 leading-none mb-1.5">AI Mülakat Sistemi</span>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Soru {step + 1} / 12</span>
          </div>
        </div>

        {/* SORU ALANI */}
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="space-y-4 text-left">
            <span className="px-4 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
              {currentQ.category}
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-[1.1] italic">
              {currentQ.text}
            </h2>
          </div>

          <div className="grid gap-4">
            {currentQ.options.map((option) => (
              <button
                key={option}
                disabled={isFinishing}
                onClick={() => handleAnswer(option)}
                className="group relative p-7 bg-gray-800/30 border-2 border-gray-700/50 rounded-[32px] text-left hover:bg-gray-800 hover:border-indigo-500/50 transition-all active:scale-[0.98] overflow-hidden disabled:opacity-50"
              >
                <div className="flex justify-between items-center relative z-10">
                  <span className="text-xl font-bold text-gray-400 group-hover:text-white transition-colors tracking-tight">{option}</span>
                  <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center group-hover:bg-indigo-600 transition-all shadow-xl">
                    {isFinishing && step === APP_QUESTIONS.length - 1 ? (
                      <Loader2 size={20} className="animate-spin text-white" />
                    ) : (
                      <ChevronRight size={24} className="text-gray-600 group-hover:text-white" />
                    )}
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        {/* FOOTER ANALYTICS */}
        <div className="mt-16 pt-8 border-t border-gray-800/50 flex flex-wrap items-center justify-center gap-8 text-gray-600">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Veri Güvenliği Aktif</span>
          </div>
          <div className="flex items-center gap-2">
            <Target size={16} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Ağırlıklı Puanlama Modeli</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;