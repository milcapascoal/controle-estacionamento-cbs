import React, { useState, useMemo, useEffect } from 'react';
import { Vehicle, ParkingLog } from '../types';
import { exportToCsv } from '../utils/export';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  parkingLogs: ParkingLog[];
}

type FormattedLog = {
    'Data': string;
    'Placa/ID': string;
    'Entrada': string;
    'Saída': string;
    'Proprietário': string;
    'Modelo': string;
    'Operador': string;
};

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, vehicles, parkingLogs }) => {
  const [reportType, setReportType] = useState<'logs' | 'vehicles'>('logs');
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [logSearchTerm, setLogSearchTerm] = useState('');
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  // Efeito para validar o intervalo de datas em tempo real
  useEffect(() => {
      if (startDate > endDate) {
          setMessage('A data de início não pode ser posterior à data de fim.');
      } else {
          setMessage('');
      }
  }, [startDate, endDate]);

  // Filtro em tempo real para veículos, ordenado por nome
  const filteredVehicles = useMemo(() => {
    if (!vehicleSearchTerm) {
      return vehicles;
    }
    const lowercasedTerm = vehicleSearchTerm.toLowerCase();
    return vehicles.filter(v =>
        v.plate.toLowerCase().includes(lowercasedTerm) ||
        v.ownerName.toLowerCase().includes(lowercasedTerm) ||
        v.model.toLowerCase().includes(lowercasedTerm)
    ).sort((a,b) => a.ownerName.localeCompare(b.ownerName));
  }, [vehicles, vehicleSearchTerm]);

  // Filtro e formatação em tempo real para registros de estacionamento
  const filteredAndFormattedLogs = useMemo(() => {
    if (startDate > endDate) {
        return []; // Retorna vazio se o intervalo de datas for inválido
    }
    const logsInDateRange = parkingLogs.filter(log => log.date >= startDate && log.date <= endDate);
    
    const lowercasedTerm = logSearchTerm.toLowerCase().trim();
    const filteredLogs = lowercasedTerm
      ? logsInDateRange.filter(log => {
          const vehicle = vehicles.find(v => v.id === log.vehicleId);
          if (!vehicle) return false;
          return (
              vehicle.plate.toLowerCase().includes(lowercasedTerm) ||
              vehicle.ownerName.toLowerCase().includes(lowercasedTerm)
          );
        })
      : logsInDateRange;

    return filteredLogs.map(log => {
        const vehicle = vehicles.find(v => v.id === log.vehicleId);
        return {
            'Data': log.date,
            'Placa/ID': log.plate,
            'Entrada': log.entryTime,
            'Saída': log.exitTime || 'N/A',
            'Proprietário': vehicle?.ownerName ?? 'Não encontrado',
            'Modelo': vehicle?.model ?? 'Não encontrado',
            'Operador': log.operatorName,
        };
    }).sort((a,b) => (b.Data + b.Entrada).localeCompare(a.Data + a.Entrada)); // Mais recentes primeiro
    
  }, [startDate, endDate, logSearchTerm, parkingLogs, vehicles]);
  
  const handleVehicleExport = () => {
      if (filteredVehicles.length === 0) {
          setMessage("Não há veículos para exportar com o filtro atual.");
          setTimeout(() => setMessage(''), 3000);
          return;
      }
      const dataToExport = filteredVehicles.map(({ plate, ownerName, universityLink, model, color, type, registeredBy }) => ({
        'Placa/ID': plate, 'Proprietário': ownerName, 'Vínculo': universityLink, 'Modelo': model, 'Cor': color, 'Tipo': type, 'Cadastrado Por': registeredBy,
      }));
      exportToCsv(dataToExport, 'lista_de_veiculos.csv');
  };
  
  const handleLogExport = () => {
      if (filteredAndFormattedLogs.length === 0) {
          setMessage("Não há registros para exportar com os filtros atuais.");
          setTimeout(() => setMessage(''), 3000);
          return;
      }
      exportToCsv(filteredAndFormattedLogs, `relatorio_estacionamento_${startDate}_a_${endDate}.csv`);
  }
  
  const handleClose = () => {
    setReportType('logs');
    setStartDate(today);
    setEndDate(today);
    setLogSearchTerm('');
    setVehicleSearchTerm('');
    setMessage('');
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in-up">
        <div className="p-6 border-b">
            <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-slate-700">Relatórios e Consultas</h2>
                 <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
             <p className="text-sm text-slate-500 mt-1">Consulte veículos e gere relatórios de estacionamento com filtros dinâmicos.</p>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
            <div className="space-y-4">
                <div>
                    <label htmlFor="reportType" className="block text-sm font-medium text-slate-600">Tipo de Consulta</label>
                    <select 
                        id="reportType" 
                        value={reportType} 
                        onChange={e => setReportType(e.target.value as 'logs' | 'vehicles')} 
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="logs">Registros de Estacionamento</option>
                        <option value="vehicles">Veículos Cadastrados</option>
                    </select>
                </div>

                {reportType === 'logs' && (
                  <div className="space-y-4 border-t border-slate-200 pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="sm:col-span-1">
                              <label htmlFor="startDate" className="block text-sm font-medium text-slate-600">Data de Início</label>
                              <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                          </div>
                          <div className="sm:col-span-1">
                              <label htmlFor="endDate" className="block text-sm font-medium text-slate-600">Data de Fim</label>
                              <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                          </div>
                          <div className="sm:col-span-1">
                              <label htmlFor="logSearchTerm" className="block text-sm font-medium text-slate-600">Buscar por Placa ou Proprietário</label>
                              <input type="text" id="logSearchTerm" value={logSearchTerm} onChange={e => setLogSearchTerm(e.target.value)} placeholder="Filtrar resultados..." className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                          </div>
                      </div>
                  </div>
                )}
                
                {reportType === 'vehicles' && (
                    <div className="space-y-4 border-t border-slate-200 pt-4">
                        <div>
                            <label htmlFor="vehicleSearchTerm" className="block text-sm font-medium text-slate-600">Buscar Veículo</label>
                            <input 
                                type="text" 
                                id="vehicleSearchTerm" 
                                value={vehicleSearchTerm} 
                                onChange={e => setVehicleSearchTerm(e.target.value)} 
                                placeholder="Buscar por placa, proprietário, modelo..." 
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
                            />
                        </div>
                    </div>
                )}
                
                {message && <div className="p-3 my-2 rounded-md text-sm bg-yellow-100 text-yellow-800">{message}</div>}
                
                {/* View para Veículos */}
                {reportType === 'vehicles' && (
                     <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-bold text-slate-700">
                                {`Veículos Encontrados (${filteredVehicles.length})`}
                            </h3>
                            <button onClick={handleVehicleExport} disabled={filteredVehicles.length === 0} className="text-sm px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed">Exportar para CSV</button>
                        </div>
                        <div className="overflow-auto max-h-80 border rounded-lg">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Proprietário</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Placa/ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Veículo</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vínculo</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {filteredVehicles.length > 0 ? filteredVehicles.map((vehicle) => (
                                        <tr key={vehicle.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-800">{vehicle.ownerName}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 font-mono">{vehicle.plate}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{`${vehicle.model} - ${vehicle.color}`}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{vehicle.universityLink}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="text-center py-10 text-slate-500">Nenhum veículo encontrado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* View para Registros */}
                {reportType === 'logs' && (
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-bold text-slate-700">{`Resultados Encontrados (${filteredAndFormattedLogs.length})`}</h3>
                            <button onClick={handleLogExport} disabled={filteredAndFormattedLogs.length === 0} className="text-sm px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed">Exportar para CSV</button>
                        </div>
                        <div className="overflow-auto max-h-80 border rounded-lg">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Proprietário</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Placa/ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Horários</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {filteredAndFormattedLogs.length > 0 ? filteredAndFormattedLogs.map((log, index) => (
                                        <tr key={index} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{log.Data}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-800">{log.Proprietário}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 font-mono">{log['Placa/ID']}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                <span className="font-semibold text-green-600">{log.Entrada}</span>
                                                <span className="mx-1 text-slate-400">→</span>
                                                <span className="font-semibold text-red-600">{log.Saída}</span>
                                            </td>
                                        </tr>
                                    )) : (
                                      <tr>
                                        <td colSpan={4} className="text-center py-10 text-slate-500">
                                          {startDate > endDate ? 'Intervalo de datas inválido.' : 'Nenhum registro encontrado para os filtros selecionados.'}
                                        </td>
                                      </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="flex justify-end p-4 border-t bg-slate-50 rounded-b-lg">
            <button type="button" onClick={handleClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400">Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
