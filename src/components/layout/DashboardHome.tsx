import React from 'react';
import { Building, Home, Users, UserCheck, Calendar, TrendingUp, Briefcase } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const DashboardHome: React.FC = () => {
  const { companies, residences, employees, serviceProviders, guests, appointments } = useData();

  const stats = [
    {
      title: 'Empresas',
      value: companies.length,
      icon: Building,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Residências',
      value: residences.length,
      icon: Home,
      color: 'bg-green-500',
      change: '+5%'
    },
    {
      title: 'Prestadores',
      value: serviceProviders.length,
      icon: Briefcase,
      color: 'bg-indigo-500',
      change: '+10%'
    },
    {
      title: 'Funcionários',
      value: employees.length,
      icon: Users,
      color: 'bg-purple-500',
      change: '+8%'
    },
    {
      title: 'Convidados',
      value: guests.length,
      icon: UserCheck,
      color: 'bg-orange-500',
      change: '+15%'
    },
    {
      title: 'Agendamentos',
      value: appointments.length,
      icon: Calendar,
      color: 'bg-red-500',
      change: '+25%'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">{stat.change}</span>
                <span className="text-sm text-gray-500 ml-1">vs. mês anterior</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <UserCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Novo convidado cadastrado</p>
                <p className="text-xs text-gray-500">Há 2 horas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Agendamento confirmado</p>
                <p className="text-xs text-gray-500">Há 4 horas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Building className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Nova empresa registrada</p>
                <p className="text-xs text-gray-500">Há 6 horas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Funcionalidades</h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Controle de Acesso</h4>
              <p className="text-sm text-blue-700">Gerencie visitantes e funcionários</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">Agendamentos</h4>
              <p className="text-sm text-green-700">Agende visitas e controle horários</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900">Relatórios</h4>
              <p className="text-sm text-purple-700">Acompanhe estatísticas e relatórios</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;