import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Users, Filter, Loader2, ChevronLeft, ChevronRight, Key } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { apiRequest, API_CONFIG } from '../../config/api';
import Modal from '../common/Modal';
import ConfirmationModal from '../common/ConfirmationModal';
import EmployeeForm from '../forms/EmployeeForm';
import PasswordDisplayModal from '../common/PasswordDisplayModal';

const EmployeeManagement: React.FC = () => {
  const { employees, employeePagination, loadEmployees, deleteEmployee, resetEmployeePassword } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [permissionFilter, setPermissionFilter] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingEmployeeData, setLoadingEmployeeData] = useState<Record<string, boolean>>({});
  const [loadingPasswordReset, setLoadingPasswordReset] = useState<Record<string, boolean>>({});
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [passwordData, setPasswordData] = useState<{ message: string; password: string } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    employee: any | null;
    loading: boolean;
  }>({
    isOpen: false,
    employee: null,
    loading: false
  });

  const statusOptions = ['active', 'inactive'];
  const permissionOptions = ['Administrador', 'Funcionário'];

  // Carregar funcionários quando o componente for montado
  useEffect(() => {
    console.log('👥 EmployeeManagement.useEffect[mount] - Iniciando...');
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        console.log('👥 EmployeeManagement.loadInitialData - Chamando loadEmployees...');
        await loadEmployees();
        console.log('✅ EmployeeManagement.loadInitialData - Concluído');
      } finally {
        setInitialLoading(false);
      }
    };
    loadInitialData();
  }, []); // Executar apenas uma vez no mount

  // Debounce para busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '' || statusFilter !== '' || permissionFilter !== '') {
        handleSearch();
      } else {
        loadEmployees(1); // Recarregar primeira página sem busca
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, permissionFilter, loadEmployees]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Construir parâmetros de busca
      const searchParams = new URLSearchParams();
      if (searchTerm) searchParams.append('search', searchTerm);
      if (statusFilter) searchParams.append('status', statusFilter);
      if (permissionFilter) searchParams.append('permission', permissionFilter);
      
      const searchQuery = searchParams.toString();
      await loadEmployees(1, searchQuery);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    setLoading(true);
    try {
      // Construir parâmetros de busca
      const searchParams = new URLSearchParams();
      if (searchTerm) searchParams.append('search', searchTerm);
      if (statusFilter) searchParams.append('status', statusFilter);
      if (permissionFilter) searchParams.append('permission', permissionFilter);
      
      const searchQuery = searchParams.toString();
      await loadEmployees(page, searchQuery);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (employee: any) => {
    setLoadingEmployeeData(prev => ({ ...prev, [employee.id]: true }));
    try {
      console.log(`📝 Carregando dados do funcionário ${employee.id} para edição...`);
      
      // Fazer requisição para obter dados completos do funcionário
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.EMPLOYEES}/${employee.id}`, {
        method: 'GET'
      });
      
      console.log('✅ Dados do funcionário carregados:', response);
      
      if (response) {
        setEditingEmployee(response);
        setIsModalOpen(true);
      } else {
        console.error('❌ Dados do funcionário não encontrados');
        // Fallback para dados básicos se a API falhar
        setEditingEmployee(employee);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do funcionário:', error);
      // Fallback para dados básicos se a API falhar
      setEditingEmployee(employee);
      setIsModalOpen(true);
    } finally {
      setLoadingEmployeeData(prev => ({ ...prev, [employee.id]: false }));
    }
  };

  const handleResetPassword = async (employee: any) => {
    setLoadingPasswordReset(prev => ({ ...prev, [employee.id]: true }));
    try {
      const result = await resetEmployeePassword(employee.id);
      setPasswordData(result);
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
    } finally {
      setLoadingPasswordReset(prev => ({ ...prev, [employee.id]: false }));
    }
  };

  const handleDeleteClick = (employee: any) => {
    setDeleteConfirmation({
      isOpen: true,
      employee,
      loading: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.employee) return;

    setDeleteConfirmation(prev => ({ ...prev, loading: true }));

    try {
      await deleteEmployee(deleteConfirmation.employee.id);
      
      setDeleteConfirmation({
        isOpen: false,
        employee: null,
        loading: false
      });

      // Recarregar a página atual após exclusão
      const currentPage = employeePagination?.current_page || 1;
      
      // Construir parâmetros de busca
      const searchParams = new URLSearchParams();
      if (searchTerm) searchParams.append('search', searchTerm);
      if (statusFilter) searchParams.append('status', statusFilter);
      if (permissionFilter) searchParams.append('permission', permissionFilter);
      
      const searchQuery = searchParams.toString();
      await loadEmployees(currentPage, searchQuery);
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error);
      setDeleteConfirmation(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      employee: null,
      loading: false
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const handleFormSuccess = () => {
    handleCloseModal();
    // Recarregar a página atual após sucesso
    const currentPage = employeePagination?.current_page || 1;
    
    // Construir parâmetros de busca
    const searchParams = new URLSearchParams();
    if (searchTerm) searchParams.append('search', searchTerm);
    if (statusFilter) searchParams.append('status', statusFilter);
    if (permissionFilter) searchParams.append('permission', permissionFilter);
    
    const searchQuery = searchParams.toString();
    loadEmployees(currentPage, searchQuery);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-red-100 text-red-800',
      'no-active': 'bg-red-100 text-red-800'
    };
    const statusLabels = {
      'active': 'Ativo',
      'inactive': 'Inativo',
      'no-active': 'Inativo'
    };
    return {
      color: statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800',
      label: statusLabels[status as keyof typeof statusLabels] || status
    };
  };

  const getPermissionBadge = (permission: string) => {
    const permissionColors = {
      'Administrador': 'bg-purple-100 text-purple-800',
      'Funcionário': 'bg-blue-100 text-blue-800'
    };
    return permissionColors[permission as keyof typeof permissionColors] || 'bg-gray-100 text-gray-800';
  };

  // Função para renderizar os botões de paginação
  const renderPaginationButtons = () => {
    if (!employeePagination || employeePagination.last_page <= 1) {
      return null;
    }

    const buttons = [];
    const currentPage = employeePagination.current_page;
    const lastPage = employeePagination.last_page;

    // Botão "Anterior"
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
    );

    // Botões de páginas
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(lastPage, currentPage + 2);

    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          disabled={loading}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300">
            ...
          </span>
        );
      }
    }

    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          disabled={loading}
          className={`px-3 py-2 text-sm font-medium border border-gray-300 disabled:opacity-50 ${
            page === currentPage
              ? 'bg-blue-600 text-white border-blue-600'
              : 'text-gray-500 bg-white hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      );
    }

    if (endPage < lastPage) {
      if (endPage < lastPage - 1) {
        buttons.push(
          <span key="ellipsis2" className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={lastPage}
          onClick={() => handlePageChange(lastPage)}
          disabled={loading}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          {lastPage}
        </button>
      );
    }

    // Botão "Próximo"
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === lastPage || loading}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    );

    return buttons;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Funcionários</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Funcionário</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os Status</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status === 'active' ? 'Ativo' : 'Inativo'}
              </option>
            ))}
          </select>
          <select
            value={permissionFilter}
            onChange={(e) => setPermissionFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas as Permissões</option>
            {permissionOptions.map(permission => (
              <option key={permission} value={permission}>{permission}</option>
            ))}
          </select>
          {loading && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Carregando...</span>
            </div>
          )}
        </div>

        {/* Informações de paginação */}
        {employeePagination && (
          <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
            <div>
              Mostrando {employeePagination.from} a {employeePagination.to} de {employeePagination.total} funcionários
            </div>
            <div>
              Página {employeePagination.current_page} de {employeePagination.last_page}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {/* Loading inicial */}
          {initialLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3 text-blue-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-lg font-medium">Carregando funcionários...</span>
              </div>
            </div>
          )}

          {/* Tabela de funcionários */}
          {!initialLoading && (
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Funcionário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => {
                const statusBadge = getStatusBadge(employee.status);
                return (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPermissionBadge(employee.permission)}`}>
                        {employee.permission}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleResetPassword(employee)}
                          disabled={loadingPasswordReset[employee.id]}
                          className="text-orange-600 hover:text-orange-800 p-1 rounded-full hover:bg-orange-50 transition-colors"
                          title="Resetar Senha"
                        >
                          {loadingPasswordReset[employee.id] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Key className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(employee)}
                          disabled={loadingEmployeeData[employee.id]}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          {loadingEmployeeData[employee.id] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Edit className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(employee)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </div>

        {employees.length === 0 && !loading && !initialLoading && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Nenhum funcionário encontrado para a busca realizada' : 'Nenhum funcionário encontrado'}
            </p>
          </div>
        )}

        {/* Controles de paginação */}
        {employeePagination && employeePagination.last_page > 1 && !initialLoading && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              {employeePagination.total} {employeePagination.total === 1 ? 'funcionário' : 'funcionários'} no total
            </div>
            <div className="flex items-center space-x-1">
              {renderPaginationButtons()}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <EmployeeForm
          employee={editingEmployee}
          onClose={handleFormSuccess}
        />
      </Modal>

      {/* Modal de Exibição de Senha */}
      <PasswordDisplayModal
        isOpen={!!passwordData}
        onClose={() => setPasswordData(null)}
        passwordData={passwordData}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o funcionário "${deleteConfirmation.employee?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir Funcionário"
        cancelText="Cancelar"
        type="danger"
        loading={deleteConfirmation.loading}
      />
    </div>
  );
};

export default EmployeeManagement;