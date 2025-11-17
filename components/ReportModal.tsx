import React, { useState, useMemo } from 'react';
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
  const [logSearchResults, setLogSearchResults] = useState<FormattedLog[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const filteredVehicles = useMemo(() => {
    if (!vehicleSearchTerm) {
      return vehicles;
    }
    const lowercasedTerm = vehicleSearchTerm.toLowerCase();
    return vehicles.filter(v =>
        v.plate.toLowerCase().includes(lowercasedTerm) ||
        v.ownerName.toLowerCase().includes(lowercasedTerm) ||
        v.model.toLowerCase().includes(lowercasedTerm)
    );
  }, [vehicles, vehicleSearchTerm]);

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

  const handleSearchLogs = () => {
    if (reportType === 'logs' && (!startDate || !endDate || startDate > endDate)) {
        setMessage('Por favor, selecione um intervalo de datas válido.');
        return;
    }
    setSearchPerformed(true);
    setMessage('');
    
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

    const formattedResults: FormattedLog[] = filteredLogs.map(log => {
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
    }).sort((a,b) => (a.Data + a.Entrada).localeCompare(b.Data + b.Entrada));
    
    setLogSearchResults(formattedResults);
  };
  
  const handleExportSearchResults = () => {
      if (logSearchResults.length > 0) {
          exportToCsv(logSearchResults, `relatorio_filtrado_${startDate}_a_${endDate}.csv`);
      }
  }
  
  const clearSearch = () => {
      setLogSearchTerm('');
      setVehicleSearchTerm('');
      setLogSearchResults([]);
      setSearchPerformed(false);
      setMessage('');
  };
  
  const handleClose = () => {
    clearSearch();
    setReportType('logs');
    setStartDate(today);
    setEndDate(today);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-in-up">
        <div className="p-6 border-b">
            <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-slate-700">Gerar Relatório e Consultar</h2>
                 <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
             <p className="text-sm text-slate-500 mt-1">Selecione o tipo de relatório, filtre por data e pesquise por registros específicos.</p>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
            <div className="space-y-4">
                <div>
                    <label htmlFor="reportType" className="block text-sm font-medium text-slate-600">Tipo de Relatório</label>
                    <select 
                        id="reportType" 
                        value={reportType} 
                        onChange={e => {
                            setReportType(e.target.value as 'logs' | 'vehicles');
                            clearSearch();
                        }} 
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="logs">Registros de Estacionamento</option>
                        <option value="vehicles">Consultar Veículos Cadastrados</option>
                    </select>
                </div>

                {reportType === 'logs' && (
                  <div className="space-y-4 border-t border-slate-200 pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                              <label htmlFor="startDate" className="block text-sm font-medium text-slate-600">Data de Início</label>
                              <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                          </div>
                          <div>
                              <label htmlFor="endDate" className="block text-sm font-medium text-slate-600">Data de Fim</label>
                              <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                          </div>
                      </div>
                      <div>
                          <label htmlFor="logSearchTerm" className="block text-sm font-medium text-slate-600">Buscar por Placa ou Proprietário (Opcional)</label>
                          <input type="text" id="logSearchTerm" value={logSearchTerm} onChange={e => setLogSearchTerm(e.target.value)} placeholder="Digite para filtrar os resultados..." className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                      </div>
                      <div className="flex justify-end">
                        <button type="button" onClick={handleSearchLogs} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">Buscar Registros</button>
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
                
                {message && <div className="p-3 rounded-md text-sm bg-red-100 text-red-800">{message}</div>}
                
                {reportType === 'vehicles' && (
                     <div className="mt-6 border-t border-slate-200 pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-700">
                                {`Veículos Encontrados (${filteredVehicles.length})`}
                            </h3>
                            <button onClick={handleVehicleExport} className="text-sm px-3 py-1 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700">Exportar Lista</button>
                        </div>
                        {filteredVehicles.length > 0 ? (
                            <div className="overflow-x-auto max-h-64 border rounded-lg">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Proprietário</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Placa/ID</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Veículo</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Vínculo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {filteredVehicles.map((vehicle) => (
                                            <tr key={vehicle.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-800">{vehicle.ownerName}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-600 font-mono">{vehicle.plate}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-600">{`${vehicle.model} - ${vehicle.color}`}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-600">{vehicle.universityLink}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-slate-50 rounded-lg">
                                <p className="text-slate-500">Nenhum veículo encontrado para os filtros selecionados.</p>
                            </div>
                        )}
                    </div>
                )}

                {searchPerformed && reportType === 'logs' && (
                    <div className="mt-6 border-t border-slate-200 pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-700">Resultados da Busca</h3>
                            <div className="flex items-center space-x-2">
                                <button onClick={clearSearch} className="text-sm px-3 py-1 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300">Limpar Busca</button>
                                {logSearchResults.length > 0 && (
                                    <button onClick={handleExportSearchResults} className="text-sm px-3 py-1 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700">Exportar Resultados</button>
                                )}
                            </div>
                        </div>
                        {logSearchResults.length > 0 ? (
                            <div className="overflow-x-auto max-h-60 border rounded-lg">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Data</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Proprietário</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Placa/ID</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Entrada</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Saída</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {logSearchResults.map((log, index) => (
                                            <tr key={index} className="hover:bg-slate-50">
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-600">{log.Data}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-800">{log.Proprietário}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-600 font-mono">{log['Placa/ID']}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-green-600 font-semibold">{log.Entrada}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-red-600 font-semibold">{log.Saída}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-slate-50 rounded-lg">
                                <p className="text-slate-500">Nenhum registro encontrado para os filtros selecionados.</p>
                            </div>
                        )}
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