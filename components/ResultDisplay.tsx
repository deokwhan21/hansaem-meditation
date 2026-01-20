import React, { useState, useEffect } from 'react';
import { WeeklyMeditationResult, DayMeditation } from '../types';
import { MeditationCard } from './MeditationCard';

interface ResultDisplayProps {
  result: WeeklyMeditationResult;
  isShareMode?: boolean;
}

const DAY_NAMES = ['주일', '월', '화', '수', '목', '금', '토'];

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result: initialResult, isShareMode = false }) => {
  const [editableResult, setEditableResult] = useState<WeeklyMeditationResult>(initialResult);
  const [isEditing, setIsEditing] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [currentDayIndex, setCurrentDayIndex] = useState(new Date().getDay());

  useEffect(() => {
    setEditableResult(initialResult);
    const now = new Date();
    setCurrentDayIndex(now.getDay());
    setActiveDay(now.getDay() + 1);
  }, [initialResult]);

  const isLocked = (dayNum: number) => {
    if (isEditing || isShareMode === false) return false; // 목사님 모드일 땐 잠금 안함
    const dayIndex = dayNum - 1;
    return dayIndex > currentDayIndex;
  };

  const handlePrint = () => {
    if (isEditing) setIsEditing(false);
    setTimeout(() => window.print(), 300);
  };

  const handleShareLink = () => {
    try {
      const str = JSON.stringify(editableResult);
      const bytes = new TextEncoder().encode(str);
      const base64 = btoa(String.fromCharCode(...bytes));
      const url = new URL(window.location.href);
      url.searchParams.set('d', base64);
      
      navigator.clipboard.writeText(url.toString()).then(() => {
        alert('성도들에게 보낼 공유 링크가 복사되었습니다! 카톡방에 붙여넣기 하세요.');
      });
    } catch (e) {
      alert('링크 생성 중 오류가 발생했습니다.');
    }
  };

  const handleCopyText = () => {
    let fullText = `[한샘교회 주간 묵상집]\n\n설교제목: ${editableResult.sermonTitle}\n본문: ${editableResult.mainScripture}\n\n`;
    editableResult.meditations.forEach((m, idx) => {
      fullText += `[${DAY_NAMES[idx]}요일] ${m.title}\n성구: ${m.scripture}\n묵상: ${m.reflectionQuestion}\n실천: ${m.practicalAction}\n기도: ${m.prayer}\n\n`;
    });
    navigator.clipboard.writeText(fullText).then(() => alert('텍스트가 복사되었습니다.'));
  };

  const handleMeditationChange = (index: number, updatedDay: DayMeditation) => {
    const newMeditations = [...editableResult.meditations];
    newMeditations[index] = updatedDay;
    setEditableResult({ ...editableResult, meditations: newMeditations });
  };

  return (
    <div className="w-full fade-in pb-10 px-0">
      {/* 도구 모음 (성도 모드에선 숨김) */}
      {!isShareMode && (
        <div className="flex flex-wrap justify-center gap-2 mb-8 no-print sticky top-4 z-20 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-amber-100">
            <button 
                onClick={handleShareLink}
                className="flex-1 md:flex-none bg-amber-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-amber-700 transition-all flex items-center justify-center gap-2"
            >
                🔗 카톡 공유 링크 생성
            </button>
            <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`flex-1 md:flex-none px-4 py-2.5 rounded-full text-sm font-bold transition-all border ${
                  isEditing ? 'bg-green-600 text-white border-green-600' : 'bg-white text-amber-800 border-amber-200'
                }`}
            >
                {isEditing ? '수정 완료' : '내용 수정'}
            </button>
            <button 
                onClick={handlePrint}
                className="hidden md:flex bg-gray-100 text-gray-700 px-4 py-2.5 rounded-full text-sm font-bold hover:bg-gray-200"
            >
                인쇄/PDF
            </button>
        </div>
      )}

      {/* 헤더 카드 */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-amber-50 mb-6 text-center">
        {isEditing ? (
          <div className="flex flex-col gap-3">
            <input 
              className="text-xl font-bold text-amber-900 bg-amber-50 p-2 rounded text-center outline-none"
              value={editableResult.sermonTitle}
              onChange={(e) => setEditableResult({...editableResult, sermonTitle: e.target.value})}
            />
            <input 
              className="text-sm text-amber-800 bg-amber-50 p-2 rounded text-center outline-none"
              value={editableResult.mainScripture}
              onChange={(e) => setEditableResult({...editableResult, mainScripture: e.target.value})}
            />
          </div>
        ) : (
          <>
            <span className="text-[10px] font-bold text-amber-600 tracking-widest uppercase mb-2 block">한샘교회 주간 묵상</span>
            <h2 className="text-2xl md:text-3xl font-bold text-amber-900 mb-3 tracking-tight leading-tight">
              {editableResult.sermonTitle}
            </h2>
            <div className="inline-block px-4 py-1.5 bg-amber-50 text-amber-800 rounded-full text-sm font-bold">
              {editableResult.mainScripture}
            </div>
          </>
        )}
      </div>

      {/* 요일 탭 */}
      <div className="no-print flex justify-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {editableResult.meditations.map((m, idx) => {
          const locked = isLocked(m.day);
          const active = activeDay === m.day;
          return (
            <button
              key={m.day}
              onClick={() => setActiveDay(m.day)}
              className={`flex-shrink-0 w-14 h-16 rounded-2xl flex flex-col items-center justify-center transition-all ${
                active
                  ? 'bg-amber-600 text-white shadow-lg scale-110 z-10'
                  : 'bg-white text-amber-700 border border-amber-100'
              } ${locked ? 'opacity-40 grayscale-[0.5]' : ''}`}
            >
              <span className="text-[9px] font-bold opacity-70 mb-0.5">DAY {m.day}</span>
              <span className="text-lg font-black leading-none">
                {DAY_NAMES[idx]}{locked && "🔒"}
              </span>
            </button>
          )
        })}
      </div>

      {/* 묵상 카드 내용 */}
      <div className="relative">
        {editableResult.meditations.map((meditation, idx) => (
          <div key={meditation.day} className={activeDay === meditation.day ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <MeditationCard 
              data={meditation} 
              isEditing={isEditing}
              isLocked={isLocked(meditation.day)}
              onChange={(updated) => handleMeditationChange(idx, updated)}
            />
          </div>
        ))}
      </div>

      {/* 성구 하단 바 */}
      <div className="bg-amber-900 text-amber-50 p-8 rounded-3xl shadow-xl text-center mt-12 mb-8">
        <p className="text-sm md:text-base font-serif italic mb-4 leading-relaxed">
          "사람아 주께서 선한 것이 무엇임을 네게 보이셨나니<br className="md:hidden"/> 여호와께서 네게 구하시는 것은 오직 정의를 행하며 인자를 사랑하며 <br className="md:hidden"/>겸손하게 네 하나님과 함께 행하는 것이 아니냐"
        </p>
        <span className="text-[10px] font-bold tracking-widest opacity-60">- 미가 6:8 -</span>
      </div>
      
      {isShareMode && (
        <div className="text-center no-print">
            <p className="text-xs text-amber-800/50 mb-4">말씀과 함께하는 복된 한 주 되시길 소망합니다.</p>
        </div>
      )}
    </div>
  );
};