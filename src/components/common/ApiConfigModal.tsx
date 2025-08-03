import React, { useState } from 'react';
import { Settings, Save, X, Globe } from 'lucide-react';
import { API_CONFIG, updateApiHost } from '../../config/api';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ isOpen, onClose }) => {
  const [apiHost, setApiHost] = useState(API_CONFIG.BASE_URL);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Validar se o host é válido
      if (!apiHost.trim()) {
        throw new Error('Host da API é obrigatório');
      }

      // Testar conexão com o novo host
      const testUrl = apiHost.endsWith('/api') ? apiHost : `${apiHost}/api`;
      
      // Fazer uma requisição de teste (pode ser um endpoint de health check)
      const response = await fetch(`${testUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Atualizar configuração se o teste passou ou se não há endpoint de health
      updateApiHost(apiHost);
      setMessage('Configuração da API atualizada com sucesso!');
      
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      // Mesmo se o teste falhar, permitir a configuração (pode não ter endpoint de health)
      updateApiHost(apiHost);
      setMessage('Host da API configurado. Verifique se o endereço está correto.');
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setApiHost('http://127.0.0.1:8080/api');
    setMessage('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Configuração da API</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>Host da API</span>
                </div>
              </label>
              <input
                type="url"
                value={apiHost}
                onChange={(e) => setApiHost(e.target.value)}
                placeholder="http://127.0.0.1:8080/api"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Insira o URL completo da API incluindo o protocolo (http/https)
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Host Atual:</h4>
              <p className="text-sm text-blue-700 font-mono break-all">{API_CONFIG.BASE_URL}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Endpoints Disponíveis:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• POST /login - Autenticação</li>
                <li>• GET /companies - Listar empresas</li>
                <li>• GET /residences - Listar residências</li>
                <li>• GET /guests - Listar convidados</li>
                <li>• GET /appointments - Listar agendamentos</li>
              </ul>
            </div>

            {message && (
              <div className={`p-3 rounded-lg ${
                message.includes('sucesso') 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
              }`}>
                {message}
              </div>
            )}
          </div>

          <div className="flex justify-between space-x-3 pt-6">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Restaurar Padrão
            </button>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Salvando...' : 'Salvar'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiConfigModal;