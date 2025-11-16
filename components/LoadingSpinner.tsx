
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
      <p className="mt-4 text-slate-600 font-semibold text-lg">Carregando dados da nuvem...</p>
    </div>
  );
};

export default LoadingSpinner;
