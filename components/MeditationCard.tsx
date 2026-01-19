
import React from 'react';
import { DayMeditation } from '../types';

interface MeditationCardProps {
  data: DayMeditation;
  isEditing: boolean;
  isLocked: boolean;
  onChange: (updatedData: DayMeditation) => void;
}

const DAY_NAMES = ['주일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

export const MeditationCard: React.FC<MeditationCardProps> = ({ data, isEditing, isLocked, onChange }) => {
  const handleChange = (field: keyof DayMeditation, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  const inputClass = "w-full bg-amber-50/50 border border-amber-200 rounded px-2 py-1 focus:ring-2 focus:ring-amber-400 outline-none text-gray-800 transition-all";

  return (
    <div className="relative overflow-hidden bg-white p-6 rounded-2xl border border-amber-100 border-l-4 border-l-amber-500 shadow-sm flex flex-col h-full break-inside-avoid-page page-break-inside-avoid transition-all">
      {/* 잠금 오버레이 */}
      {isLocked && !isEditing && (
          <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
              <div className="text-5xl mb-4">⏳</div>
              <h4 className="text-xl font-bold text-amber-900 mb-2">{DAY_NAMES[data.day - 1]}에 열립니다</h4>
              <p className="text-amber-700 text-sm leading-relaxed">
                  오늘의 말씀을 충분히 묵상하며<br/> 
                  다음에 올 은혜를 기도로 기다려주세요.
              </p>
          </div>
      )}

      <div className={`transition-all ${isLocked && !isEditing ? 'blur-sm opacity-20 pointer-events-none' : ''}`}>
          <div className="flex justify-between items-center mb-4">
            <span className="inline-flex items-center px-3 py-1 bg-amber-50 text-amber-700 text-xs font-black rounded-full uppercase tracking-tighter">
              {DAY_NAMES[data.day - 1]} 묵상
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-300">
                ✝
            </div>
          </div>
          
          <div className="mb-2">
            {isEditing ? (
              <input 
                className={`${inputClass} font-bold text-lg`}
                value={data.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            ) : (
              <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">
                {data.title}
              </h3>
            )}
          </div>
          
          <div className="bg-amber-50/50 p-3 rounded-lg mb-4">
            {isEditing ? (
              <input 
                className={`${inputClass} text-xs italic`}
                value={data.scripture}
                onChange={(e) => handleChange('scripture', e.target.value)}
              />
            ) : (
              <p className="text-xs md:text-sm text-amber-800 italic font-bold leading-relaxed">
                {data.scripture}
              </p>
            )}
          </div>
          
          <div className="space-y-5 flex-1">
            <div className="relative pl-6">
              <span className="absolute left-0 top-0 text-amber-400 text-lg font-serif opacity-50">“</span>
              <h4 className="text-xs font-black text-gray-400 mb-1 uppercase tracking-widest">Reflection</h4>
              {isEditing ? (
                <textarea 
                  className={`${inputClass} text-base italic h-24`}
                  value={data.reflectionQuestion}
                  onChange={(e) => handleChange('reflectionQuestion', e.target.value)}
                />
              ) : (
                <p className="text-gray-800 leading-relaxed text-base md:text-lg font-medium italic">
                  {data.reflectionQuestion}
                </p>
              )}
            </div>

            <div className="pl-6">
              <h4 className="text-xs font-black text-gray-400 mb-1 uppercase tracking-widest">Action</h4>
              {isEditing ? (
                <textarea 
                  className={`${inputClass} text-sm h-20`}
                  value={data.practicalAction}
                  onChange={(e) => handleChange('practicalAction', e.target.value)}
                />
              ) : (
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  {data.practicalAction}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-dashed border-gray-100">
              <h4 className="text-xs font-black text-amber-400/70 mb-1 uppercase tracking-widest">Prayer</h4>
              {isEditing ? (
                <textarea 
                  className={`${inputClass} text-xs h-20`}
                  value={data.prayer}
                  onChange={(e) => handleChange('prayer', e.target.value)}
                />
              ) : (
                <p className="text-gray-500 italic text-xs md:text-sm leading-relaxed">
                  {data.prayer}
                </p>
              )}
            </div>
          </div>
      </div>
    </div>
  );
};
