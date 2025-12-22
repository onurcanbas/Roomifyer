import { User, Question } from './types';

export const QUESTIONS: Question[] = [
  { id: 'q1', text: 'Sigara kullanıyor musun?', category: 'habit' },
  { id: 'q2', text: 'Evcil hayvan besliyor musun veya beslemek ister misin?', category: 'preference' },
  { id: 'q3', text: 'Eve sık misafir gelir mi?', category: 'social' },
  { id: 'q4', text: 'Temizlik alışkanlıkların nasıl?', category: 'habit' },
];

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Burak Bakırhan',
    age: 23,
    job: 'Barista',
    hasHouse: false,
    budget: undefined, // undefined to match screenshot showing "undefined" or handle logically
    avatarColor: 'bg-yellow-400',
    description: 'Sakin, kendi halinde biriyim. Kahve kokusu evden eksik olmaz.',
    answers: [
      { questionId: 'q1', answer: 'Evet', preferenceType: 'positive' },
      { questionId: 'q2', answer: 'Hayır', preferenceType: 'negative' },
      { questionId: 'q3', answer: 'Evet', preferenceType: 'positive' },
      { questionId: 'q4', answer: 'Fark Etmez', preferenceType: 'neutral' },
    ]
  },
  {
    id: '2',
    name: 'Ayşe Yılmaz',
    age: 25,
    job: 'Yazılımcı',
    hasHouse: true,
    budget: 15000,
    avatarColor: 'bg-purple-400',
    description: 'Evde çalışıyorum, sessizlik benim için önemli.',
    answers: [
      { questionId: 'q1', answer: 'Hayır', preferenceType: 'negative' },
      { questionId: 'q2', answer: 'Evet', preferenceType: 'positive' },
      { questionId: 'q3', answer: 'Hayır', preferenceType: 'negative' },
      { questionId: 'q4', answer: 'Titizim', preferenceType: 'positive' },
    ]
  },
  {
    id: '3',
    name: 'Mert Demir',
    age: 21,
    job: 'Öğrenci',
    hasHouse: false,
    budget: 8000,
    avatarColor: 'bg-green-400',
    description: 'Müzik dinlemeyi severim, uyumlu biriyim.',
    answers: [
      { questionId: 'q1', answer: 'Ara sıra', preferenceType: 'neutral' },
      { questionId: 'q2', answer: 'Evet', preferenceType: 'positive' },
      { questionId: 'q3', answer: 'Evet', preferenceType: 'positive' },
      { questionId: 'q4', answer: 'Normal', preferenceType: 'neutral' },
    ]
  }
];

export const CURRENT_USER_PROFILE = {
  name: 'Kullanıcı',
  email: 'kullanici@example.com',
  age: 26,
  job: 'CEO',
  answers: [
    { questionId: 'q1', text: 'Sigara kullanıyor musun?', answer: 'Fark Etmez', type: 'neutral' },
    { questionId: 'q2', text: 'Evcil hayvan besliyor musun veya beslemek ister misin?', answer: 'Hayır', type: 'negative' },
    { questionId: 'q3', text: 'Eve sık misafir gelir mi?', answer: 'Evet', type: 'positive' },
    { questionId: 'q4', text: 'Temizlik alışkanlıkların nasıl?', answer: 'Evet', type: 'positive' },
  ]
};
