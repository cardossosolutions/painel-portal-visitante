import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import CompanyManagement from '../management/CompanyManagement';
import ResidenceManagement from '../management/ResidenceManagement';
import EmployeeManagement from '../management/EmployeeManagement';
import ServiceProviderManagement from '../management/ServiceProviderManagement';
import GuestManagement from '../management/GuestManagement';
import AppointmentManagement from '../management/AppointmentManagement';
import VisitorScheduleView from '../views/VisitorScheduleView';
import ProviderScheduleView from '../views/ProviderScheduleView';
import DeliveryScheduleView from '../views/DeliveryScheduleView';
import DashboardHome from './DashboardHome';
import DeliveryManagement from '../management/DeliveryManagement';
import { useData } from '../../contexts/DataContext';

const Dashboard: React.FC = () => {
  // Recuperar seção ativa do localStorage ou usar 'home' como padrão
  const [activeSection, setActiveSection] = useState(() => {
    const savedSection = localStorage.getItem('dashboard_active_section');
    console.log('🔄 Dashboard inicializando - seção salva:', savedSection);
    return savedSection || 'home';
  });
  
  const { loadUserProfile } = useData();

  // Salvar seção ativa no localStorage sempre que mudar
  useEffect(() => {
    console.log('💾 Salvando seção ativa no localStorage:', activeSection);
    localStorage.setItem('dashboard_active_section', activeSection);
  }, [activeSection]);

  // Carregar apenas dados do usuário quando o dashboard for montado
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        console.log('🚀 Inicializando Dashboard...');
        await loadUserProfile();
        console.log('✅ Dashboard inicializado com sucesso');
      } catch (error) {
        console.warn('⚠️ Erro ao carregar dados do usuário:', error);
      }
    };

    initializeDashboard();
  }, []);

  // Função para mudar seção (será passada para o Sidebar)
  const handleSectionChange = (section: string) => {
    console.log('🔄 Mudando seção para:', section);
    setActiveSection(section);
  };

  const renderContent = () => {
    console.log('🎯 Renderizando conteúdo para seção:', activeSection);
    
    switch (activeSection) {
      case 'home':
        return <DashboardHome />;
      case 'companies':
        return <CompanyManagement />;
      case 'residences':
        return <ResidenceManagement />;
      case 'service-providers':
        return <ServiceProviderManagement />;
      case 'employees':
        return <EmployeeManagement />;
      case 'guests':
        return <GuestManagement />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'visitor-schedule':
        return <VisitorScheduleView />;
      case 'provider-schedule':
        return <ProviderScheduleView />;
      case 'delivery-schedule':
        return <DeliveryScheduleView />;
      case 'deliveries':
        return <DeliveryManagement />;
      default:
        console.warn('⚠️ Seção desconhecida:', activeSection, '- redirecionando para home');
        // Se a seção não existir, voltar para home
        setActiveSection('home');
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={handleSectionChange} 
      />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;