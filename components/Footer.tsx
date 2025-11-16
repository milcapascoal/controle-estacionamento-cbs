
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white shadow-inner mt-auto py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-slate-500">
          Sistema de Controle de Estacionamento | Desenvolvido por <span className="font-semibold text-indigo-600">Milca Pascoal (Diradm/CBS)</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;