import React, { useState } from 'react';
import { Bell, User, LogOut, Settings, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../common/Modal';
import UserProfileForm from '../forms/UserProfileForm';
import ApiConfigModal from '../common/ApiConfigModal';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isApiConfigModalOpen, setIsApiConfigModalOpen] = useState(false);

  const handleProfileClick = () => {
    setShowUserMenu(false);
    setIsProfileModalOpen(true);
  };

  const handleApiConfigClick = () => {
    setShowUserMenu(false);
    setIsApiConfigModalOpen(true);
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Sistema de Controle de Acesso
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-sm font-medium text-gray-700">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.position || 'Usuário'}</div>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Meu Perfil</span>
                  </button>
                  <button
                    onClick={handleApiConfigClick}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Configurar API</span>
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Profile Modal */}
      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)}>
        <UserProfileForm onClose={() => setIsProfileModalOpen(false)} />
      </Modal>

      {/* API Configuration Modal */}
      <ApiConfigModal 
        isOpen={isApiConfigModalOpen} 
        onClose={() => setIsApiConfigModalOpen(false)} 
      />
    </>
  );
};

export default Header;