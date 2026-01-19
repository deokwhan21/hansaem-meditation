
import React, { useState, useEffect } from 'react';
import { WeeklyMeditationResult, DayMeditation } from '../types';
import { MeditationCard } from './MeditationCard';

interface ResultDisplayProps {
  result: WeeklyMeditationResult;
}

const DAY_NAMES = ['주일', '월', '화', '수', '목', '금', '토'];

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result: initialResult }) => {
  const [editableResult, setEditableResult] = useState<WeeklyMeditationResult>(initialResult);
  const [isEditing, setIsEditing] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [currentDayIndex, setCurrentDayIndex] = useState(new Date().getDay()); // 0: 주일, 1: 월 ...

  useEffect(() => {
    setEditableResult(initialResult);
    // 현재 요일 설정 (실시간 반영을 위해)
    const now = new Date();
    setCurrentDayIndex(now.getDay());
    setActiveDay(now.getDay() + 1); // 오늘 요일에 해당하는 탭을 기본으로 선택
  }, [initialResult]);

  const isLocked = (dayNum: number) => {
    // 편집 모드일 때는 잠금을 해제하여 모든 내용을 볼 수 있게 함
    if (isEditing) return false;
    // index 0(주일) ~ 6(토)
    const dayIndex = dayNum - 1;
    return dayIndex > currentDayIndex;
  };

  const handlePrint = () => {
    if (isEditing) {
      if (!confirm('편집 모드에서는 모든 내용이 보입니다. 인쇄하시겠습니까?')) return;
      setIsEditing(false);
    }
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleDownloadHtml = () => {
    const cardsHtml = editableResult.meditations.map((m, idx) => {
      const dayIdx = m.day - 1;
      return `
      <div id="day-content-${m.day}" class="day-content">
        <div class="card ${dayIdx > new Date().getDay() ? 'locked-card' : ''}">
          <div class="locked-overlay">
              <div class="lock-icon">🔒</div>
              <p>${DAY_NAMES[dayIdx]}요일에 열리는 묵상입니다.<br>기대로 기다려주세요.</p>
          </div>
          <div class="card-header">
            <span class="day-badge">${DAY_NAMES[idx]}요일 묵상</span>
            <span class="cross-icon">✝</span>
          </div>
          <h3 class="card-title">${m.title}</h3>
          <div class="scripture-box">${m.scripture}</div>
          
          <div class="content-section">
            <label>묵상 질문</label>
            <p class="reflection">"${m.reflectionQuestion}"</p>
          </div>
          
          <div class="content-section">
            <label>실천 방안</label>
            <p class="action">${m.practicalAction}</p>
          </div>
          
          <div class="prayer-box">
            <label>오늘의 기도</label>
            <p class="prayer">${m.prayer}</p>
          </div>
        </div>
      </div>
    `}).join('');

    const tabsHtml = DAY_NAMES.map((name, idx) => `
      <button class="tab-btn ${idx > new Date().getDay() ? 'locked-tab' : ''}" onclick="showDay(${idx + 1}, this)">
        <span class="tab-label">DAY ${idx + 1}</span>
        <span class="tab-name">${name}${idx > new Date().getDay() ? '🔒' : ''}</span>
      </button>
    `).join('');

    const fullHtml = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${editableResult.sermonTitle} - 한샘교회 주간 묵상집</title>
    <style>
        :root {
            --primary: #451a03;
            --secondary: #92400e;
            --accent: #f59e0b;
            --bg: #fcfaf7;
            --card-bg: #ffffff;
            --text-main: #1f2937;
            --text-muted: #6b7280;
        }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
            background-color: var(--bg); 
            color: var(--text-main); 
            margin: 0; 
            padding: 0; 
            line-height: 1.6;
            word-break: keep-all;
        }
        .container { 
            width: 100%;
            max-width: 500px;
            margin: 0 auto;
            padding: 16px 16px 60px 16px;
        }
        header { 
            text-align: center; 
            padding: 30px 20px;
            background: white;
            border-radius: 24px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .church-name { font-size: 0.8rem; font-weight: bold; color: var(--secondary); margin-bottom: 6px; display: block; letter-spacing: 0.1em; }
        h1 { font-size: 1.5rem; color: var(--primary); margin: 0 0 10px 0; line-height: 1.3; }
        .main-scripture { 
            display: inline-block;
            background: #fffbeb;
            color: var(--secondary);
            padding: 4px 12px;
            border-radius: 99px;
            font-size: 0.8rem;
            font-weight: 700;
        }
        
        .tabs-container {
            display: flex;
            gap: 6px;
            margin-bottom: 20px;
            overflow-x: auto;
            padding-bottom: 8px;
            scrollbar-width: none;
            -ms-overflow-style: none;
        }
        .tabs-container::-webkit-scrollbar { display: none; }
        .tab-btn {
            flex: 0 0 54px;
            height: 54px;
            border-radius: 16px;
            border: 1px solid #eee;
            background: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .tab-btn.active {
            background: var(--accent);
            border-color: var(--accent);
            color: white;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
            transform: translateY(-2px);
        }
        .locked-tab { opacity: 0.5; background: #f3f4f6; }
        .tab-label { font-size: 8px; font-weight: 800; opacity: 0.7; }
        .tab-name { font-size: 1.1rem; font-weight: 900; }

        .day-content { display: none; animation: fadeIn 0.3s ease-out; }
        .day-content.active { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .card {
            background: var(--card-bg);
            border-radius: 24px;
            padding: 24px;
            border-left: 6px solid var(--accent);
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            position: relative;
            overflow: hidden;
        }
        .locked-card .card-header, .locked-card .card-title, .locked-card .scripture-box, .locked-card .content-section, .locked-card .prayer-box {
            filter: blur(8px);
            pointer-events: none;
            opacity: 0.3;
        }
        .locked-overlay {
            display: none;
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.8);
            z-index: 10;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 20px;
        }
        .locked-card .locked-overlay { display: flex; }
        .lock-icon { font-size: 3rem; margin-bottom: 10px; }
        .locked-overlay p { font-weight: bold; color: var(--primary); font-size: 0.9rem; }

        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .day-badge { background: #fff7ed; color: #c2410c; font-size: 0.75rem; font-weight: 900; padding: 4px 12px; border-radius: 99px; }
        .cross-icon { color: #fde68a; font-size: 1.2rem; }
        .card-title { font-size: 1.3rem; font-weight: 800; color: #111; margin: 0 0 12px 0; }
        .scripture-box { 
            background: #fdfaf3; 
            padding: 14px; 
            border-radius: 16px; 
            font-size: 0.9rem; 
            color: #78350f; 
            font-style: italic; 
            margin-bottom: 20px;
            border: 1px solid #fef3c7;
        }
        .content-section { margin-bottom: 20px; }
        .content-section label { display: block; font-size: 0.7rem; font-weight: 800; color: #9ca3af; text-transform: uppercase; margin-bottom: 6px; }
        .reflection { font-size: 1.1rem; font-weight: 600; color: #374151; margin: 0; font-style: italic; }
        .action { font-size: 1rem; color: #4b5563; margin: 0; }
        .prayer-box { background: #fafafa; padding: 16px; border-radius: 16px; }
        .prayer-box label { color: var(--accent); font-size: 0.7rem; font-weight: 800; margin-bottom: 4px; display: block; }
        .prayer { font-size: 0.85rem; color: #6b7280; font-style: italic; margin: 0; }
        
        .footer-quote {
            background: var(--primary);
            color: white;
            padding: 30px 20px;
            border-radius: 24px;
            text-align: center;
            margin-top: 30px;
        }
        .quote-text { font-size: 1rem; font-style: italic; margin-bottom: 10px; line-height: 1.5; }
        .quote-ref { font-size: 0.75rem; font-weight: bold; opacity: 0.7; }
        
        footer { text-align: center; padding: 30px 0; color: #9ca3af; font-size: 0.7rem; }

        @media print {
            .tabs-container { display: none !important; }
            .day-content { display: block !important; margin-bottom: 30px; page-break-inside: avoid; }
            .locked-card .card-header, .locked-card .card-title, .locked-card .scripture-box, .locked-card .content-section, .locked-card .prayer-box {
                filter: none !important; opacity: 1 !important;
            }
            .locked-overlay { display: none !important; }
            body { background: white; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <span class="church-name">한샘교회</span>
            <h1>${editableResult.sermonTitle}</h1>
            <div class="main-scripture">본문: ${editableResult.mainScripture}</div>
        </header>

        <div class="tabs-container">
            ${tabsHtml}
        </div>

        <div class="contents">
            ${cardsHtml}
        </div>

        <div class="footer-quote">
            <p class="quote-text">"사람아 주께서 선한 것이 무엇임을 네게 보이셨나니 여호와께서 네게 구하시는 것은 오직 정의를 행하며 인자를 사랑하며 겸손하게 네 하나님과 함께 행하는 것이 아니냐"</p>
            <p class="quote-ref">- 미가 6:8 -</p>
        </div>

        <footer>© 한샘교회 주간 묵상집</footer>
    </div>

    <script>
        const today = new Date().getDay() + 1;
        function showDay(dayNum, btn) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.day-content').forEach(c => c.classList.remove('active'));
            document.getElementById('day-content-' + dayNum).classList.add('active');
            window.scrollTo({ top: 100, behavior: 'smooth' });
        }
        // 초기 설정: 오늘 요일 보이기
        window.onload = () => {
           const btn = document.querySelector('.tabs-container').children[today - 1];
           showDay(today, btn);
        }
    </script>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editableResult.sermonTitle}_한샘교회_주간묵상.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyText = () => {
    let fullText = `[한샘교회 주간 묵상집]\n\n설교제목: ${editableResult.sermonTitle}\n본문: ${editableResult.mainScripture}\n\n`;
    editableResult.meditations.forEach((m, idx) => {
      if (!isLocked(m.day)) {
          fullText += `[${DAY_NAMES[idx]}요일] ${m.title}\n성구: ${m.scripture}\n묵상: ${m.reflectionQuestion}\n실천: ${m.practicalAction}\n기도: ${m.prayer}\n\n`;
      } else {
          fullText += `[${DAY_NAMES[idx]}요일] (잠금상태)\n\n`;
      }
    });
    fullText += `\n"오직 정의를 행하며 인자를 사랑하며 겸손하게 네 하나님과 함께 행하는 것이 아니냐" - 미가 6:8`;

    navigator.clipboard.writeText(fullText).then(() => {
      alert('묵상 내용이 복사되었습니다. (잠긴 날짜는 제목만 복사됩니다)');
    });
  };

  const handleMeditationChange = (index: number, updatedDay: DayMeditation) => {
    const newMeditations = [...editableResult.meditations];
    newMeditations[index] = updatedDay;
    setEditableResult({ ...editableResult, meditations: newMeditations });
  };

  const handleHeaderChange = (field: keyof WeeklyMeditationResult, value: string) => {
    setEditableResult({ ...editableResult, [field]: value });
  };

  return (
    <div className="w-full fade-in pb-20 px-2 md:px-0">
      <div className="flex flex-wrap justify-center gap-2 mb-6 no-print sticky top-4 z-20 bg-white/90 backdrop-blur-md p-2 md:p-3 rounded-2xl md:rounded-full shadow-lg border border-amber-100">
          <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`flex-1 md:flex-none px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                isEditing ? 'bg-green-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
          >
              {isEditing ? '수정 완료' : '수정/잠금해제'}
          </button>
          
          <button 
              onClick={handlePrint}
              className="flex-1 md:flex-none bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2"
          >
              PDF/인쇄
          </button>

          <button 
              onClick={handleDownloadHtml}
              className="flex-1 md:flex-none bg-amber-100 text-amber-900 hover:bg-amber-200 px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2"
          >
              클릭형 HTML
          </button>

          <button 
              onClick={handleCopyText}
              className="flex-1 md:flex-none bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2"
          >
              텍스트 복사
          </button>
      </div>

      <div className={`bg-white p-6 md:p-8 rounded-3xl shadow-sm border mb-6 text-center relative overflow-hidden transition-all ${isEditing ? 'border-amber-400 ring-2 ring-amber-100' : 'border-amber-50'}`}>
        {isEditing ? (
          <div className="flex flex-col gap-3 max-w-2xl mx-auto">
            <input 
              className="text-xl font-bold text-amber-900 bg-amber-50 p-2 rounded text-center outline-none w-full"
              value={editableResult.sermonTitle}
              onChange={(e) => handleHeaderChange('sermonTitle', e.target.value)}
              placeholder="설교 제목"
            />
            <input 
              className="text-xs font-bold text-amber-800 bg-amber-50 p-1.5 rounded text-center outline-none w-full"
              value={editableResult.mainScripture}
              onChange={(e) => handleHeaderChange('mainScripture', e.target.value)}
              placeholder="성경 본문"
            />
            <textarea 
              className="text-gray-600 italic text-sm bg-amber-50 p-3 rounded h-20 outline-none w-full"
              value={editableResult.summary}
              onChange={(e) => handleHeaderChange('summary', e.target.value)}
              placeholder="설교 요약"
            />
          </div>
        ) : (
          <>
            <h2 className="text-xl md:text-2xl font-bold text-amber-900 mb-2 tracking-tight">
              {editableResult.sermonTitle}
            </h2>
            <div className="inline-block px-4 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-bold mb-3">
              본문: {editableResult.mainScripture}
            </div>
            <p className="text-gray-500 italic text-xs leading-relaxed max-w-lg mx-auto">
              {editableResult.summary}
            </p>
          </>
        )}
      </div>

      <div className="no-print flex justify-center gap-1.5 mb-6 overflow-x-auto pb-2 scrollbar-hide px-2">
        {editableResult.meditations.map((m, idx) => {
          const locked = isLocked(m.day);
          return (
            <button
              key={m.day}
              onClick={() => setActiveDay(m.day)}
              className={`flex-shrink-0 w-12 h-13 md:w-16 md:h-16 rounded-2xl flex flex-col items-center justify-center transition-all ${
                activeDay === m.day
                  ? 'bg-amber-600 text-white shadow-lg scale-110 z-10'
                  : 'bg-white text-amber-700 border border-amber-100 hover:bg-amber-50'
              } ${locked ? 'opacity-50' : ''}`}
            >
              <span className="text-[8px] font-bold opacity-70 mb-0.5">DAY {m.day}</span>
              <span className="text-lg font-black leading-none flex items-center">
                {DAY_NAMES[idx]}
                {locked && <span className="ml-0.5 text-[10px]">🔒</span>}
              </span>
            </button>
          )
        })}
      </div>

      <div className="relative">
        {editableResult.meditations.map((meditation, idx) => (
          <div 
            key={meditation.day}
            className={`${activeDay === meditation.day ? 'block' : 'hidden'} print:block mb-8`}
          >
            <MeditationCard 
              data={meditation} 
              isEditing={isEditing}
              isLocked={isLocked(meditation.day)}
              onChange={(updated) => handleMeditationChange(idx, updated)}
            />
          </div>
        ))}
      </div>

      <div className="bg-amber-900 text-amber-50 p-8 rounded-3xl shadow-xl text-center mt-10 mb-8 no-print">
        <p className="text-sm md:text-base font-serif italic mb-3 leading-snug">
          "사람아 주께서 선한 것이 무엇임을 네게 보이셨나니<br className="hidden md:block"/> 여호와께서 네게 구하시는 것은 오직 정의를 행하며 인자를 사랑하며 <br className="hidden md:block"/>겸손하게 네 하나님과 함께 행하는 것이 아니냐"
        </p>
        <span className="text-[10px] font-bold tracking-widest opacity-60 uppercase">- 미가 6:8 -</span>
      </div>
    </div>
  );
};
