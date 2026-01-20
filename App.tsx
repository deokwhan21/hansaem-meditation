import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { SermonInput } from './components/SermonInput';
import { ResultDisplay } from './components/ResultDisplay';
import { generateMeditation } from './services/geminiService';
import { WeeklyMeditationResult } from './types';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WeeklyMeditationResult | null>(null);
  const [isShareMode, setIsShareMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('d');
    
    if (sharedData) {
      const decompress = async (base64: string) => {
        try {
          const normalizedBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
          const binary = atob(normalizedBase64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          
          let jsonData;
          try {
            const ds = new DecompressionStream('gzip');
            const writer = ds.writable.getWriter();
            writer.write(bytes);
            writer.close();
            const response = new Response(ds.readable);
            const arrayBuffer = await response.arrayBuffer();
            const str = new TextDecoder().decode(arrayBuffer);
            jsonData = JSON.parse(str);
          } catch (err) {
            const str = new TextDecoder().decode(bytes);
            jsonData = JSON.parse(str);
          }

          // 압축을 위해 줄여놓은 항목명을 다시 원래대로 복원 (Short Keys -> Full Keys)
          const data: WeeklyMeditationResult = {
            sermonTitle: jsonData.st || jsonData.sermonTitle,
            mainScripture: jsonData.ms || jsonData.mainScripture,
            summary: jsonData.sm || jsonData.summary,
            meditations: (jsonData.m || jsonData.meditations).map((m: any) => ({
              day: m.d || m.day,
              title: m.t || m.title,
              scripture: m.sc || m.scripture,
              reflectionQuestion: m.rq || m.reflectionQuestion,
              practicalAction: m.pa || m.practicalAction,
              prayer: m.pr || m.prayer
            }))
          };
          
          setResult(data);
          setIsShareMode(true);
        } catch (e) {
          console.error("데이터 복원 실패", e);
        }
      };
      decompress(sharedData);
    }
  }, []);

  const handleGenerate = async (sermonText: string) => {
    try {
      setLoading(true);
      const data = await generateMeditation(sermonText);
      setResult(data);
      setIsShareMode(false);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } catch (error: any) {
      console.error("Error:", error);
      alert(`오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setIsShareMode(false);
    window.history.replaceState({}, '', window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout isShareMode={isShareMode}>
      <div className="flex flex-col gap-8 w-full">
        {!result ? (
          <div className="animate-in fade-in duration-700">
            <div className="bg-amber-50 p-6 rounded-2xl mb-8 border border-amber-100">
                <p className="text-amber-800 text-center font-medium text-sm md:text-base">
                  "말씀의 은혜가 삶의 현장으로 이어지도록"<br/>
                  주일 설교문을 입력하면 일주일간의 깊은 묵상 질문지가 생성됩니다.
                </p>
            </div>
            <SermonInput onGenerate={handleGenerate} isLoading={loading} />
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom duration-500">
            {!isShareMode && (
              <div className="flex justify-start items-center mb-6 no-print">
                   <button 
                      onClick={reset}
                      className="text-amber-700 text-sm font-bold hover:text-amber-900 flex items-center gap-1 bg-amber-50 px-4 py-2 rounded-full transition-colors"
                   >
                      ← 새로운 설교문 입력하기
                   </button>
              </div>
            )}
            <ResultDisplay result={result} isShareMode={isShareMode} />
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 text-center">
            <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-amber-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-amber-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-xl">✨</div>
            </div>
            <h3 className="text-lg font-bold text-amber-900 mb-2 font-serif">말씀을 묵상으로 엮는 중...</h3>
            <p className="text-sm text-amber-700">잠시만 기다려 주시면 7일간의 묵상이 완성됩니다.</p>
        </div>
      )}
    </Layout>
  );
};

export default App;