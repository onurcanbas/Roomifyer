import React, { useState } from 'react';
import { User } from '../types';
import { X, Save, RotateCcw } from 'lucide-react';

// OnboardingScreen ile aynı seçenek havuzunu kullanıyoruz
const QUESTION_OPTIONS: { [key: string]: string[] } = {
  "Sigara kullanır mısın?": ["Evet", "Hayır", "Sosyal içiciyim"],
  "Alkol kullanır mısın?": ["Evet", "Hayır", "Sosyal içiciyim"],
  "Uyku düzenin nasıldır?": ["Erkenci", "Gece kuşu", "Düzensiz"],
  "Temizlik sıklığın nedir?": ["Her gün", "Haftada bir", "Dağınığım"],
  "Eve misafir gelmesine nasıl bakarsın?": ["Severim", "Önceden haber verilmeli", "İstemem"],
  "Evde gürültü/müzik toleransın nedir?": ["Sessizlik isterim", "Orta seviye", "Sorun değil"],
  "Evcil hayvan besler misin/ister misin?": ["Evet", "Hayır", "Fark etmez"],
  "Ev arkadaşınla sosyal ilişkin nasıl olmalı?": ["Sadece ev arkadaşı", "Yakın dost", "Mesafeli"],
  "Mutfak kullanımı ve bulaşık düzenin?": ["Anında yıkarım", "Aynı gün içinde", "Birikince"],
  "Ortak giderler (deterjan vb.) nasıl alınmalı?": ["Ortak havuzdan", "Sırayla", "Herkes kendi"],
  "Ders çalışma/Çalışma ortamı nasıl olmalı?": ["Mutlak sessizlik", "Hafif müzik", "Fark etmez"],
  "Faturaların zamanında ödenmesi?": ["Çok hassasım", "Unutabiliyorum", "Genelde gününde"]
};

interface EditAnswersFormProps {
  answers: User['answers'];
  onSave: (updatedAnswers: User['answers']) => void;
  onCancel: () => void;
}

const EditAnswersForm: React.FC<EditAnswersFormProps> = ({ answers, onSave, onCancel }) => {
  const [formData, setFormData] = useState(answers || []);

  const handleChange = (index: number, value: string) => {
    const newFormData = [...formData];
    newFormData[index] = { ...newFormData[index], answer: value };
    setFormData(newFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="w-full max-w-2xl bg-gray-800 rounded-[40px] p-8 border border-gray-700 shadow-2xl animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Mülakat Cevaplarını Düzenle</h2>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Eşleşme algoritması bu verilere göre güncellenir</p>
        </div>
        <button type="button" onClick={onCancel} className="p-2 text-gray-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {formData.map((item, index) => {
            // Soru metnine göre seçenekleri havuzdan çekiyoruz
            const options = QUESTION_OPTIONS[item.text] || ["Belirtilmedi"];
            
            return (
              <div key={index} className="space-y-2">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  {item.text}
                </label>
                <div className="relative">
                  <select
                    value={item.answer}
                    onChange={(e) => handleChange(index, e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-2xl py-3.5 px-4 text-white font-bold text-sm appearance-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                  >
                    {options.map((option) => (
                      <option key={option} value={option} className="bg-gray-900 text-white">
                        {option}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 pt-6 border-t border-gray-700/50">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-2xl transition-all"
          >
            <RotateCcw size={18} /> Vazgeç
          </button>
          <button
            type="submit"
            className="flex-[2] flex items-center justify-center gap-2 py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <Save size={18} /> Tercihleri Güncelle
          </button>
        </div>
      </form>
    </div>
  );
};

import { ChevronDown } from 'lucide-react';

export default EditAnswersForm;