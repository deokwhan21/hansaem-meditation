
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { SermonInput } from './components/SermonInput';
import { ResultDisplay } from './components/ResultDisplay';
import { generateMeditation } from './services/geminiService';
import { WeeklyMeditationResult } from './types';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WeeklyMeditationResult | null>(null);

  const handleGenerate = async (sermonText: string) => {
    try {
      setLoading(true);
      const data = await generateMeditation(sermonText);
      setResult(data);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } catch (error: any) {
      console.error("Error generating meditation:", error);
      alert(`오류 발생: ${error.message || "알 수 없는 오류가 발생했습니다. API Key 설정을 확인해주세요."}`);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8 w-full">
        {!result ? (
          <div className="animate-in fade-in duration-700">
            <div className="bg-amber-50 p-6 rounded-2xl mb-8 border border-amber-100">
                <p className="text-amber-800 text-center font-medium">
                  "말씀의 은혜가 삶의 현장으로 이어지도록"<br/>
                  주일 설교문을 입력하면 일주일간의 깊은 묵상 질문지가 생성됩니다.
                </p>
            </div>
            <SermonInput onGenerate={handleGenerate} isLoading={loading} />
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center mb-6 no-print">
                 <button 
                    onClick={reset}
                    className="text-amber-700 font-medium hover:underline flex items-center gap-1"
                 >
                    ← 새로운 설교문 입력하기
                 </button>
            </div>
            <ResultDisplay result={result} />
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
            <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-amber-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-amber-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl">✨</div>
            </div>
            <h3 className="text-xl font-bold text-amber-900 mb-2">말씀을 묵상으로 엮는 중...</h3>
            <p className="text-amber-700 text-center animate-pulse">
                설교의 핵심을 따라 삶의 질문들을 갈무리하고 있습니다.
            </p>
        </div>
      )}
    </Layout>
  );
};

export default App;
