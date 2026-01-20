import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  isShareMode?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, isShareMode = false }) => {
  return (
    <div className="min-h-screen flex flex-col items-center py-4 md:py-8 px-4 md:px-8 max-w-4xl mx-auto">
      <header className="w-full text-center mb-10 no-print">
        <h1 className="text-4xl font-bold text-amber-900 mb-2 font-serif">한샘교회</h1>
        <p className="text-xl text-amber-700 font-medium tracking-tight">
          날마다 되새김질하는 주일말씀 묵상
        </p>
        <div className="mt-4 h-1 w-24 bg-amber-200 mx-auto rounded-full"></div>
        {!isShareMode && (
          <span className="inline-block mt-2 text-[10px] text-amber-400 font-bold uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
            Manager Mode
          </span>
        )}
      </header>
      
      <main className="w-full flex-1">
        {children}
      </main>
      
      <footer className="w-full mt-16 text-center text-gray-400 text-[10px] no-print border-t border-gray-100 pt-8">
        © {new Date().getFullYear()} 한샘교회. 모든 성도들의 거룩한 동행을 응원합니다.
      </footer>
    </div>
  );
};