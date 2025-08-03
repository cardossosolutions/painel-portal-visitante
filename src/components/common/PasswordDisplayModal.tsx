import React, { useState } from 'react';
import { Key, Copy, Eye, EyeOff, CheckCircle, X, Shield, AlertTriangle } from 'lucide-react';

interface PasswordDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  passwordData: { message: string; password: string } | null;
}

const PasswordDisplayModal: React.FC<PasswordDisplayModalProps> = ({ 
  isOpen, 
  onClose, 
  passwordData 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !passwordData) return null;

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(passwordData.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar senha:', error);
    }
  };

  const handleClose = () => {
    setShowPassword(false);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-full shadow-lg">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Senha Gerada</h3>
                <p className="text-sm text-gray-600">{passwordData.message}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Password Display */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Nova Senha</span>
                </label>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-200"
                  title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.password}
                  readOnly
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-mono text-lg text-center tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 select-all"
                />
                <button
                  onClick={handleCopyPassword}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
                    copied 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Copiar senha"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              {copied && (
                <div className="mt-2 flex items-center space-x-2 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Senha copiada para a área de transferência!</span>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <h4 className="font-medium mb-1">Importante - Segurança</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Esta senha será exibida apenas uma vez</li>
                    <li>• Anote ou copie a senha antes de fechar esta janela</li>
                    <li>• Compartilhe a senha de forma segura com o funcionário</li>
                    <li>• Recomende que o funcionário altere a senha no primeiro acesso</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Password Strength Indicator */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Características da Senha</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>10 caracteres</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Letras e números</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Maiúsculas e minúsculas</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Gerada aleatoriamente</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleCopyPassword}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copiar Senha</span>
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Entendi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordDisplayModal;