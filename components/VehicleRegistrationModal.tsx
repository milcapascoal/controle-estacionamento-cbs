
import React, { useState } from 'react';
import { Vehicle, UniversityLink, VehicleType } from '../types';

interface VehicleRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (vehicle: Omit<Vehicle, 'registeredBy' | 'id'>) => Promise<{ success: boolean, message: string }>;
}

const VehicleRegistrationModal: React.FC<VehicleRegistrationModalProps> = ({ isOpen, onClose, onRegister }) => {
  const [plate, setPlate] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [universityLink, setUniversityLink] = useState<UniversityLink>('Discente');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Carro');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isBicycle = vehicleType === 'Bicicleta';

    if ((!isBicycle && !plate) || !ownerName || !model || !color) {
        setMessage('Todos os campos obrigatórios devem ser preenchidos.');
        setIsSuccess(false);
        return;
    }
    
    setIsRegistering(true);
    setMessage('');

    try {
        const vehiclePlate = isBicycle ? `BICI-${Date.now()}` : plate.toUpperCase();
        const result = await onRegister({ 
            plate: vehiclePlate, 
            ownerName, 
            universityLink, 
            model, 
            color, 
            type: vehicleType 
        });
        
        setMessage(result.message);
        setIsSuccess(result.success);

        if (result.success) {
          setTimeout(() => {
            handleClose();
          }, 1500);
        }
    } catch (error) {
        console.error("Erro ao cadastrar veículo:", error);
        setMessage("Ocorreu um erro ao cadastrar o veículo. Por favor, tente novamente.");
        setIsSuccess(false);
    } finally {
        setIsRegistering(false);
    }
  };
  
  const handleClose = () => {
    setPlate('');
    setOwnerName('');
    setUniversityLink('Discente');
    setModel('');
    setColor('');
    setVehicleType('Carro');
    setMessage('');
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative animate-fade-in-up">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <h2 className="text-2xl font-bold mb-6 text-slate-700">Cadastrar Novo Veículo</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {vehicleType !== 'Bicicleta' && (
            <div>
              <label htmlFor="plate" className="block text-sm font-medium text-slate-600">Placa</label>
              <input type="text" id="plate" value={plate} onChange={e => setPlate(e.target.value.toUpperCase())} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
          )}
          <div>
            <label htmlFor="ownerName" className="block text-sm font-medium text-slate-600">Nome do Proprietário/Responsável</label>
            <input type="text" id="ownerName" value={ownerName} onChange={e => setOwnerName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
          </div>
           <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="universityLink" className="block text-sm font-medium text-slate-600">Vínculo</label>
              <select id="universityLink" value={universityLink} onChange={e => setUniversityLink(e.target.value as UniversityLink)} className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option>Discente</option>
                <option>Servidor Docente</option>
                <option>Servidor Técnico Administrativo</option>
                <option>Visitante</option>
              </select>
            </div>
            <div>
              <label htmlFor="vehicleType" className="block text-sm font-medium text-slate-600">Tipo</label>
              <select id="vehicleType" value={vehicleType} onChange={e => setVehicleType(e.target.value as VehicleType)} className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option>Carro</option>
                <option>Moto</option>
                <option>Bicicleta</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-slate-600">Modelo</label>
              <input type="text" id="model" value={model} onChange={e => setModel(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required/>
            </div>
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-slate-600">Cor</label>
              <input type="text" id="color" value={color} onChange={e => setColor(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required/>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message}
            </div>
          )}

          <div className="flex justify-end pt-4 space-x-2">
            <button type="button" onClick={handleClose} disabled={isRegistering} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={isRegistering} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
              {isRegistering ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleRegistrationModal;
