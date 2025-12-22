export interface Question {
  id: string;
  text: string;
  category: 'habit' | 'preference' | 'social';
  options: string[];
}

export interface UserAnswer {
  questionId?: string; // ID eşleşmesi için gerekli
  text: string;        // Soru metni
  answer: string;      // Kullanıcının cevabı
  preferenceType?: 'positive' | 'negative' | 'neutral'; // İkon seçimi için
  options?: string[];
}

export interface User {
  uid: string;
  name: string;
  email?: string;
  age: number;
  job: string;
  hasHouse: boolean;
  budget?: number;
  bio?: string;
  avatarColor: string; // Tailwind class like 'bg-yellow-400' (fallback)
  photoUrl?: string;
  answers: UserAnswer[];
  description: string;
}

export interface ChatMatch {
  id: string;
  name: string;
  message: string;
  time: string;
  avatarColor: string;
}

export type ViewState = 'home' | 'profile' | 'chat';

export interface Message {
  id: string;
  text: string;
  senderId: string;
  to: string;        // Mesajın kime gittiği
  read: boolean;     // Okundu bilgisi
  createdAt: any;
}

export interface FilterSettings {
  maxAge: number;
  maxBudget: number;
  mustHaveHouse: boolean;
}
export interface ChatMatch {
  id: string;
  name: string;
  avatarColor: string;
  // Firestore'daki detaylı veriler eklendi:
  age?: number;
  job?: string;
  budget?: number;
  hasHouse?: boolean;
  answers?: UserAnswer[];
  description?: string;
  lastMessage?: any; // Liste sıralaması için
}