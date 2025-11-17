import React, { useState, useMemo } from 'react';
import { Vehicle, ParkingLog } from '../types';

interface QuickAccessPanelProps {
  vehicles: Vehicle[];
  activeLogs: ParkingLog[]; // Logs for today without exitTime
  onQuickExit: (logId: string) => void;
  isLoading: boolean;
}

const ExitIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);


const QuickAccessPanel: React.FC<QuickAccessPanelProps> = ({ vehicles, activeLogs, onQuickExit, isLoading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const combinedLogs = useMemo(() => {
        const vehicleMap = new Map(vehicles.map(v => [v.id, v]));
        return activeLogs
            .map(log => ({ log, vehicle: vehicleMap.get(log.vehicleId) }))
            .filter(item => item.vehicle) // Garante que o veículo foi encontrado
            .sort((a, b) => a.log.entryTime.localeCompare(b.log.entryTime));
    }, [activeLogs, vehicles]);

    const filteredLogs = useMemo(() => {
        if (!searchTerm) {
            return combinedLogs;
        }
        const lowercasedTerm = searchTerm.toLowerCase();
        return combinedLogs.filter(({ vehicle }) => {
            if (!vehicle) return false;
            return (
                vehicle.plate.toLowerCase().includes(lowercasedTerm) ||
                vehicle.ownerName.toLowerCase().includes(lowercasedTerm)
            );
        });
    }, [searchTerm, combinedLogs]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-slate-700">
                Veículos no Subsolo ({filteredLogs.length})
            </h2>
            <div className="relative mb-4">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon />
                </div>
                <input
                    type="text"
                    placeholder="Buscar por placa ou proprietário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={isLoading}
                />
            </div>
            <div className="flex-grow overflow-y-auto -mr-3 pr-3">
                 {isLoading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                        <p className="mt-3 text-slate-500">Carregando...</p>
                    </div>
                ) : filteredLogs.length > 0 ? (
                    <ul className="space-y-3">
                        {filteredLogs.map(({ log, vehicle }) => (
                           vehicle && (
                             <li key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors duration-150">
                                <div>
                                    <p className="font-semibold text-slate-800">{vehicle.ownerName}</p>
                                    <p className="text-sm text-slate-500">
                                        <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-xs">{vehicle.plate}</span>
                                        <span className="mx-2 text-slate-300">|</span>
                                        Entrada: <span className="font-semibold text-green-600">{log.entryTime}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => onQuickExit(log.id)}
                                    className="flex items-center px-3 py-2 bg-emerald-500 text-white font-semibold rounded-lg shadow-sm hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                                    title="Registrar Saída Rápida"
                                >
                                   <ExitIcon />
                                   <span className="hidden sm:inline ml-1 text-sm">Saída</span>
                                </button>
                            </li>
                           )
                        ))}
                    </ul>
                 ) : (
                     <div className="text-center py-10 flex flex-col items-center justify-center h-full">
                         <p className="text-slate-500">
                            {searchTerm ? "Nenhum resultado para a busca." : "Nenhum veículo no subsolo no momento."}
                         </p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default QuickAccessPanel;