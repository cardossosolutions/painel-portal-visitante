import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { apiRequest, API_CONFIG } from '../config/api';
import { useToast } from './ToastContext';

// Interfaces para tipagem
interface Company {
  id: string;
  cnpj: string;
  corporate_name: string;
  fantasy_name: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city_id: number;
  city_name?: string;
  state_id: number;
  state?: string;
  state_name?: string;
  email: string;
  phone_number?: string;
  mobile_number?: string;
}

interface Residence {
  id: string;
  name: string;
  active: boolean;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: number;
  city_name?: string;
  state: number;
  name_state?: string;
}

interface Resident {
  id: string;
  residence_id: string;
  name: string;
  email: string;
  mobile: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  permission: string;
  status: string;
}

interface ServiceProvider {
  id: number;
  name: string;
  mobile: string;
  rg: string;
  cpf: string;
  plate: string | null;
  date_start: string;
  date_ending: string;
  observation: string;
}

interface Guest {
  id: string;
  name: string;
  cpf: string;
  rg?: string;
  plate?: string;
  observation?: string;
  residence?: string;
}

interface GuestSelect {
  id: number;
  name: string;
  cpf: string;
  residence: string;
  plate?: string;
  description: string;
}

interface Appointment {
  id: string;
  name: string;
  cpf: string;
  responsible: string;
  dateBegin: string;
  dateEnding: string;
  visitor_id?: number;
}

interface Delivery {
  id: number;
  ecommerce: string;
  ecommerce_id: number | null;
  quantity: number;
  date_start: string;
  date_ending: string;
}

interface Ecommerce {
  id: number;
  name: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface DataContextType {
  // Companies
  companies: Company[];
  companyPagination: PaginationData | null;
  loadCompanies: (page?: number, search?: string) => Promise<void>;
  addCompany: (companyData: any) => Promise<void>;
  updateCompany: (id: string, companyData: any) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;

  // Residences
  residences: Residence[];
  residencePagination: PaginationData | null;
  loadResidences: (page?: number, search?: string) => Promise<void>;
  addResidence: (residenceData: any) => Promise<void>;
  updateResidence: (id: string, residenceData: any) => Promise<void>;
  deleteResidence: (id: string) => Promise<void>;

  // Residents
  residents: Resident[];
  residentPagination: PaginationData | null;
  loadResidents: (residenceId: string, page?: number, search?: string) => Promise<void>;
  addResident: (residentData: any) => Promise<void>;
  updateResident: (id: string, residentData: any) => Promise<void>;
  deleteResident: (id: string, residenceId: string) => Promise<void>;

  // Employees
  employees: Employee[];
  employeePagination: PaginationData | null;
  loadEmployees: (page?: number, search?: string) => Promise<void>;
  addEmployee: (employeeData: any) => Promise<any>;
  updateEmployee: (id: string, employeeData: any) => Promise<void>;
  resetEmployeePassword: (id: string) => Promise<any>;
  deleteEmployee: (id: string) => Promise<void>;

  // Service Providers
  serviceProviders: ServiceProvider[];
  serviceProviderPagination: PaginationData | null;
  loadServiceProviders: (page?: number, search?: string) => Promise<void>;
  addServiceProvider: (providerData: any) => Promise<void>;
  updateServiceProvider: (id: number, providerData: any) => Promise<void>;
  deleteServiceProvider: (id: number) => Promise<void>;

  // Guests
  guests: Guest[];
  guestPagination: PaginationData | null;
  guestsSelect: GuestSelect[];
  loadGuests: (page?: number, search?: string) => Promise<void>;
  loadGuestsSelect: () => Promise<void>;
  addGuest: (guestData: any) => Promise<void>;
  updateGuest: (id: string, guestData: any) => Promise<void>;
  deleteGuest: (id: string) => Promise<void>;

  // Appointments
  appointments: Appointment[];
  appointmentPagination: PaginationData | null;
  loadAppointments: (page?: number, search?: string) => Promise<void>;
  addAppointment: (appointmentData: any) => Promise<void>;
  updateAppointment: (id: string, appointmentData: any) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;

  // Deliveries
  deliveries: Delivery[];
  deliveryPagination: PaginationData | null;
  ecommerces: Ecommerce[];
  loadDeliveries: (page?: number, search?: string) => Promise<void>;
  loadEcommerces: () => Promise<void>;
  addDelivery: (deliveryData: any) => Promise<void>;
  updateDelivery: (id: number, deliveryData: any) => Promise<void>;
  deleteDelivery: (id: number) => Promise<void>;

  // User Profile
  loadUserProfile: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { showSuccess, showError } = useToast();

  // Companies State
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyPagination, setCompanyPagination] = useState<PaginationData | null>(null);

