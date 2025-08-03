import React from 'react';
import { 
  Home, 
  Building, 
  Shield,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'companies', label: 'Empresas', icon: Building },
  ];

  const handleMenuClick = (itemId: string) => {
    console.log('📱 Sidebar - Item clicado:', itemId);
    setActiveSection(itemId);
  };

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-green-600" />
              <h1 className="text-xl font-bold text-gray-800">Painel do Visitante</h1>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left transition-colors group ${
                isActive
                  ? 'bg-green-50 text-green-600 border-r-4 border-green-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <IconComponent className={`w-5 h-5 mr-3 ${isActive ? 'text-green-600' : 'text-gray-500 group-hover:text-green-600'}`} />
              {!isCollapsed && (
                <span className={`font-medium ${isActive ? 'text-green-600' : 'text-gray-700 group-hover:text-green-600'}`}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Indicador da seção ativa quando collapsed */}
      {isCollapsed && (
        <div className="fixed left-20 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          {menuItems.find(item => item.id === activeSection)?.label}
        </div>
      )}
    </div>
  );
};

export default Sidebar;