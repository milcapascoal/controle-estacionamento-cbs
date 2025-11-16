import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from './firebase/config';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';

import Header from './components/Header';
import ParkingDashboard from './components/ParkingDashboard';
import VehicleRegistrationModal from './components/VehicleRegistrationModal';
import ReportModal from './components/ReportModal';
import Login from './components/Login';
import UserManagementModal from './components/UserManagementModal';
import Footer from './components/Footer';
import EditLogModal from './components/EditLogModal';
import LoadingSpinner from './components/LoadingSpinner';
import SettingsModal from './components/SettingsModal';
import { Vehicle, ParkingLog, User, UserRole, EditHistoryLog, DetailedOccupancyStats, ParkingConfig } from './types';

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
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [logToEdit, setLogToEdit] = useState<{ log: ParkingLog; vehicle: Vehicle } | null>(null);

  // Estados gerenciados pelo Firebase
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [parkingLogs, setParkingLogs] = useState<ParkingLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [parkingConfig, setParkingConfig] = useState<ParkingConfig>(DEFAULT_PARKING_CONFIG);

  // Efeito para monitorar o estado de autenticação do usuário
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            role: userDocSnap.data().role as UserRole,
          });
        } else {
          await signOut(auth);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Efeito para buscar dados do Firestore em tempo real
  useEffect(() => {
    if (!currentUser) {
      setVehicles([]);
      setParkingLogs([]);
      setUsers([]);
      setParkingConfig(DEFAULT_PARKING_CONFIG);
      setDataLoading(false);
      return;
    }
    
    setDataLoading(true);

    // Listener para as configurações de vagas
    const configDocRef = doc(db, 'settings', 'parkingConfig');
    const unsubscribeConfig = onSnapshot(configDocRef, (docSnap) => {
        if (docSnap.exists()) {
            setParkingConfig(docSnap.data() as ParkingConfig);
        } else {
            // Se não existir, cria com os valores padrão
            setDoc(configDocRef, DEFAULT_PARKING_CONFIG);
            setParkingConfig(DEFAULT_PARKING_CONFIG);
        }
    });
    
    const unsubscribes = [
      unsubscribeConfig,
      onSnapshot(collection(db, 'vehicles'), snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
        setVehicles(data);
      }),
      onSnapshot(collection(db, 'parkingLogs'), snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ParkingLog));
        setParkingLogs(data);
      }),
      onSnapshot(collection(db, 'users'), snapshot => {
        const data = snapshot.docs.map(doc => ({ ...doc.data() } as User));
        setUsers(data);
      }),
    ];
    
    const timer = setTimeout(() => setDataLoading(false), 1200);

    return () => {
      unsubscribes.forEach(unsub => unsub());
      clearTimeout(timer);
    };
  }, [currentUser]);

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

  const handleRegisterUser = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const isFirstUser = users.length === 0;
      const role: UserRole = isFirstUser ? 'Administrador' : 'Operador';
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          role: role
      });

      return { success: true, message: 'Cadastro realizado com sucesso!' };
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') return { success: false, message: 'Este e-mail já está cadastrado.' };
      if (error.code === 'auth/weak-password') return { success: false, message: 'A senha deve ter no mínimo 6 caracteres.' };
      return { success: false, message: 'Ocorreu um erro no cadastro.' };
    }
  };

  const handleLogin = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true, message: 'Login bem-sucedido!' };
    } catch (error: any) {
      return { success: false, message: 'E-mail ou senha inválidos.' };
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };
  
  const handleDeleteUser = async (uidToDelete: string) => {
    const userToDelete = users.find(user => user.uid === uidToDelete);
    if (!userToDelete) return;

    if (userToDelete.role === 'Administrador') {
        const adminCount = users.filter(u => u.role === 'Administrador').length;
        if (adminCount <= 1) {
            alert('Ação bloqueada: Não é possível excluir o único administrador do sistema.');
            return;
        }
    }
    // Nota: Esta ação remove o usuário do Firestore, mas não do Firebase Auth.
    // A exclusão completa requereria um ambiente de backend (Cloud Functions).
    await deleteDoc(doc(db, "users", uidToDelete));
  };

  const handleChangeUserRole = async (uid: string, newRole: UserRole) => {
    const userToChange = users.find(u => u.uid === uid);
    if (!userToChange) return;

    if (userToChange.role === 'Administrador' && newRole === 'Operador') {
      const adminCount = users.filter(u => u.role === 'Administrador').length;
      if (adminCount <= 1) {
        alert('Ação bloqueada: Não é possível remover a permissão do único administrador.');
        return;
      }
    }
    await updateDoc(doc(db, "users", uid), { role: newRole });
  };

  const handleSaveSettings = async (newConfig: ParkingConfig) => {
    const configDocRef = doc(db, 'settings', 'parkingConfig');
    await updateDoc(configDocRef, newConfig);
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
      registeredBy: currentUser?.email || 'Desconhecido',
    };
    await addDoc(collection(db, "vehicles"), newVehicle);
    return { success: true, message: 'Veículo cadastrado com sucesso!' };
  };

  const handleSaveLog = async (logData: Omit<ParkingLog, 'id' | 'operatorName' | 'plate'>) => {
    const operatorName = currentUser?.email || 'Desconhecido';
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
    if (!logToEdit || !currentUser) return;
  
    const { log: originalLog, vehicle: originalVehicle } = logToEdit;
    const { log: updatedLogData, vehicle: updatedVehicleData } = updatedData;
  
    const vehicleHistory: EditHistoryLog[] = originalVehicle.editHistory || [];
    const logHistory: EditHistoryLog[] = originalLog.editHistory || [];
    const timestamp = new Date().toISOString();
  
    const createHistoryEntry = (field: string, oldValue: any, newValue: any): EditHistoryLog | null => {
      if (String(oldValue) !== String(newValue)) {
        return { field, oldValue: String(oldValue), newValue: String(newValue), editedBy: currentUser.email, timestamp };
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
  
  if (authLoading || dataLoading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} onRegister={handleRegisterUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Header 
        onOpenModal={() => setIsModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main className="p-4 sm:p-6 lg:p-8 flex-grow">
        <ParkingDashboard 
          vehicles={vehicles}
          parkingLogs={parkingLogs}
          onSaveLog={handleSaveLog}
          onOpenEditModal={handleOpenEditModal}
          stats={occupancyStats}
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
      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        users={users}
        currentUser={currentUser}
        onDeleteUser={handleDeleteUser}
        onChangeUserRole={handleChangeUserRole}
      />
      {currentUser.role === 'Administrador' && (
        <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            currentConfig={parkingConfig}
            onSave={handleSaveSettings}
        />
      )}
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