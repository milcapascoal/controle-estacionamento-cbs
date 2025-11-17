import React, { useState, useMemo } from 'react';
import { ParkingLog, Vehicle } from '../types';

interface DailyLogListProps {
  dailyLogs: ParkingLog[];
  vehicles: Vehicle[];
  selectedDate: string;
  onOpenEditModal: (log: ParkingLog) => void;
  isLoading: boolean;
}

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);


const DailyLogList: React.FC<DailyLogListProps> = ({ dailyLogs, vehicles, selectedDate, onOpenEditModal, isLoading }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const formatDate = (dateString: string) => {
        const date = new Date(dateString + 'T00:00:00');
        return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(date);
    };

    const filteredLogs = useMemo(() => {
        if (!searchTerm) {
            return dailyLogs;
        }
        const lowercasedTerm = searchTerm.toLowerCase();
        return dailyLogs.filter(log => {
            const vehicle = vehicles.find(v => v.id === log.vehicleId);
            if (!vehicle) return false;
            return (
                vehicle.plate.toLowerCase().includes(lowercasedTerm) ||
                vehicle.ownerName.toLowerCase().includes(lowercasedTerm) ||
                vehicle.model.toLowerCase().includes(lowercasedTerm)
            );
        });
    }, [searchTerm, dailyLogs, vehicles]);
    
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-700">
          Registros de {formatDate(selectedDate)}
        </h2>
        <div className="relative w-full max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
            </div>
            <input
                type="text"
                placeholder="Buscar por placa, proprietário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        </div>
      </div>
      <div className="overflow-x-auto">
        {isLoading ? (
            <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-3 text-slate-500">Carregando registros...</p>
            </div>
        ) : dailyLogs.length > 0 ? (
            filteredLogs.length > 0 ? (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Proprietário</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Veículo</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Horários</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Operador</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredLogs.map(log => {
                    const vehicle = vehicles.find(v => v.id === log.vehicleId);
                    if (!vehicle) return null;
                    return (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">{vehicle.ownerName}</div>
                            <div className="text-sm text-slate-500">{vehicle.universityLink}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">{vehicle.model} - {vehicle.color} ({vehicle.type})</div>
                            <div className="text-sm text-slate-500 font-mono bg-slate-100 inline-block px-2 py-0.5 rounded">{vehicle.plate}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                            <div className="flex items-center">
                                <span className="font-semibold text-green-600">{log.entryTime}</span>
                                <span className="mx-2 text-slate-400">→</span>
                                <span className="font-semibold text-red-600">{log.exitTime || '--:--'}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {log.operatorName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button 
                                onClick={() => onOpenEditModal(log)}
                                className="p-2 text-slate-500 hover:bg-slate-200 hover:text-indigo-600 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                title="Editar registro"
                            >
                               <EditIcon />
                            </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
                <div className="text-center py-10">
                    <p className="text-slate-500">Nenhum resultado encontrado para a sua busca.</p>
                </div>
            )
        ) : (
          <div className="text-center py-10">
            <p className="text-slate-500">Nenhum registro para esta data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyLogList;