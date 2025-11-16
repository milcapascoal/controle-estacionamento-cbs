import React from 'react';
import { DetailedOccupancyStats } from '../types';

interface VehicleTypeStatCardProps {
    title: string;
    occupied: number;
    total: number;
    icon: React.ReactNode;
    progressColor: string;
}

const CarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.3,2.03C10.52,2.4,9.48,2.4,8.7,2.03L8.26,1.8C7.19,1.3,6,1.89,5.51,2.94l-1.1,2.43C4.16,6,4,6.5,4,7.02V13c0,1.1,0.9,2,2,2h8c1.1,0,2-0.9,2-2V7.02c0-0.52-0.16-1.02-0.41-1.41l-1.1-2.43C14,1.89,12.81,1.3,11.74,1.8l-0.44,0.23H11.3z M6.5,12C5.67,12,5,11.33,5,10.5S5.67,9,6.5,9S8,9.67,8,10.5S7.33,12,6.5,12z M13.5,12c-0.83,0-1.5-0.67-1.5-1.5S12.67,9,13.5,9S15,9.67,15,10.5S14.33,12,13.5,12z" />
    </svg>
);

const MotorcycleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path d="M15.5,6.5h-1.93L12.5,2.54C12.35,2.2,12,2,11.64,2H8.36C8,2,7.65,2.2,7.5,2.54L6.43,6.5H4.5C3.67,6.5,3,7.17,3,8v5.5c0,0.45,0.22,0.85,0.57,1.11l1.43,1.07c0.23,0.17,0.52,0.27,0.82,0.27H6c0.55,0,1-0.45,1-1v-2h6v2c0,0.55,0.45,1,1,1h1.18c0.3,0,0.59-0.09,0.82-0.27l1.43-1.07c0.35-0.26,0.57-0.66,0.57-1.11V8C17,7.17,16.33,6.5,15.5,6.5z M8.5,4h3l0.6,2.5H7.9L8.5,4z M6.5,12C5.67,12,5,11.33,5,10.5S5.67,9,6.5,9S8,9.67,8,10.5S7.33,12,6.5,12z M13.5,12c-0.83,0-1.5-0.67-1.5-1.5S12.67,9,13.5,9S15,9.67,15,10.5S14.33,12,13.5,12z"/>
    </svg>
);

const BicycleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path d="M15.5,4.5c0-1.38-1.12-2.5-2.5-2.5S10.5,3.12,10.5,4.5S11.62,7,13,7S15.5,5.88,15.5,4.5z M7,4.5C7,3.12,5.88,2,4.5,2S2,3.12,2,4.5S3.12,7,4.5,7S7,5.88,7,4.5z M13,9c-2.07,0-3.81,1.24-4.58,3H13v-1.5c0-0.28,0.22-0.5,0.5-0.5s0.5,0.22,0.5,0.5V11h1.5c0.28,0,0.5-0.22,0.5-0.5S15.28,10,15,10h-1.15C13.55,9.39,13.29,9.15,13,9z M4.5,9C4.21,9.15,3.95,9.39,3.65,10H2.5C2.22,10,2,10.22,2,10.5S2.22,11,2.5,11H4v1.5C4,12.78,4.22,13,4.5,13S5,12.78,5,12.5V12h2.58C6.81,10.24,5.07,9,3,9C2.71,9,2.45,9.07,2.2,9.2L2.5,15h1.88l1.73-4.32C6.18,10.26,6,9.89,6,9.5C6,8.12,7.12,7,8.5,7h3C11.78,7,12,7.22,12,7.5S11.78,8,11.5,8h-3C7.67,8,7,8.67,7,9.5c0,0.39,0.18,0.76,0.47,1.18L5.62,15H7.5l0.71-1.78c0.26,0.1,0.53,0.18,0.81,0.22l-0.7,1.56H12l1.5-4h-0.6c-0.28,0-0.5,0.22-0.5,0.5s0.22,0.5,0.5,0.5H14c0.57,0,1.06,0.41,1.11,0.96l0.55,4.54H17l-0.66-5.5C16.27,9.65,15.68,9,14.88,9H13z"/>
    </svg>
);

const VehicleTypeStatCard: React.FC<VehicleTypeStatCardProps> = ({ title, occupied, total, icon, progressColor }) => {
    const percentage = total > 0 ? (occupied / total) * 100 : 0;
    const available = Math.max(0, total - occupied);

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col justify-between">
            <div className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
                        <p className="text-4xl font-bold text-slate-800 mt-1">
                            {occupied} <span className="text-2xl font-medium text-slate-400">/ {total}</span>
                        </p>
                         <p className="text-sm font-semibold text-green-600 mt-2">{available} Vagas Livres</p>
                    </div>
                     <div className="p-4 rounded-full bg-slate-800">
                        {icon}
                    </div>
                </div>
            </div>
            <div className="w-full bg-slate-200 h-2.5">
                <div 
                    className={`h-2.5 rounded-r-full transition-all duration-500 ${progressColor}`} 
                    style={{ width: `${percentage}%` }}>
                </div>
            </div>
        </div>
    );
};


const OccupancyStats: React.FC<{ stats: DetailedOccupancyStats }> = ({ stats }) => {
  const getProgressColor = (occupied: number, total: number) => {
    if (total === 0) return 'bg-slate-400';
    const percentage = (occupied / total) * 100;
    if (percentage > 85) return 'bg-red-500';
    if (percentage > 60) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <VehicleTypeStatCard
        title="Vagas para Carros"
        occupied={stats.cars.occupied}
        total={stats.cars.total}
        icon={<CarIcon />}
        progressColor={getProgressColor(stats.cars.occupied, stats.cars.total)}
      />
      <VehicleTypeStatCard
        title="Vagas para Motos"
        occupied={stats.motorcycles.occupied}
        total={stats.motorcycles.total}
        icon={<MotorcycleIcon />}
        progressColor={getProgressColor(stats.motorcycles.occupied, stats.motorcycles.total)}
      />
      <VehicleTypeStatCard
        title="Vagas para Bicicletas"
        occupied={stats.bicycles.occupied}
        total={stats.bicycles.total}
        icon={<BicycleIcon />}
        progressColor={getProgressColor(stats.bicycles.occupied, stats.bicycles.total)}
      />
    </div>
  );
};

export default OccupancyStats;
