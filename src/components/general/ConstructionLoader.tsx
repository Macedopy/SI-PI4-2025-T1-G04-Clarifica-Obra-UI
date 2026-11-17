import React from 'react';

export const ConstructionLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8 animate-in fade-in duration-700">
      <div className="relative w-24 h-24">
        {/* Bloquinhos que "constroem" */}
        <div className="absolute bottom-0 left-0 w-10 h-10 bg-blue-600 rounded-lg animate-[build_2s_infinite_0s] shadow-lg border-2 border-blue-700"></div>
        <div className="absolute bottom-0 right-0 w-10 h-10 bg-blue-500 rounded-lg animate-[build_2s_infinite_0.5s] shadow-lg border-2 border-blue-600"></div>
        <div className="absolute top-0 left-0 w-10 h-10 bg-blue-400 rounded-lg animate-[build_2s_infinite_1s] shadow-lg border-2 border-blue-500"></div>
        <div className="absolute top-0 right-0 w-10 h-10 bg-blue-700 rounded-lg animate-[build_2s_infinite_1.5s] shadow-lg border-2 border-blue-800"></div>
        
        {/* Sombra base */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-2 bg-gray-200 rounded-full blur-sm animate-pulse"></div>
      </div>
      
      <div className="text-center">
        <h3 className="text-2xl font-bold text-blue-900 tracking-tight">Construindo sua visão...</h3>
        <p className="text-gray-500 font-medium mt-2 animate-pulse">Sincronizando canteiro de obras</p>
      </div>

      <style>{`
        @keyframes build {
          0%, 100% { 
            transform: scale(0) translateY(20px); 
            opacity: 0; 
          }
          20%, 80% { 
            transform: scale(1) translateY(0); 
            opacity: 1; 
          }
        }
      `}</style>
    </div>
  );
};
