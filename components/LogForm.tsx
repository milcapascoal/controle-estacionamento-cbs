
import React, { useState, useEffect, useCallback } from 'react';
import { Vehicle, ParkingLog } from '../types';

interface LogFormProps {
    vehicles: Vehicle[];
    dailyLogs: ParkingLog[];
    onSaveLog: (logData: Omit<ParkingLog, 'id' | 'plate' | 'operatorName'>) => void;
    selectedDate: string;
}

const LogForm: React.FC<LogFormProps> = ({ vehicles, dailyLogs, onSaveLog, selectedDate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [entryTime, setEntryTime] = useState('');
    const [exitTime, setExitTime] = useState<string | null>('');
    const [message, setMessage] = useState('');

    const resetForm = useCallback(() => {
        setSelectedVehicle(null);
        setSearchResults([]);
        setEntryTime('');
        setExitTime('');
        setMessage('');
    }, []);

    useEffect(() => {
        resetForm();
        setSearchTerm('');
    }, [selectedDate, resetForm]);

    const handleSelectVehicle = useCallback((vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setSearchTerm(vehicle.plate);
        setSearchResults([]);
        
        const existingLog = dailyLogs.find(log => log.vehicleId === vehicle.id);
        if (existingLog) {
            setEntryTime(existingLog.entryTime);
            setExitTime(existingLog.exitTime);
        } else {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            setEntryTime(`${hours}:${minutes}`);
            setExitTime('');
        }
        setMessage('');
    }, [dailyLogs]);

    useEffect(() => {
        if (selectedVehicle && searchTerm.toUpperCase() === selectedVehicle.plate.toUpperCase()) {
            return;
        }

        if (searchTerm.length > 2) {
            const lowercasedTerm = searchTerm.toLowerCase();
            const results = vehicles.filter(v => 
                v.plate.toLowerCase().includes(lowercasedTerm) || 
                v.ownerName.toLowerCase().includes(lowercasedTerm)
            );
            
            if (results.length === 1 && searchTerm.toUpperCase() === results[0].plate.toUpperCase()) {
                handleSelectVehicle(results[0]);
            } else {
                setSearchResults(results);
                setSelectedVehicle(null);
            }

            if (results.length === 0) {
                setMessage('Veículo não cadastrado.');
            } else {
                setMessage('');
            }
        } else {
            resetForm();
            if (searchTerm) setSearchTerm(searchTerm);
        }
    }, [searchTerm, vehicles, resetForm, handleSelectVehicle, selectedVehicle]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedVehicle && entryTime) {
            onSaveLog({
                vehicleId: selectedVehicle.id,
                date: selectedDate,
                entryTime,
                exitTime: exitTime || null
            });
            setMessage('Registro salvo com sucesso!');
            setTimeout(() => {
                 setSearchTerm('');
                 resetForm();
            }, 2000);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="search-term" className="block text-sm font-medium text-slate-600 mb-1">
                    Buscar por Placa ou Nome
                </label>
                <input
                    id="search-term"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Digite a placa ou nome"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    autoComplete="off"
                />
            </div>
            
            {searchResults.length > 0 && (
                 <div className="border border-slate-200 rounded-md max-h-48 overflow-y-auto shadow">
                    {searchResults.map(vehicle => (
                        <button
                            type="button"
                            key={vehicle.id}
                            onClick={() => handleSelectVehicle(vehicle)}
                            className="w-full text-left px-3 py-2 border-b border-slate-100 last:border-b-0 hover:bg-indigo-50 focus:outline-none focus:bg-indigo-100 transition-colors duration-150 ease-in-out"
                        >
                            <p className="font-semibold text-slate-800">{vehicle.ownerName}</p>
                            <p className="text-sm text-slate-500">{vehicle.plate} - {vehicle.model}</p>
                        </button>
                    ))}
                </div>
            )}
            
            {message && <p className={`text-sm ${message.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}

            {selectedVehicle && (
                <div className="border-t pt-4 mt-4 space-y-4 animate-fade-in">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h3 className="font-bold text-slate-800">{selectedVehicle.ownerName}</h3>
                        <p className="text-sm text-slate-500">{selectedVehicle.universityLink}</p>
                        <p className="text-sm text-slate-600 mt-2">{selectedVehicle.model} - {selectedVehicle.color} ({selectedVehicle.type})</p>
                        <p className="text-sm font-mono bg-slate-200 inline-block px-2 py-1 rounded mt-1">{selectedVehicle.plate}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="entry-time" className="block text-sm font-medium text-slate-600 mb-1">Entrada</label>
                            <input
                                id="entry-time"
                                type="time"
                                value={entryTime}
                                onChange={(e) => setEntryTime(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="exit-time" className="block text-sm font-medium text-slate-600 mb-1">Saída</label>
                            <input
                                id="exit-time"
                                type="time"
                                value={exitTime || ''}
                                onChange={(e) => setExitTime(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition duration-150 ease-in-out">
                        Salvar Registro
                    </button>
                </div>
            )}
        </form>
    );
};

export default LogForm;