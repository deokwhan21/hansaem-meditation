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
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setEditableResult(initialResult);
    const now = new Date();
    setCurrentDayIndex(now.getDay());
    setActiveDay(now.getDay() + 1);
  }, [initialResult]);

  const isLocked = (dayNum: number) => {
    if (isEditing || isShareMode === false) return false; 
    const dayIndex = dayNum - 1;
    return dayIndex > currentDayIndex;
  };

  const handlePrint = () => {
    if (isEditing) setIsEditing(false);
    setTimeout(() => window.print(), 300);
  };

  // 초단축 압축 로직 (JSON Key Mapping + GZIP)
  const getCompressedUrl = async () => {
    // 항목 이름을 최소한으로 줄여서 부피 축소
    const shortData = {
      st: editableResult.sermonTitle,
      ms: editableResult.mainScripture,
      sm: editableResult.summary,
      m: editableResult.meditations.map(m => ({
        d: m.day,
        t: m.title,
        sc: m.scripture,
        rq: m.reflectionQuestion,
        pa: m.practicalAction,
        pr: m.prayer
      }))
    };
    
    const str = JSON.stringify(shortData);
    const blob = new Blob([str]);
    const stream = blob.stream().pipeThrough(new CompressionStream('gzip'));
    const compressedBuffer = await new Response(stream).arrayBuffer();
    const binary = String.fromCharCode(...new Uint8Array(compressedBuffer));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); 
  };

  const handleKakaoTemplate = async () => {
    try {
      setIsProcessing(true);
      const shortData = await getCompressedUrl();
      const url = new URL(window.location.href.split('?')[0]);
      url.searchParams.set('d', shortData);
      
      const message = `[한샘교회 주간 묵상]\n\n제목: ${editableResult.sermonTitle}\n\n말씀의 은혜를 삶으로 이어가는\n7일간의 여정에 성도님들을 초대합니다.\n\n매일 정해진 시간에 아래 링크를 눌러\n오늘의 묵상을 확인해보세요. ✨\n\n📖 묵상집 바로가기:\n${url.toString()}`;
      
      await navigator.clipboard.writeText(message);
      alert('✅ 카톡 안내 메시지가 복사되었습니다!\n주소가 이전보다 훨씬 더 짧아졌습니다.');
    } catch (e) {
      alert('메시지 생성 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyText = () => {
    let fullText = `[한샘교회 주간 묵상집]\n\n설교제목: ${editableResult.sermonTitle}\n본문: ${editableResult.mainScripture}\n\n`;
    editableResult.meditations.forEach((m, idx) => {
      fullText += `[${DAY_NAMES[idx]}요일] ${m.title}\n성구: ${m.scripture}\n묵상: ${m.reflectionQuestion}\n실천: ${m.practicalAction}\n기도: ${m.prayer}\n\n`;
    });
    navigator.clipboard.writeText(fullText).then(() => alert('텍스트 전체가 복사되었습니다.'));
  };

  const handleMeditationChange = (index: number, updatedDay: DayMeditation) => {
    const newMeditations = [...editableResult.meditations];
    newMeditations[index] = updatedDay;
    setEditableResult({ ...editableResult, meditations: newMeditations });
  };

  return (
    <div className="w-full fade-in pb-10 px-0">
      {!isShareMode && (
        <div className="flex flex-wrap justify-center gap-2 mb-8 no-print sticky top-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-3xl shadow-xl border border-amber-100 max-w-2xl mx-auto">
            <button 
                onClick={handleKakaoTemplate}
                disabled={isProcessing}
                className="flex-[2] md:flex-none bg-amber-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-amber-200 hover:bg-amber-700 transition-all flex items-center justify-center gap-2"
            >
                {isProcessing ? '처리 중...' : '💬 카톡 안내문 복사'}
            </button>
            <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`flex-1 md:flex-none px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${
                  isEditing ? 'bg-green-600 text-white border-green-600' : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
                }`}
            >
                {isEditing ? '수정 완료' : '수정/잠금해제'}
            </button>
            <button 
                onClick={handlePrint}
                className="flex-1 md:flex-none bg-white text-gray-700 border border-gray-200 px-4 py-3 rounded-2xl text-sm font-bold hover:bg-gray-50"
            >
                인쇄/PDF
            </button>
            <button 
                onClick={handleCopyText}
                className="flex-1 md:flex-none bg-white text-gray-700 border border-gray-200 px-4 py-3 rounded-2xl text-sm font-bold hover:bg-gray-50"
            >
                텍스트만
            </button>
        </div>
      )}

      <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-amber-50 mb-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 opacity-20"></div>
        {isEditing ? (
          <div className="flex flex-col gap-4">
            <input 
              className="text-2xl font-bold text-amber-900 bg-amber-50/50 p-3 rounded-2xl text-center outline-none border border-amber-100 focus:border-amber-400"
              value={editableResult.sermonTitle}
              onChange={(e) => setEditableResult({...editableResult, sermonTitle: e.target.value})}
            />
            <input 
              className="text-base text-amber-800 bg-amber-50/50 p-2 rounded-xl text-center outline-none border border-amber-100 focus:border-amber-400"
              value={editableResult.mainScripture}
              onChange={(e) => setEditableResult({...editableResult, mainScripture: e.target.value})}
            />
          </div>
        ) : (
          <>
            <span className="text-xs font-bold text-amber-600 tracking-[0.2em] uppercase mb-4 block">HANSAEM CHURCH</span>
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-6 tracking-tight leading-tight">
              {editableResult.sermonTitle}
            </h2>
            <div className="inline-flex items-center px-6 py-2 bg-amber-50 text-amber-800 rounded-full text-sm font-bold border border-amber-100 shadow-sm">
              <span className="mr-2 opacity-50">본문:</span> {editableResult.mainScripture}
            </div>
          </>
        )}
      </div>

      <div className="no-print flex justify-center gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide px-2">
        {editableResult.meditations.map((m, idx) => {
          const locked = isLocked(m.day);
          const active = activeDay === m.day;
          return (
            <button
              key={m.day}
              onClick={() => setActiveDay(m.day)}
              className={`flex-shrink-0 w-16 h-20 rounded-[24px] flex flex-col items-center justify-center transition-all duration-300 ${
                active
                  ? 'bg-amber-600 text-white shadow-xl shadow-amber-200 -translate-y-1 scale-110 z-10'
                  : 'bg-white text-amber-700 border border-amber-100 hover:border-amber-300 hover:bg-amber-50'
              } ${locked ? 'opacity-40' : ''}`}
            >
              <span className={`text-[9px] font-bold mb-1 ${active ? 'opacity-80' : 'opacity-40'}`}>DAY {m.day}</span>
              <span className="text-xl font-black leading-none">
                {DAY_NAMES[idx]}
              </span>
              {locked && <span className="text-[10px] mt-1">🔒</span>}
            </button>
          )
        })}
      </div>

      <div className="relative max-w-2xl mx-auto px-2">
        {editableResult.meditations.map((meditation, idx) => (
          <div key={meditation.day} className={activeDay === meditation.day ? 'block animate-in fade-in zoom-in-95 duration-500' : 'hidden'}>
            <MeditationCard 
              data={meditation} 
              isEditing={isEditing}
              isLocked={isLocked(meditation.day)}
              onChange={(updated) => handleMeditationChange(idx, updated)}
            />
          </div>
        ))}
      </div>

      <div className="bg-amber-900 text-amber-50 p-10 md:p-14 rounded-[40px] shadow-2xl text-center mt-16 mb-12 relative overflow-hidden mx-2">
        <div className="absolute top-0 right-0 p-4 text-6xl opacity-10 pointer-events-none">📖</div>
        <p className="text-base md:text-lg font-serif italic mb-6 leading-relaxed max-w-lg mx-auto">
          "사람아 주께서 선한 것이 무엇임을 네게 보이셨나니 여호와께서 네게 구하시는 것은 오직 정의를 행하며 인자를 사랑하며 겸손하게 네 하나님과 함께 행하는 것이 아니냐"
        </p>
        <span className="text-xs font-bold tracking-widest opacity-50 border-t border-amber-50/20 pt-4 px-8 inline-block">- 미가 6:8 -</span>
      </div>
      
      {isShareMode && (
        <div className="text-center no-print pb-10">
            <p className="text-sm text-amber-800/40 font-medium italic">말씀과 함께하는 성도들의 거룩한 동행</p>
        </div>
      )}
    </div>
  );
};