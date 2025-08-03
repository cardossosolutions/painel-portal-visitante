import React from 'react';
import { Shield } from 'lucide-react';

// Componente para diferentes variações do logo
const LogoVariations: React.FC = () => {
  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Variações do Logo</h2>
      
      {/* Logo Principal */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Logo Principal</h3>
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-green-600" />
          <span className="text-xl font-bold text-gray-800">Painel do Visitante</span>
        </div>
      </div>

      {/* Logo Compacto */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Logo Compacto</h3>
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-green-600" />
          <span className="text-lg font-bold text-gray-800">PV</span>
        </div>
      </div>

      {/* Logo Apenas Ícone */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Apenas Ícone</h3>
        <div className="bg-green-100 p-4 rounded-full inline-block">
          <Shield className="w-8 h-8 text-green-600" />
        </div>
      </div>

      {/* Logo Invertido (para fundos escuros) */}
      <div className="bg-green-600 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-white mb-4">Logo Invertido</h3>
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-white" />
          <span className="text-xl font-bold text-white">Painel do Visitante</span>
        </div>
      </div>

      {/* Logo com Fundo */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Logo com Fundo</h3>
        <div className="bg-green-600 p-4 rounded-lg inline-flex items-center space-x-3">
          <Shield className="w-8 h-8 text-white" />
          <span className="text-xl font-bold text-white">Painel do Visitante</span>
        </div>
      </div>
    </div>
  );
};

export default LogoVariations;