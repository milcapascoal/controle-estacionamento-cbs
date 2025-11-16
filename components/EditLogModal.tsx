import React, { useState, useEffect } from 'react';
import { Vehicle, ParkingLog, UniversityLink, VehicleType, EditHistoryLog } from '../types';
import { EditFormData } from '../App';

interface EditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EditFormData) => void;
  logToEdit: {
    log: ParkingLog;
    vehicle: Vehicle;
  };
}

const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
);


const EditLogModal: React.FC<EditLogModalProps> = ({ isOpen, onClose, onSave, logToEdit }) => {
  const [formData, setFormData] = useState<EditFormData>({
    vehicle: {
      plate: '', ownerName: '', model: '', color: '', universityLink: 'Discente', type: 'Carro'
    },
    log: {
      date: '', entryTime: '', exitTime: ''
    }
  });

  useEffect(() => {
    if (logToEdit) {
      setFormData({
        vehicle: {
          plate: logToEdit.vehicle.plate,
          ownerName: logToEdit.vehicle.ownerName,
          model: logToEdit.vehicle.model,
          color: logToEdit.vehicle.color,
          universityLink: logToEdit.vehicle.universityLink,
          type: logToEdit.vehicle.type,
        },
        log: {
          date: logToEdit.log.date,
          entryTime: logToEdit.log.entryTime,
          exitTime: logToEdit.log.exitTime || '',
        }
      });
    }
  }, [logToEdit]);

  if (!isOpen || !logToEdit) return null;

  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, vehicle: { ...prev.vehicle, [id]: value } }));
  };
  
  const handleLogChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, log: { ...prev.log, [id]: value } }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const formatHistoryTimestamp = (isoString: string) => {
      return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(isoString));
  }
  
  const allHistory = [
      ...(logToEdit.vehicle.editHistory || []).map(h => ({...h, source: 'Veículo'})),
      ...(logToEdit.log.editHistory || []).map(h => ({...h, source: 'Registro'}))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up">
        <div className="p-6 border-b">
            <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-slate-700">Editar Registro</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <p className="text-sm text-slate-500 mt-1">Altere os dados do veículo ou do registro de estacionamento.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Coluna de Edição */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-600 border-b pb-2">Dados do Veículo</h3>
                     <div>
                        <label htmlFor="plate" className="block text-sm font-medium text-slate-600">Placa</label>
                        <input type="text" id="plate" value={formData.vehicle.plate} onChange={handleVehicleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="ownerName" className="block text-sm font-medium text-slate-600">Proprietário</label>
                        <input type="text" id="ownerName" value={formData.vehicle.ownerName} onChange={handleVehicleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label htmlFor="model" className="block text-sm font-medium text-slate-600">Modelo</label>
                        <input type="text" id="model" value={formData.vehicle.model} onChange={handleVehicleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                        <label htmlFor="color" className="block text-sm font-medium text-slate-600">Cor</label>
                        <input type="text" id="color" value={formData.vehicle.color} onChange={handleVehicleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-600 border-b pb-2 pt-4">Dados do Registro</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-slate-600">Data</label>
                            <input type="date" id="date" value={formData.log.date} onChange={handleLogChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="entryTime" className="block text-sm font-medium text-slate-600">Entrada</label>
                            <input type="time" id="entryTime" value={formData.log.entryTime} onChange={handleLogChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                         <div>
                            <label htmlFor="exitTime" className="block text-sm font-medium text-slate-600">Saída</label>
                            <input type="time" id="exitTime" value={formData.log.exitTime || ''} onChange={handleLogChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>
                </div>

                {/* Coluna de Histórico */}
                <div className="space-y-4 bg-slate-50 p-4 rounded-lg border">
                     <h3 className="text-lg font-semibold text-slate-600 border-b pb-2 flex items-center"><HistoryIcon /> Histórico de Alterações</h3>
                     {allHistory.length > 0 ? (
                        <div className="space-y-3 text-sm max-h-80 overflow-y-auto pr-2">
                            {allHistory.map((entry, index) => (
                                <div key={index} className="border-b border-slate-200 pb-2 last:border-b-0">
                                    <p className="font-semibold text-slate-700">
                                        <span className="font-bold">{entry.field}</span> alterado
                                    </p>
                                    <p className="text-slate-500">
                                        De: <span className="font-medium text-red-600">{entry.oldValue || 'vazio'}</span>
                                    </p>
                                    <p className="text-slate-500">
                                        Para: <span className="font-medium text-green-600">{entry.newValue || 'vazio'}</span>
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {formatHistoryTimestamp(entry.timestamp)} por {entry.editedBy}
                                    </p>
                                </div>
                            ))}
                        </div>
                     ) : (
                         <p className="text-sm text-slate-500 text-center py-8">Nenhuma alteração registrada.</p>
                     )}
                </div>
            </div>

            <div className="flex justify-end p-6 border-t bg-slate-50 rounded-b-lg">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 mr-2">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">Salvar Alterações</button>
            </div>
        </form>

      </div>
    </div>
  );
};

export default EditLogModal;
