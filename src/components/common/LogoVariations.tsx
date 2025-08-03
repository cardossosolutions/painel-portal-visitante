import React from 'react';
import { Shield, Building, Users, Key, Home, CheckCircle } from 'lucide-react';

const LogoVariations: React.FC = () => {
  const variations = [
    {
      name: 'Versão Principal',
      icon: Shield,
      color: 'text-white',
      bg: 'bg-blue-600',
      description: 'Ícone principal com escudo representando segurança'
    },
    {
      name: 'Versão Condomínio',
      icon: Building,
      color: 'text-white',
      bg: 'bg-blue-500',
      description: 'Ícone de prédio para representar condomínio'
    },
    {
      name: 'Versão Visitantes',
      icon: Users,
      color: 'text-white',
      bg: 'bg-green-600',
      description: 'Ícone de pessoas para representar visitantes'
    },
    {
      name: 'Versão Acesso',
      icon: Key,
      color: 'text-white',
      bg: 'bg-blue-700',
      description: 'Ícone de chave para controle de acesso'
    },
    {
      name: 'Versão Residência',
      icon: Home,
      color: 'text-white',
      bg: 'bg-indigo-600',
      description: 'Ícone de casa para residências'
    },
    {
      name: 'Versão Aprovação',
      icon: CheckCircle,
      color: 'text-white',
      bg: 'bg-green-700',
      description: 'Ícone de aprovação para autorizações'
    }
  ];

  return (
    <div className="text-center text-white">
      <h1 className="text-4xl font-bold mb-4">Portal do Visitante</h1>
      <p className="text-xl mb-8 text-blue-100">Variações de Logo</p>
      
      <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
        {variations.map((variation, index) => {
          const IconComponent = variation.icon;
          return (
            <div
              key={index}
              className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm hover:bg-opacity-20 transition-all duration-300"
            >
              <div className={`${variation.bg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3`}>
                <IconComponent className={`w-8 h-8 ${variation.color}`} />
              </div>
              <h3 className="font-semibold text-sm mb-1">{variation.name}</h3>
              <p className="text-xs text-blue-100">{variation.description}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm">
        <h3 className="font-semibold mb-2">Paleta de Cores</h3>
        <div className="flex justify-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
          <div className="w-8 h-8 bg-blue-700 rounded-full"></div>
          <div className="w-8 h-8 bg-green-600 rounded-full"></div>
          <div className="w-8 h-8 bg-indigo-600 rounded-full"></div>
          <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default LogoVariations;