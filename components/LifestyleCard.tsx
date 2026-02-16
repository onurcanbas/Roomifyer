import React from 'react';
import { ThumbsUp, ThumbsDown, HelpCircle, Target } from 'lucide-react';
import { User } from '../types';

interface LifestyleCardProps {
  user: User;
}

const LifestyleCard: React.FC<LifestyleCardProps> = ({ user }) => {
  
  const getIcon = (item: any) => {
    if (item.preferenceType === 'positive') return <ThumbsUp className="text-green-500" size={16} />;
    if (item.preferenceType === 'negative') return <ThumbsDown className="text-red-500" size={16} />;
    return <Target className="text-indigo-400 opacity-60" size={16} />;
  };

  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-[32px] p-6 backdrop-blur-xl h-full overflow-y-auto max-h-[500px] scrollbar-hide">
      <h3 className="text-white font-black text-xs uppercase tracking-widest mb-6 border-b border-gray-700 pb-3 flex justify-between items-center">
        Yaşam Tarzı Analizi
        <span className="text-[10px] text-indigo-400 lowercase font-medium italic">12 parametre</span>
      </h3>
      
      <div className="space-y-5">
        {user.answers && user.answers.length > 0 ? (
          user.answers.map((ans, idx) => (
            <div key={idx} className="flex gap-3 items-start animate-in fade-in duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="mt-1 p-1.5 bg-gray-900/50 rounded-lg flex-shrink-0">
                {getIcon(ans)}
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter leading-tight mb-1">
                  {ans.text}
                </p>
                <p className="text-sm font-black text-gray-200 tracking-tight italic">
                  {ans.answer}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center">
             <p className="text-gray-500 text-xs font-bold uppercase tracking-widest italic opacity-50">Analiz Verisi Yok</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LifestyleCard;