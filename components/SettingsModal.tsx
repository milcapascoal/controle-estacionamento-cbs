import React, { useState, useEffect } from 'react';
import { ParkingConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: ParkingConfig;
  onSave: (newConfig: ParkingConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentConfig, onSave }) => {
  const [config, setConfig] = useState<ParkingConfig>(currentConfig);

  useEffect(() => {
    setConfig(currentConfig);
  }, [currentConfig, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    // Garante que o valor seja um número inteiro e não negativo
    const numericValue = Math.max(0, parseInt(value, 10) || 0);
    setConfig(prev => ({
      ...prev,
      [id]: numericValue
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-6 relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-2 text-slate-700">Configurações do Estacionamento</h2>
        <p className="text-sm text-slate-500 mb-6">Ajuste o número total de vagas disponíveis para cada tipo de veículo.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="totalCarSpots" className="block text-sm font-medium text-slate-600">Vagas para Carros</label>
            <input
              type="number"
              id="totalCarSpots"
              value={config.totalCarSpots}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="totalMotorcycleSpots" className="block text-sm font-medium text-slate-600">Vagas para Motos</label>
            <input
              type="number"
              id="totalMotorcycleSpots"
              value={config.totalMotorcycleSpots}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="totalBicycleSpots" className="block text-sm font-medium text-slate-600">Vagas para Bicicletas</label>
            <input
              type="number"
              id="totalBicycleSpots"
              value={config.totalBicycleSpots}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end pt-4 space-x-2 border-t border-slate-200 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">Salvar Alterações</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
