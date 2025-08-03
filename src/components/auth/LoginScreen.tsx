import React, { useState } from 'react';
import { Shield, Building, Eye, EyeOff, Globe, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LogoVariations from '../common/LogoVariations';
import ApiConfigModal from '../common/ApiConfigModal';
import { API_CONFIG } from '../../config/api';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isApiConfigModalOpen, setIsApiConfigModalOpen] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Email ou senha incorretos');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor. Verifique a configuração da API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex">
        {/* Left side - Logo variations */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-8 flex-col justify-center items-center">
          <LogoVariations />
        </div>

        {/* Right side - Login form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Shield className="w-12 h-12 text-blue-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Portal do Visitante</h2>
              <p className="mt-2 text-gray-600">
                Sistema de controle de acesso para condomínios
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    placeholder="Sua senha"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <div className="text-center">
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                  Esqueci minha senha
                </a>
              </div>
            </form>

            {/* API Configuration */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Configuração da API:</span>
                <button
                  onClick={() => setIsApiConfigModalOpen(true)}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                  title="Configurar API"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Globe className="w-3 h-3 flex-shrink-0" />
                  <span className="font-mono break-all">{API_CONFIG.BASE_URL}</span>
                </div>
              </div>
            </div>

            <div className="text-center text-xs text-gray-500">
              <p>Credenciais de teste:</p>
              <p>Email: admin@condominio.com</p>
              <p>Senha: admin123</p>
            </div>
          </div>
        </div>
      </div>

      {/* API Configuration Modal */}
      <ApiConfigModal 
        isOpen={isApiConfigModalOpen} 
        onClose={() => setIsApiConfigModalOpen(false)} 
      />
    </>
  );
};

export default LoginScreen;