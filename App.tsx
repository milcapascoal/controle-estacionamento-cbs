import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase/config';
import { collection, onSnapshot, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';

import Header from './components/Header';
import ParkingDashboard from './components/ParkingDashboard';
import VehicleRegistrationModal from './components/VehicleRegistrationModal';
import ReportModal from './components/ReportModal';
import Footer from './components/Footer';
import EditLogModal from './components/EditLogModal';
import LoadingSpinner from './components/LoadingSpinner';
import SettingsModal from './components/SettingsModal';
import { Vehicle, ParkingLog, EditHistoryLog, DetailedOccupancyStats, ParkingConfig } from './types';

export interface EditFormData {
  vehicle: Pick<Vehicle, 'plate' | 'ownerName' | 'model' | 'color' | 'universityLink' | 'type'>;
  log: Pick<ParkingLog, 'date' | 'entryTime' | 'exitTime'>;
}

const DEFAULT_PARKING_CONFIG: ParkingConfig = {
  totalCarSpots: 100,
  totalMotorcycleSpots: 40,
  totalBicycleSpots: 10,
};

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [logToEdit, setLogToEdit] = useState<{ log: ParkingLog; vehicle: Vehicle } | null>(null);

  // Estados de carregamento individuais para uma experiência de UI mais reativa
  const [dataLoading, setDataLoading] = useState(true);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [parkingLogs, setParkingLogs] = useState<ParkingLog[]>([]);
  const [parkingConfig, setParkingConfig] = useState<ParkingConfig>(DEFAULT_PARKING_CONFIG);

  // Efeito para buscar dados do Firestore em tempo real
  useEffect(() => {
    setDataLoading(true);

    const configDocRef = doc(db, 'settings', 'parkingConfig');
    const unsubscribeConfig = onSnapshot(configDocRef, (docSnap) => {
        if (docSnap.exists()) {
            setParkingConfig(docSnap.data() as ParkingConfig);
        } else {
            setDoc(configDocRef, DEFAULT_PARKING_CONFIG);
            setParkingConfig(DEFAULT_PARKING_CONFIG);
        }
    }, (error) => {
        console.error("Erro ao carregar configurações:", error);
    });
    
    const unsubscribeVehicles = onSnapshot(collection(db, 'vehicles'), snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
      setVehicles(data);
    }, (error) => {
        console.error("Erro ao carregar veículos:", error);
    });

    const unsubscribeLogs = onSnapshot(collection(db, 'parkingLogs'), snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ParkingLog));
      setParkingLogs(data);
    }, (error) => {
        console.error("Erro ao carregar registros:", error);
    });
    
    // Simula o fim do carregamento após um curto período para garantir que todos os listeners se estabeleçam.
    // Em uma app real, poderíamos usar Promises.all se as buscas fossem one-time gets.
    const timer = setTimeout(() => setDataLoading(false), 1500);

    return () => {
      unsubscribeConfig();
      unsubscribeVehicles();
      unsubscribeLogs();
      clearTimeout(timer);
    };
  }, []);

  const occupancyStats: DetailedOccupancyStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const vehicleTypeMap = new Map(vehicles.map(v => [v.id, v.type]));
    const activeLogs = parkingLogs.filter(log => log.date === today && !log.exitTime);

    let occupiedCars = 0;
    let occupiedMotorcycles = 0;
    let occupiedBicycles = 0;

    activeLogs.forEach(log => {
      const type = vehicleTypeMap.get(log.vehicleId);
      if (type === 'Carro') occupiedCars++;
      else if (type === 'Moto') occupiedMotorcycles++;
      else if (type === 'Bicicleta') occupiedBicycles++;
    });

    return {
      cars: {
        occupied: occupiedCars,
        available: Math.max(0, parkingConfig.totalCarSpots - occupiedCars),
        total: parkingConfig.totalCarSpots,
      },
      motorcycles: {
        occupied: occupiedMotorcycles,
        available: Math.max(0, parkingConfig.totalMotorcycleSpots - occupiedMotorcycles),
        total: parkingConfig.totalMotorcycleSpots,
      },
      bicycles: {
        occupied: occupiedBicycles,
        available: Math.max(0, parkingConfig.totalBicycleSpots - occupiedBicycles),
        total: parkingConfig.totalBicycleSpots,
      },
    };
  }, [parkingLogs, vehicles, parkingConfig]);

  const handleSaveSettings = async (newConfig: ParkingConfig) => {
    const configDocRef = doc(db, 'settings', 'parkingConfig');
    await setDoc(configDocRef, newConfig, { merge: true });
    setIsSettingsModalOpen(false);
  };

  const handleRegisterVehicle = async (newVehicleData: Omit<Vehicle, 'registeredBy' | 'id'>): Promise<{ success: boolean, message: string }> => {
    const existingVehicleQuery = query(collection(db, "vehicles"), where("plate", "==", newVehicleData.plate));
    const querySnapshot = await getDocs(existingVehicleQuery);

    if (!querySnapshot.empty && newVehicleData.type !== 'Bicicleta') {
        return { success: false, message: 'Veículo com esta placa já cadastrado.' };
    }

    const newVehicle = {
      ...newVehicleData,
      registeredBy: 'Sistema',
    };
    await addDoc(collection(db, "vehicles"), newVehicle);
    return { success: true, message: 'Veículo cadastrado com sucesso!' };
  };

  const handleSaveLog = async (logData: Omit<ParkingLog, 'id' | 'operatorName' | 'plate'>) => {
    const operatorName = 'Sistema';
    const vehicle = vehicles.find(v => v.id === logData.vehicleId);
    if (!vehicle) return;

    const q = query(collection(db, "parkingLogs"), where("vehicleId", "==", logData.vehicleId), where("date", "==", logData.date));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const logDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, "parkingLogs", logDoc.id), { ...logData, operatorName, plate: vehicle.plate });
    } else {
        await addDoc(collection(db, "parkingLogs"), { ...logData, operatorName, plate: vehicle.plate });
    }
  };

  const handleOpenEditModal = (log: ParkingLog) => {
    const vehicle = vehicles.find(v => v.id === log.vehicleId);
    if (vehicle) {
      setLogToEdit({ log, vehicle });
      setIsEditModalOpen(true);
    } else {
      alert('Erro: Veículo associado a este registro não foi encontrado.');
    }
  };
  
  const handleUpdateLogAndVehicle = async (updatedData: EditFormData) => {
    if (!logToEdit) return;
  
    const { log: originalLog, vehicle: originalVehicle } = logToEdit;
    const { log: updatedLogData, vehicle: updatedVehicleData } = updatedData;
  
    const vehicleHistory: EditHistoryLog[] = originalVehicle.editHistory || [];
    const logHistory: EditHistoryLog[] = originalLog.editHistory || [];
    const timestamp = new Date().toISOString();
  
    const createHistoryEntry = (field: string, oldValue: any, newValue: any): EditHistoryLog | null => {
      if (String(oldValue) !== String(newValue)) {
        return { field, oldValue: String(oldValue), newValue: String(newValue), editedBy: 'Sistema', timestamp };
      }
      return null;
    };
  
    const vehicleFieldMap: Record<keyof typeof updatedVehicleData, string> = { plate: 'Placa', ownerName: 'Proprietário', model: 'Modelo', color: 'Cor', universityLink: 'Vínculo', type: 'Tipo' };
    Object.keys(updatedVehicleData).forEach(key => {
        const fieldKey = key as keyof typeof updatedVehicleData;
        const entry = createHistoryEntry(vehicleFieldMap[fieldKey], originalVehicle[fieldKey], updatedVehicleData[fieldKey]);
        if (entry) vehicleHistory.push(entry);
    });

    const logFieldMap: Record<keyof typeof updatedLogData, string> = { date: 'Data', entryTime: 'Entrada', exitTime: 'Saída' };
     Object.keys(updatedLogData).forEach(key => {
        const fieldKey = key as keyof typeof updatedLogData;
        const entry = createHistoryEntry(logFieldMap[fieldKey], originalLog[fieldKey], updatedLogData[fieldKey]);
        if (entry) logHistory.push(entry);
    });
  
    const vehicleDocRef = doc(db, 'vehicles', originalVehicle.id);
    await updateDoc(vehicleDocRef, { ...updatedVehicleData, editHistory: vehicleHistory });
    
    const logDocRef = doc(db, 'parkingLogs', originalLog.id);
    await updateDoc(logDocRef, { ...updatedLogData, plate: updatedVehicleData.plate, editHistory: logHistory });
  
    setIsEditModalOpen(false);
    setLogToEdit(null);
  };
  
  if (dataLoading) {
      return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Header 
        onOpenModal={() => setIsModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />
      <main className="p-4 sm:p-6 lg:p-8 flex-grow">
        <ParkingDashboard 
          vehicles={vehicles}
          parkingLogs={parkingLogs}
          onSaveLog={handleSaveLog}
          onOpenEditModal={handleOpenEditModal}
          stats={occupancyStats}
          isLoading={dataLoading}
        />
      </main>
      <Footer />
      <VehicleRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRegister={handleRegisterVehicle}
      />
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        vehicles={vehicles}
        parkingLogs={parkingLogs}
      />
      <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          currentConfig={parkingConfig}
          onSave={handleSaveSettings}
      />
      {logToEdit && (
        <EditLogModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          logToEdit={logToEdit}
          onSave={handleUpdateLogAndVehicle}
        />
      )}
    </div>
  );
}

export default App;
