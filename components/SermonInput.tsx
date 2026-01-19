
import React, { useState } from 'react';

interface SermonInputProps {
  onGenerate: (text: string) => void;
  isLoading: boolean;
}

export const SermonInput: React.FC<SermonInputProps> = ({ onGenerate, isLoading }) => {
  const [text, setText] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setText(content);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = () => {
    if (text.trim().length < 50) {
      alert('설교문 내용이 너무 짧습니다. 성도님들을 위해 좀 더 풍성한 내용을 입력해주세요.');
      return;
    }
    onGenerate(text);
  };

  return (
    <div className="bg-white p-5 md:p-8 rounded-3xl shadow-lg border border-amber-100 w-full mb-8 no-print fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl shadow-inner">📜</div>
        <h2 className="text-xl font-bold text-amber-900 tracking-tight">
          설교문 준비
        </h2>
      </div>
      
      <div className="mb-6">
        <textarea
          className="w-full h-72 md:h-96 p-5 border border-amber-100 rounded-2xl focus:ring-4 focus:ring-amber-100 focus:border-amber-300 outline-none transition-all resize-none text-gray-800 text-sm md:text-base leading-relaxed bg-amber-50/20"
          placeholder="여기에 주일 설교 전문을 붙여넣으시거나 아래 버튼으로 파일을 불러오세요..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleSubmit}
          disabled={isLoading || !text.trim()}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-white text-lg transition-all transform active:scale-[0.98] shadow-lg ${
            isLoading || !text.trim()
              ? 'bg-gray-300 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-amber-200'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              묵상지를 엮는 중...
            </span>
          ) : (
            '✨ 묵상 질문지 생성하기'
          )}
        </button>

        <div className="flex justify-center">
          <input
            type="file"
            accept=".txt,.md"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="text-amber-700 text-sm font-bold hover:underline cursor-pointer flex items-center gap-1 p-2"
          >
            📂 텍스트 파일 가져오기
          </label>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100">
        <p className="text-[11px] md:text-xs text-amber-800/70 text-center leading-relaxed font-medium">
          한샘교회 묵상 생성기는 인공지능이 설교를 분석하여<br/>
          하나님의 말씀을 삶에 투영하는 성도님들의 한 주간을 돕습니다.
        </p>
      </div>
    </div>
  );
};