  // Residences State
  const [residences, setResidences] = useState<Residence[]>([]);
  const [residencePagination, setResidencePagination] = useState<PaginationData | null>(null);

  // Residents State
  const [residents, setResidents] = useState<Resident[]>([]);
  const [residentPagination, setResidentPagination] = useState<PaginationData | null>(null);

  // Employees State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeePagination, setEmployeePagination] = useState<PaginationData | null>(null);

  // Service Providers State
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [serviceProviderPagination, setServiceProviderPagination] = useState<PaginationData | null>(null);

  // Guests State
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestPagination, setGuestPagination] = useState<PaginationData | null>(null);
  const [guestsSelect, setGuestsSelect] = useState<GuestSelect[]>([]);

  // Appointments State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentPagination, setAppointmentPagination] = useState<PaginationData | null>(null);

  // Deliveries State
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [deliveryPagination, setDeliveryPagination] = useState<PaginationData | null>(null);
  const [ecommerces, setEcommerces] = useState<Ecommerce[]>([]);

  // Companies Functions
  const loadCompanies = useCallback(async (page: number = 1, search: string = '') => {
    try {
      console.log(`🏢 DataContext.loadCompanies - Página: ${page}, Busca: "${search}"`);
      
      let url = `${API_CONFIG.ENDPOINTS.COMPANIES}?page=${page}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      const response = await apiRequest(url, { method: 'GET' });
      
      if (response && response.data) {
        setCompanies(response.data);
        setCompanyPagination({
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
          from: response.from,
          to: response.to
        });
        console.log(`✅ DataContext.loadCompanies - ${response.data.length} empresas carregadas`);
      }
    } catch (error) {
      console.error('❌ DataContext.loadCompanies - Erro:', error);
      showError('Erro ao carregar empresas', 'Não foi possível carregar a lista de empresas.');
    }
  }, [showError]);

  const addCompany = useCallback(async (companyData: any) => {
    try {
      console.log('🏢 DataContext.addCompany - Dados:', companyData);
      
      const response = await apiRequest(API_CONFIG.ENDPOINTS.COMPANIES, {
        method: 'POST',
        body: JSON.stringify(companyData)
      });
      
      console.log('✅ DataContext.addCompany - Resposta:', response);
      showSuccess('Empresa cadastrada!', 'A empresa foi cadastrada com sucesso.');
    } catch (error) {
      console.error('❌ DataContext.addCompany - Erro:', error);
      showError('Erro ao cadastrar empresa', 'Não foi possível cadastrar a empresa. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  const updateCompany = useCallback(async (id: string, companyData: any) => {
    try {
      console.log(`🏢 DataContext.updateCompany - ID: ${id}, Dados:`, companyData);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.COMPANIES}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(companyData)
      });
      
      console.log('✅ DataContext.updateCompany - Resposta:', response);
      showSuccess('Empresa atualizada!', 'Os dados da empresa foram atualizados com sucesso.');
    } catch (error) {
      console.error('❌ DataContext.updateCompany - Erro:', error);
      showError('Erro ao atualizar empresa', 'Não foi possível atualizar a empresa. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  const deleteCompany = useCallback(async (id: string) => {
    try {
      console.log(`🏢 DataContext.deleteCompany - ID: ${id}`);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.COMPANIES}/${id}`, {
        method: 'DELETE'
      });
      
      console.log('✅ DataContext.deleteCompany - Resposta:', response);
      showSuccess('Empresa excluída!', 'A empresa foi excluída com sucesso.');
    } catch (error) {
      console.error('❌ DataContext.deleteCompany - Erro:', error);
      showError('Erro ao excluir empresa', 'Não foi possível excluir a empresa. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  // Residences Functions
  const loadResidences = useCallback(async (page: number = 1, search: string = '') => {
    try {
      console.log(`🏠 DataContext.loadResidences - Página: ${page}, Busca: "${search}"`);
      
      let url = `${API_CONFIG.ENDPOINTS.RESIDENCES}?page=${page}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      const response = await apiRequest(url, { method: 'GET' });
      
      if (response && response.data) {
        setResidences(response.data);
        setResidencePagination({
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
          from: response.from,
          to: response.to
        });
        console.log(`✅ DataContext.loadResidences - ${response.data.length} residências carregadas`);
      }
    } catch (error) {
      console.error('❌ DataContext.loadResidences - Erro:', error);
      showError('Erro ao carregar residências', 'Não foi possível carregar a lista de residências.');
    }
  }, [showError]);

  const addResidence = useCallback(async (residenceData: any) => {
    try {
      console.log('🏠 DataContext.addResidence - Dados:', residenceData);
      
      const response = await apiRequest(API_CONFIG.ENDPOINTS.RESIDENCES, {
        method: 'POST',
        body: JSON.stringify(residenceData)
      });
      
      console.log('✅ DataContext.addResidence - Resposta:', response);
      showSuccess('Residência cadastrada!', 'A residência foi cadastrada com sucesso.');
    } catch (error) {
      console.error('❌ DataContext.addResidence - Erro:', error);
      showError('Erro ao cadastrar residência', 'Não foi possível cadastrar a residência. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  const updateResidence = useCallback(async (id: string, residenceData: any) => {
    try {
      console.log(`🏠 DataContext.updateResidence - ID: ${id}, Dados:`, residenceData);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.RESIDENCES}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(residenceData)
      });
      
      console.log('✅ DataContext.updateResidence - Resposta:', response);
      showSuccess('Residência atualizada!', 'Os dados da residência foram atualizados com sucesso.');
    } catch (error) {
      console.error('❌ DataContext.updateResidence - Erro:', error);
      showError('Erro ao atualizar residência', 'Não foi possível atualizar a residência. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  const deleteResidence = useCallback(async (id: string) => {
    try {
      console.log(`🏠 DataContext.deleteResidence - ID: ${id}`);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.RESIDENCES}/${id}`, {
        method: 'DELETE'
      });
      
      console.log('✅ DataContext.deleteResidence - Resposta:', response);
      showSuccess('Residência excluída!', 'A residência foi excluída com sucesso.');
    } catch (error) {
      console.error('❌ DataContext.deleteResidence - Erro:', error);
      showError('Erro ao excluir residência', 'Não foi possível excluir a residência. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  // Residents Functions
  const loadResidents = useCallback(async (residenceId: string, page: number = 1, search: string = '') => {
    try {
      console.log(`👥 DataContext.loadResidents - Residência: ${residenceId}, Página: ${page}, Busca: "${search}"`);
      
      let url = `${API_CONFIG.ENDPOINTS.RESIDENTS}/${residenceId}?page=${page}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      const response = await apiRequest(url, { method: 'GET' });
      
      if (response && response.data) {
        setResidents(response.data);
        setResidentPagination({
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
          from: response.from,
          to: response.to
        });
        console.log(`✅ DataContext.loadResidents - ${response.data.length} moradores carregados`);
      }
    } catch (error) {
      console.error('❌ DataContext.loadResidents - Erro:', error);
      showError('Erro ao carregar moradores', 'Não foi possível carregar a lista de moradores.');
    }
  }, [showError]);

  const addResident = useCallback(async (residentData: any) => {
    try {
      console.log('👥 DataContext.addResident - Dados:', residentData);
      
      const response = await apiRequest(API_CONFIG.ENDPOINTS.RESIDENTS, {
        method: 'POST',
        body: JSON.stringify(residentData)
      });
      
      console.log('✅ DataContext.addResident - Resposta:', response);
      showSuccess('Morador cadastrado!', 'O morador foi cadastrado com sucesso.');
    } catch (error) {
      console.error('❌ DataContext.addResident - Erro:', error);
      showError('Erro ao cadastrar morador', 'Não foi possível cadastrar o morador. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  const updateResident = useCallback(async (id: string, residentData: any) => {
    try {
      console.log(`👥 DataContext.updateResident - ID: ${id}, Dados:`, residentData);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.RESIDENTS}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(residentData)
      });
      
      console.log('✅ DataContext.updateResident - Resposta:', response);
      showSuccess('Morador atualizado!', 'Os dados do morador foram atualizados com sucesso.');
    } catch (error) {
      console.error('❌ DataContext.updateResident - Erro:', error);
      showError('Erro ao atualizar morador', 'Não foi possível atualizar o morador. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  const deleteResident = useCallback(async (id: string, residenceId: string) => {
    try {
      console.log(`👥 DataContext.deleteResident - ID: ${id}`);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.RESIDENTS}/${id}`, {
        method: 'DELETE'
      });
      
      console.log('✅ DataContext.deleteResident - Resposta:', response);
      showSuccess('Morador excluído!', 'O morador foi excluído com sucesso.');
      
      // Recarregar lista de moradores
      await loadResidents(residenceId);
    } catch (error) {
      console.error('❌ DataContext.deleteResident - Erro:', error);
      showError('Erro ao excluir morador', 'Não foi possível excluir o morador. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError, loadResidents]);

  // Employees Functions
  const loadEmployees = useCallback(async (page: number = 1, search: string = '') => {
    try {
      console.log(`👤 DataContext.loadEmployees - Página: ${page}, Busca: "${search}"`);
      
      let url = `${API_CONFIG.ENDPOINTS.EMPLOYEES}?page=${page}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      const response = await apiRequest(url, { method: 'GET' });
      
      if (response && response.data) {
        setEmployees(response.data);
        setEmployeePagination({
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
          from: response.from,
          to: response.to
        });
        console.log(`✅ DataContext.loadEmployees - ${response.data.length} funcionários carregados`);
      }
    } catch (error) {
      console.error('❌ DataContext.loadEmployees - Erro:', error);
      showError('Erro ao carregar funcionários', 'Não foi possível carregar a lista de funcionários.');
    }
  }, [showError]);

  const addEmployee = useCallback(async (employeeData: any) => {
    try {
      console.log('👤 DataContext.addEmployee - Dados:', employeeData);
      
      const response = await apiRequest(API_CONFIG.ENDPOINTS.EMPLOYEES, {
        method: 'POST',
        body: JSON.stringify(employeeData)
      });
      
      console.log('✅ DataContext.addEmployee - Resposta:', response);
      showSuccess('Funcionário cadastrado!', 'O funcionário foi cadastrado com sucesso.');
      return response;
    } catch (error) {
      console.error('❌ DataContext.addEmployee - Erro:', error);
      showError('Erro ao cadastrar funcionário', 'Não foi possível cadastrar o funcionário. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  const updateEmployee = useCallback(async (id: string, employeeData: any) => {
    try {
      console.log(`👤 DataContext.updateEmployee - ID: ${id}, Dados:`, employeeData);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.EMPLOYEES}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(employeeData)
      });
      
      console.log('✅ DataContext.updateEmployee - Resposta:', response);
      showSuccess('Funcionário atualizado!', 'Os dados do funcionário foram atualizados com sucesso.');
    } catch (error) {
      console.error('❌ DataContext.updateEmployee - Erro:', error);
      showError('Erro ao atualizar funcionário', 'Não foi possível atualizar o funcionário. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  const resetEmployeePassword = useCallback(async (id: string) => {
    try {
      console.log(`👤 DataContext.resetEmployeePassword - ID: ${id}`);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.EMPLOYEES}/${id}/reset-password`, {
        method: 'POST'
      });
      
      console.log('✅ DataContext.resetEmployeePassword - Resposta:', response);
      showSuccess('Senha resetada!', 'A senha do funcionário foi resetada com sucesso.');
      return response;
    } catch (error) {
      console.error('❌ DataContext.resetEmployeePassword - Erro:', error);
      showError('Erro ao resetar senha', 'Não foi possível resetar a senha. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  const deleteEmployee = useCallback(async (id: string) => {
    try {
      console.log(`👤 DataContext.deleteEmployee - ID: ${id}`);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.EMPLOYEES}/${id}`, {
        method: 'DELETE'
      });
      
      console.log('✅ DataContext.deleteEmployee - Resposta:', response);
      showSuccess('Funcionário excluído!', 'O funcionário foi excluído com sucesso.');
    } catch (error) {
      console.error('❌ DataContext.deleteEmployee - Erro:', error);
      showError('Erro ao excluir funcionário', 'Não foi possível excluir o funcionário. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  // Service Providers Functions
  const loadServiceProviders = useCallback(async (page: number = 1, search: string = '') => {
    try {
      console.log(`🔧 DataContext.loadServiceProviders - Página: ${page}, Busca: "${search}"`);
      
      let url = `${API_CONFIG.ENDPOINTS.PROVIDERS}?page=${page}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      const response = await apiRequest(url, { method: 'GET' });
      
      if (response && response.data) {
        setServiceProviders(response.data);
        setServiceProviderPagination({
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
          from: response.from,
          to: response.to
        });
        console.log(`✅ DataContext.loadServiceProviders - ${response.data.length} prestadores carregados`);
      }
    } catch (error) {
      console.error('❌ DataContext.loadServiceProviders - Erro:', error);
      showError('Erro ao carregar prestadores', 'Não foi possível carregar a lista de prestadores de serviços.');
    }
  }, [showError]);

  const addServiceProvider = useCallback(async (providerData: any) => {
    try {
      console.log('🔧 DataContext.addServiceProvider - Dados:', providerData);
      
      const response = await apiRequest(API_CONFIG.ENDPOINTS.PROVIDERS, {
        method: 'POST',
        body: JSON.stringify(providerData)
      });
      
      console.log('✅ DataContext.addServiceProvider - Resposta:', response);
      showSuccess('Prestador cadastrado!', 'O prestador de serviços foi cadastrado com sucesso.');
    } catch (error) {
      console.error('❌ DataContext.addServiceProvider - Erro:', error);
      showError('Erro ao cadastrar prestador', 'Não foi possível cadastrar o prestador de serviços. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  const updateServiceProvider = useCallback(async (id: number, providerData: any) => {
    try {
      console.log(`🔧 DataContext.updateServiceProvider - ID: ${id}, Dados:`, providerData);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.PROVIDERS}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(providerData)
      });
      
      console.log('✅ DataContext.updateServiceProvider - Resposta:', response);
      showSuccess('Prestador atualizado!', 'Os dados do prestador foram atualizados com sucesso.');
    } catch (error) {
      console.error('❌ DataContext.updateServiceProvider - Erro:', error);
      showError('Erro ao atualizar prestador', 'Não foi possível atualizar o prestador de serviços. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  const deleteServiceProvider = useCallback(async (id: number) => {
    try {
      console.log(`🔧 DataContext.deleteServiceProvider - ID: ${id}`);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.PROVIDERS}/${id}`, {
        method: 'DELETE'
      });
      
      console.log('✅ DataContext.deleteServiceProvider - Resposta:', response);
      showSuccess('Prestador excluído!', 'O prestador de serviços foi excluído com sucesso.');
    } catch (error) {
      console.error('❌ DataContext.deleteServiceProvider - Erro:', error);
      showError('Erro ao excluir prestador', 'Não foi possível excluir o prestador de serviços. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  // Guests Functions
  const loadGuests = useCallback(async (page: number = 1, search: string = '') => {
    try {
      console.log(`👤 DataContext.loadGuests - Página: ${page}, Busca: "${search}"`);
      
      let url = `${API_CONFIG.ENDPOINTS.GUESTS_LIST}?page=${page}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      const response = await apiRequest(url, { method: 'GET' });
      
      if (response && response.data) {
        setGuests(response.data);
        setGuestPagination({
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
          from: response.from,
          to: response.to
        });
        console.log(`✅ DataContext.loadGuests - ${response.data.length} convidados carregados`);
      }
    } catch (error) {
      console.error('❌ DataContext.loadGuests - Erro:', error);
      showError('Erro ao carregar convidados', 'Não foi possível carregar a lista de convidados.');
    }
  }, [showError]);

  const loadGuestsSelect = useCallback(async () => {
    try {
      console.log('👤 DataContext.loadGuestsSelect - Carregando lista para seleção...');
      
      const response = await apiRequest(API_CONFIG.ENDPOINTS.GUESTS_SELECT, { method: 'GET' });
      
      if (response && Array.isArray(response)) {
        setGuestsSelect(response);
        console.log(`✅ DataContext.loadGuestsSelect - ${response.length} convidados carregados para seleção`);
      }
    } catch (error) {
      console.error('❌ DataContext.loadGuestsSelect - Erro:', error);
      showError('Erro ao carregar convidados', 'Não foi possível carregar a lista de convidados para seleção.');
    }
  }, [showError]);

  const addGuest = useCallback(async (guestData: any) => {
    try {
      console.log('👤 DataContext.addGuest - Dados:', guestData);
      
      const response = await apiRequest(API_CONFIG.ENDPOINTS.GUESTS, {
        method: 'POST',
        body: JSON.stringify(guestData)
      });
      
      console.log('✅ DataContext.addGuest - Resposta:', response);
      showSuccess('Convidado cadastrado!', 'O convidado foi cadastrado com sucesso.');
    } catch (error) {
      console.error('❌ DataContext.addGuest - Erro:', error);
      showError('Erro ao cadastrar convidado', 'Não foi possível cadastrar o convidado. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  const updateGuest = useCallback(async (id: string, guestData: any) => {
    try {
      console.log(`👤 DataContext.updateGuest - ID: ${id}, Dados:`, guestData);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.GUESTS}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(guestData)
      });
      
      console.log('✅ DataContext.updateGuest - Resposta:', response);
      showSuccess('Convidado atualizado!', 'Os dados do convidado foram atualizados com sucesso.');
    } catch (error) {
      console.error('❌ DataContext.updateGuest - Erro:', error);
      showError('Erro ao atualizar convidado', 'Não foi possível atualizar o convidado. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  const deleteGuest = useCallback(async (id: string) => {
    try {
      console.log(`👤 DataContext.deleteGuest - ID: ${id}`);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.GUESTS}/${id}`, {
        method: 'DELETE'
      });
      
      console.log('✅ DataContext.deleteGuest - Resposta:', response);
      showSuccess('Convidado excluído!', 'O convidado foi excluído com sucesso.');
    } catch (error) {
      console.error('❌ DataContext.deleteGuest - Erro:', error);
      showError('Erro ao excluir convidado', 'Não foi possível excluir o convidado. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  // Appointments Functions
  const loadAppointments = useCallback(async (page: number = 1, search: string = '') => {
    try {
      console.log(`📅 DataContext.loadAppointments - Página: ${page}, Busca: "${search}"`);
      
      let url = `${API_CONFIG.ENDPOINTS.APPOINTMENTS}?page=${page}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      const response = await apiRequest(url, { method: 'GET' });
      
      if (response && response.data) {
        setAppointments(response.data);
        setAppointmentPagination({
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
          from: response.from,
          to: response.to
        });
        console.log(`✅ DataContext.loadAppointments - ${response.data.length} agendamentos carregados`);
      }
    } catch (error) {
      console.error('❌ DataContext.loadAppointments - Erro:', error);
      showError('Erro ao carregar agendamentos', 'Não foi possível carregar a lista de agendamentos.');
    }
  }, [showError]);

  const addAppointment = useCallback(async (appointmentData: any) => {
    try {
      console.log('📅 DataContext.addAppointment - Dados:', appointmentData);
      
      const response = await apiRequest(API_CONFIG.ENDPOINTS.APPOINTMENTS_REGISTER, {
        method: 'POST',
        body: JSON.stringify(appointmentData)
      });
      
      console.log('✅ DataContext.addAppointment - Resposta:', response);
      showSuccess('Agendamento criado!', 'O agendamento foi criado com sucesso.');
    } catch (error) {
      console.error('❌ DataContext.addAppointment - Erro:', error);
      showError('Erro ao criar agendamento', 'Não foi possível criar o agendamento. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  const updateAppointment = useCallback(async (id: string, appointmentData: any) => {
    try {
      console.log(`📅 DataContext.updateAppointment - ID: ${id}, Dados:`, appointmentData);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.APPOINTMENTS_REGISTER}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(appointmentData)
      });
      
      console.log('✅ DataContext.updateAppointment - Resposta:', response);
      showSuccess('Agendamento atualizado!', 'O agendamento foi atualizado com sucesso.');
    } catch (error) {
      console.error('❌ DataContext.updateAppointment - Erro:', error);
      showError('Erro ao atualizar agendamento', 'Não foi possível atualizar o agendamento. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  const deleteAppointment = useCallback(async (id: string) => {
    try {
      console.log(`📅 DataContext.deleteAppointment - ID: ${id}`);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.APPOINTMENTS_REGISTER}/${id}`, {
        method: 'DELETE'
      });
      
      console.log('✅ DataContext.deleteAppointment - Resposta:', response);
      showSuccess('Agendamento excluído!', 'O agendamento foi excluído com sucesso.');
    } catch (error) {
      console.error('❌ DataContext.deleteAppointment - Erro:', error);
      showError('Erro ao excluir agendamento', 'Não foi possível excluir o agendamento. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  // User Profile Function
  const loadUserProfile = useCallback(async () => {
    try {
      console.log('👤 DataContext.loadUserProfile - Carregando perfil do usuário...');
      
      const response = await apiRequest(API_CONFIG.ENDPOINTS.USER_PROFILE, { method: 'GET' });
      
      console.log('✅ DataContext.loadUserProfile - Perfil carregado:', response);
    } catch (error) {
      console.error('❌ DataContext.loadUserProfile - Erro:', error);
      // Não mostrar erro para o usuário, pois pode ser chamado em background
    }
  }, []);

  // Deliveries Functions
  const loadDeliveries = useCallback(async (page: number = 1, search: string = '') => {
    try {
      console.log(`📦 DataContext.loadDeliveries - Página: ${page}, Busca: "${search}"`);
      
      let url = `${API_CONFIG.ENDPOINTS.DELIVERIES_LIST}?page=${page}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      const response = await apiRequest(url, { method: 'GET' });
      
      if (response && response.data) {
        setDeliveries(response.data);
        setDeliveryPagination({
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
          from: response.from,
          to: response.to
        });
        console.log(`✅ DataContext.loadDeliveries - ${response.data.length} entregas carregadas`);
      }
    } catch (error) {
      console.error('❌ DataContext.loadDeliveries - Erro:', error);
      showError('Erro ao carregar entregas', 'Não foi possível carregar a lista de entregas.');
    }
  }, [showError]);

  const loadEcommerces = useCallback(async () => {
    try {
      console.log('🛒 DataContext.loadEcommerces - Carregando e-commerces...');
      
      const response = await apiRequest(API_CONFIG.ENDPOINTS.ECOMMERCES, { method: 'GET' });
      
      if (response && Array.isArray(response)) {
        setEcommerces(response);
        console.log(`✅ DataContext.loadEcommerces - ${response.length} e-commerces carregados`);
      }
    } catch (error) {
      console.error('❌ DataContext.loadEcommerces - Erro:', error);
      showError('Erro ao carregar e-commerces', 'Não foi possível carregar a lista de e-commerces.');
    }
  }, [showError]);

  const addDelivery = useCallback(async (deliveryData: any) => {
    try {
      console.log('📦 DataContext.addDelivery - Dados:', deliveryData);
      
      const response = await apiRequest(API_CONFIG.ENDPOINTS.DELIVERIES, {
        method: 'POST',
        body: JSON.stringify(deliveryData)
      });
      
      console.log('✅ DataContext.addDelivery - Resposta:', response);
      showSuccess('Entrega cadastrada!', 'A entrega foi cadastrada com sucesso.');
    } catch (error) {
      console.error('❌ DataContext.addDelivery - Erro:', error);
      showError('Erro ao cadastrar entrega', 'Não foi possível cadastrar a entrega. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  const updateDelivery = useCallback(async (id: number, deliveryData: any) => {
    try {
      console.log(`📦 DataContext.updateDelivery - ID: ${id}, Dados:`, deliveryData);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.DELIVERIES}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(deliveryData)
      });
      
      console.log('✅ DataContext.updateDelivery - Resposta:', response);
      showSuccess('Entrega atualizada!', 'Os dados da entrega foram atualizados com sucesso.');
    } catch (error) {
      console.error('❌ DataContext.updateDelivery - Erro:', error);
      showError('Erro ao atualizar entrega', 'Não foi possível atualizar a entrega. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  const deleteDelivery = useCallback(async (id: number) => {
    try {
      console.log(`📦 DataContext.deleteDelivery - ID: ${id}`);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.DELIVERIES}/${id}`, {
        method: 'DELETE'
      });
      
      console.log('✅ DataContext.deleteDelivery - Resposta:', response);
      showSuccess('Entrega excluída!', 'A entrega foi excluída com sucesso.');
    } catch (error) {
      console.error('❌ DataContext.deleteDelivery - Erro:', error);
      showError('Erro ao excluir entrega', 'Não foi possível excluir a entrega. Tente novamente.');
      throw error;
    }
  }, [showSuccess, showError]);

  return (
    <DataContext.Provider value={{
      // Companies
      companies,
      companyPagination,
      loadCompanies,
      addCompany,
      updateCompany,
      deleteCompany,

      // Residences
      residences,
      residencePagination,
      loadResidences,
      addResidence,
      updateResidence,
      deleteResidence,

      // Residents
      residents,
      residentPagination,
      loadResidents,
      addResident,
      updateResident,
      deleteResident,

      // Employees
      employees,
      employeePagination,
      loadEmployees,
      addEmployee,
      updateEmployee,
      resetEmployeePassword,
      deleteEmployee,

      // Service Providers
      serviceProviders,
      serviceProviderPagination,
      loadServiceProviders,
      addServiceProvider,
      updateServiceProvider,
      deleteServiceProvider,

      // Guests
      guests,
      guestPagination,
      guestsSelect,
      loadGuests,
      loadGuestsSelect,
      addGuest,
      updateGuest,
      deleteGuest,

      // Appointments
      appointments,
      appointmentPagination,
      loadAppointments,
      addAppointment,
      updateAppointment,
      deleteAppointment,

      // Deliveries
      deliveries,
      deliveryPagination,
      ecommerces,
      loadDeliveries,
      loadEcommerces,
      addDelivery,
      updateDelivery,
      deleteDelivery,

      // User Profile
      loadUserProfile
    }}>
      {children}
    </DataContext.Provider>
  );
};