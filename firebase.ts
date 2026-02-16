import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Web uygulaması için Firebase yapılandırması
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};


const app = initializeApp(firebaseConfig);
import { collection, doc, setDoc } from "firebase/firestore";

(window as any).uploadQuestions = async () => {
  const questionsToAdd = [
    { id: 'q1', text: 'Sigara kullanır mısın?', category: 'habit', options: ['Evet', 'Hayır', 'Sosyal içiciyim'] },
    { id: 'q2', text: 'Evcil hayvanın var mı?', category: 'preference', options: ['Evet', 'Hayır', 'İleride düşünebilirim'] },
    { id: 'q3', text: 'Temizlik seviyen? (1: Rahat, 5: Titiz)', category: 'habit', options: ['1', '2', '3', '4', '5'] },
    { id: 'q4', text: 'Ne kadar sosyalsin? (1: İçe dönük, 5: Dışa dönük)', category: 'social', options: ['1', '2', '3', '4', '5'] }
  ];

  for (const q of questionsToAdd) {
    try {
      await setDoc(doc(db, "questions", q.id), {
        text: q.text,
        category: q.category,
        options: q.options
      });
      console.log(`${q.id} yüklendi.`);
    } catch (e) {
      console.error(e);
    }
  }
  console.log("Tüm sorular başarıyla yüklendi!");
};

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);