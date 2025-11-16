export type UniversityLink = 'Discente' | 'Servidor Docente' | 'Servidor Técnico Administrativo' | 'Visitante';
export type VehicleType = 'Carro' | 'Moto' | 'Bicicleta';
export type UserRole = 'Administrador' | 'Operador';

export interface User {
  uid: string; // ID único do Firebase Auth
  email: string;
  role: UserRole;
}

export interface EditHistoryLog {
  timestamp: string;
  editedBy: string;
  field: string;
  oldValue: string;
  newValue: string;
}

export interface Vehicle {
  id: string; // ID único do documento no Firestore
  plate: string;
  ownerName: string;
  universityLink: UniversityLink;
  model: string;
  color: string;
  type: VehicleType;
  registeredBy: string; // Quem cadastrou o veículo (e-mail do operador)
  editHistory?: EditHistoryLog[];
}

export interface ParkingLog {
  id: string; // ID único do documento no Firestore
  vehicleId: string; // Referencia o Vehicle.id
  plate: string; // Mantido para referência rápida, mas a fonte da verdade é o veículo
  date: string; // YYYY-MM-DD
  entryTime: string; // HH:MM
  exitTime: string | null; // HH:MM
  operatorName: string; // Quem registrou a entrada/saída (e-mail do operador)
  editHistory?: EditHistoryLog[];
}

export interface OccupancyStatDetails {
  occupied: number;
  available: number;
  total: number;
}

export interface DetailedOccupancyStats {
  cars: OccupancyStatDetails;
  motorcycles: OccupancyStatDetails;
  bicycles: OccupancyStatDetails;
}

export interface ParkingConfig {
  totalCarSpots: number;
  totalMotorcycleSpots: number;
  totalBicycleSpots: number;
}
