import React from 'react';
import { User } from '../types';

interface HeaderProps {
  onOpenModal: () => void;
  onOpenReportModal: () => void;
  onOpenUserModal: () => void;
  onOpenSettingsModal: () => void;
  currentUser: User;
  onLogout: () => void;
}

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const ReportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13.489m-7 7.702a4 4 0 01-3-3.72M12 12.073c.403-.23.823-.42-1.272-.56M12 12.073c-.403-.23-.823-.42-1.272-.56M12 4.354a4 4 0 010 5.292" />
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ onOpenModal, onOpenReportModal, onOpenUserModal, onOpenSettingsModal, currentUser, onLogout }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-slate-700">Controle de Estacionamento - CBS</h1>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-slate-600 hidden md:block">
              Olá, <span className="font-semibold text-slate-800">{currentUser.email}</span>
            </div>
            <button
                onClick={onLogout}
                className="flex items-center justify-center px-3 py-2 text-sm text-slate-600 font-semibold rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75 transition duration-150 ease-in-out"
                title="Sair do sistema"
              >
              <LogoutIcon />
              <span className="hidden sm:inline">Sair</span>
            </button>
            {currentUser.role === 'Administrador' && (
              <>
                <button
                  onClick={onOpenSettingsModal}
                  className="flex items-center justify-center px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
                >
                  <SettingsIcon />
                  <span className="hidden lg:inline">Configurações</span>
                </button>
                <button
                  onClick={onOpenUserModal}
                  className="flex items-center justify-center px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
                >
                  <UserIcon />
                  <span className="hidden lg:inline">Usuários</span>
                </button>
              </>
            )}
            <button
              onClick={onOpenReportModal}
              className="flex items-center justify-center px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
            >
              <ReportIcon />
              <span className="hidden lg:inline">Relatórios</span>
            </button>
            <button
              onClick={onOpenModal}
              className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
            >
              <PlusIcon />
              <span className="hidden lg:inline">Cadastrar Veículo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
