
import React, { useState } from 'react';

interface LoginProps {
  // FIX: Changed prop types to accept async functions that return a Promise.
  onLogin: (email: string, password: string) => Promise<{ success: boolean, message: string }>;
  onRegister: (email: string, password: string) => Promise<{ success: boolean, message: string }>;
}

const LoginIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-indigo-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
);


const Login: React.FC<LoginProps> = ({ onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // FIX: Made handleSubmit async to allow awaiting the onLogin/onRegister functions.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
        setMessage('E-mail e senha são obrigatórios.');
        setIsSuccess(false);
        return;
    }
    
    const result = await (isRegister ? onRegister(email, password) : onLogin(email, password));
    setMessage(result.message);
    setIsSuccess(result.success);
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setMessage('');
    setIsSuccess(false);
    setEmail('');
    setPassword('');
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
         <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <LoginIcon />
            <h1 className="text-2xl font-bold text-slate-700 mb-2">{isRegister ? 'Criar Conta' : 'Acesso ao Sistema'}</h1>
            <p className="text-slate-500 mb-6 text-sm">
                {isRegister ? 'Preencha os dados para se cadastrar.' : 'Por favor, identifique-se para continuar.'}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">E-mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="Digite seu e-mail"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Senha</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="Digite sua senha"
                />
              </div>

            {message && (
                <div className={`p-3 rounded-md text-sm text-left ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message}
                </div>
            )}

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
              >
                {isRegister ? 'Cadastrar' : 'Entrar'}
              </button>
            </form>
            <p className="text-sm text-slate-500 mt-6">
                {isRegister ? 'Já tem uma conta?' : 'Não tem uma conta?'}
                <button onClick={toggleMode} className="font-semibold text-indigo-600 hover:text-indigo-500 ml-1 focus:outline-none">
                    {isRegister ? 'Entre aqui' : 'Cadastre-se'}
                </button>
            </p>
         </div>
         <p className="text-center text-xs text-slate-400 mt-6">
            Controle de Estacionamento - CBS
         </p>
         <p className="text-center text-xs text-slate-400 mt-2">
            Desenvolvido por Milca Pascoal (Diradm/CBS)
         </p>
      </div>
    </div>
  );
};

export default Login;
