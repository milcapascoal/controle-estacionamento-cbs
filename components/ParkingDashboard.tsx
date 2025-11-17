import React, { useState, useMemo } from 'react';
import { Vehicle, ParkingLog, DetailedOccupancyStats } from '../types';
import LogForm from './LogForm';
import DailyLogList from './DailyLogList';
import OccupancyStats from './OccupancyStats';

interface ParkingDashboardProps {
  vehicles: Vehicle[];
  parkingLogs: ParkingLog[];
  onSaveLog: (logData: Omit<ParkingLog, 'id' | 'plate' | 'operatorName'>) => void;
  onOpenEditModal: (log: ParkingLog) => void;
  stats: DetailedOccupancyStats;
  isLoading: boolean;
}

const ParkingDashboard: React.FC<ParkingDashboardProps> = ({ vehicles, parkingLogs, onSaveLog, onOpenEditModal, stats, isLoading }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const dailyLogs = useMemo(() => {
    return parkingLogs
      .filter(log => log.date === selectedDate)
      .sort((a, b) => a.entryTime.localeCompare(b.entryTime));
  }, [parkingLogs, selectedDate]);

  return (
    <div className="space-y-8">
      <OccupancyStats stats={stats} isLoading={isLoading} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-slate-700">Registrar Entrada/Saída</h2>
            <div className="mb-6">
              <label htmlFor="log-date" className="block text-sm font-medium text-slate-600 mb-1">
                Data do Registro
              </label>
              <input
                id="log-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <LogForm 
              vehicles={vehicles} 
              onSaveLog={onSaveLog} 
              selectedDate={selectedDate}
              dailyLogs={dailyLogs}
              isLoading={isLoading}
            />
          </div>
        </div>
        <div className="lg:col-span-2">
           <DailyLogList 
              dailyLogs={dailyLogs} 
              vehicles={vehicles} 
              selectedDate={selectedDate}
              onOpenEditModal={onOpenEditModal}
              isLoading={isLoading}
           />
        </div>
      </div>
    </div>
  );
};

export default ParkingDashboard;