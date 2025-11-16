import React from 'react';
import { User, UserRole } from '../types';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User;
  onDeleteUser: (uid: string) => void;
  onChangeUserRole: (uid: string, newRole: UserRole) => void;
}

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const UserManagementModal: React.FC<UserManagementModalProps> = ({ isOpen, onClose, users, currentUser, onDeleteUser, onChangeUserRole }) => {

  const handleDeleteClick = (user: User) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${user.email}? Esta ação não pode ser desfeita.`)) {
      onDeleteUser(user.uid);
    }
  };

  if (!isOpen) return null;
  
  const adminCount = users.filter(u => u.role === 'Administrador').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-6 relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <h2 className="text-2xl font-bold mb-6 text-slate-700">Gerenciar Usuários</h2>
        
        <div className="max-h-96 overflow-y-auto pr-2">
            <div className="space-y-3">
                {users.map((user) => {
                    const isSelf = user.uid === currentUser.uid;
                    const isLastAdmin = user.role === 'Administrador' && adminCount === 1;
                    const roleColor = user.role === 'Administrador' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800';

                    return (
                        <div 
                            key={user.uid} 
                            className="grid grid-cols-3 gap-4 items-center bg-slate-50 p-3 rounded-lg border border-slate-200"
                        >
                            <div className="col-span-1 truncate">
                                <p className="font-semibold text-slate-800">{user.email}</p>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColor}`}>{user.role}</span>
                            </div>

                            <div className="col-span-1">
                                {!isSelf && (
                                    <select
                                        value={user.role}
                                        onChange={(e) => onChangeUserRole(user.uid, e.target.value as UserRole)}
                                        className="w-full text-sm px-3 py-1.5 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-200 disabled:cursor-not-allowed"
                                        disabled={isLastAdmin}
                                        aria-label={`Mudar permissão de ${user.email}`}
                                    >
                                        <option value="Operador">Operador</option>
                                        <option value="Administrador">Administrador</option>
                                    </select>
                                )}
                            </div>
                           
                            <div className="col-span-1 flex justify-end items-center">
                                {isSelf ? (
                                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Você</span>
                                ) : (
                                    <button
                                        onClick={() => handleDeleteClick(user)}
                                        className="p-2 text-red-500 hover:bg-red-100 rounded-full focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-colors disabled:text-slate-400 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                                        title={`Excluir ${user.email}`}
                                        disabled={isLastAdmin}
                                    >
                                        <TrashIcon />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {users.length === 0 && (
                 <div className="text-center py-10">
                    <p className="text-slate-500">Nenhum usuário cadastrado.</p>
                </div>
            )}
        </div>

        <div className="flex justify-end pt-6 mt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400">Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementModal;