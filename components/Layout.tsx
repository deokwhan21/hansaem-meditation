import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, hideHeader = false }) => {
  return (
    <div className="min-h-screen flex flex-col items-center py-4 md:py-8 px-4 md:px-8 max-w-4xl mx-auto">
      {!hideHeader && (
        <header className="w-full text-center mb-12 no-print">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">한샘교회</h1>
          <p className="text-xl text-amber-700 font-medium">주간 묵상 생성기</p>
          <div className="mt-4 h-1 w-24 bg-amber-200 mx-auto rounded-full"></div>
        </header>
      )}
      <main className="w-full flex-1">
        {children}
      </main>
      <footer className="w-full mt-16 text-center text-gray-400 text-[10px] no-print border-t border-gray-100 pt-8">
        © {new Date().getFullYear()} 한샘교회. 모든 성도들의 거룩한 동행을 응원합니다.
      </footer>
    </div>
  );
};