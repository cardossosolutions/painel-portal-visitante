import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Home, Users, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { apiRequest, API_CONFIG } from '../../config/api';
import Modal from '../common/Modal';
import ConfirmationModal from '../common/ConfirmationModal';
import ResidenceForm from '../forms/ResidenceForm';
import ResidentManagement from './ResidentManagement';

const ResidenceManagement: React.FC = () => {
  const { residences, residencePagination, loadResidences, loadResidents, deleteResidence } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResidence, setEditingResidence] = useState<any>(null);
  const [loadingResidenceData, setLoadingResidenceData] = useState<Record<string, boolean>>({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedResidenceId, setSelectedResidenceId] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    residence: any | null;
    loading: boolean;
  }>({
    isOpen: false,
    residence: null,
    loading: false
  });

  // Carregar residências quando o componente for montado
  useEffect(() => {
    console.log('🏠 ResidenceManagement.useEffect[mount] - Iniciando...');
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        console.log('🏠 ResidenceManagement.loadInitialData - Chamando loadResidences...');
        await loadResidences();
        console.log('✅ ResidenceManagement.loadInitialData - Concluído');
      } finally {
        setInitialLoading(false);
      }
    };
    loadInitialData();
  }, []); // Executar apenas uma vez no mount

  // Debounce para busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '' || statusFilter !== '') {
        handleSearch();
      } else {
        loadResidences(1); // Recarregar primeira página sem busca
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, loadResidences]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Construir parâmetros de busca
      const searchParams = new URLSearchParams();
      if (searchTerm) searchParams.append('search', searchTerm);
      if (statusFilter) searchParams.append('status', statusFilter);
      
      const searchQuery = searchParams.toString();
      await loadResidences(1, searchQuery);
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
      
      const searchQuery = searchParams.toString();
      await loadResidences(page, searchQuery);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (residence: any) => {
    setLoadingResidenceData(prev => ({ ...prev, [residence.id]: true }));
    try {
      console.log(`📝 Carregando dados da residência ${residence.id} para edição...`);
      
      // Fazer requisição para obter dados completos da residência
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.RESIDENCES}/${residence.id}`, {
        method: 'GET'
      });
      
      console.log('✅ Dados da residência carregados:', response);
      
      if (response) {
        // Converter dados da API para o formato esperado pelo formulário
        const residenceData = {
          id: residence.id,
          nome: response.name,
          status: response.active ? 'Ativo' : 'Inativo',
          cep: response.cep,
          logradouro: response.street,
          numero: response.number,
          complemento: response.complement || '',
          bairro: response.neighborhood,
          cidadeId: response.city,
          cidadeNome: response.city_name,
          estadoId: response.state,
          estadoNome: response.name_state,
          estadoSigla: '', // Será preenchido pelo StatesCitiesSelector
          telefone: '', // Não está na resposta da API
          email: '' // Não está na resposta da API
        };
        
        setEditingResidence(residenceData);
        setIsModalOpen(true);
      } else {
        console.error('❌ Dados da residência não encontrados');
        // Fallback para dados básicos se a API falhar
        setEditingResidence(residence);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados da residência:', error);
      // Fallback para dados básicos se a API falhar
      setEditingResidence(residence);
      setIsModalOpen(true);
    } finally {
      setLoadingResidenceData(prev => ({ ...prev, [residence.id]: false }));
    }
  };

  const handleDeleteClick = (residence: any) => {
    setDeleteConfirmation({
      isOpen: true,
      residence,
      loading: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.residence) return;

    setDeleteConfirmation(prev => ({ ...prev, loading: true }));

    try {
      await deleteResidence(deleteConfirmation.residence.id);
      
      setDeleteConfirmation({
        isOpen: false,
        residence: null,
        loading: false
      });

      // Recarregar a página atual após exclusão
      const currentPage = residencePagination?.current_page || 1;
      
      // Construir parâmetros de busca
      const searchParams = new URLSearchParams();
      if (searchTerm) searchParams.append('search', searchTerm);
      if (statusFilter) searchParams.append('status', statusFilter);
      
      const searchQuery = searchParams.toString();
      await loadResidences(currentPage, searchQuery);
    } catch (error) {
      console.error('Erro ao excluir residência:', error);
      setDeleteConfirmation(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      residence: null,
      loading: false
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingResidence(null);
  };

  const handleFormSuccess = () => {
    handleCloseModal();
    // Recarregar a página atual após sucesso
    const currentPage = residencePagination?.current_page || 1;
    
    // Construir parâmetros de busca
    const searchParams = new URLSearchParams();
    if (searchTerm) searchParams.append('search', searchTerm);
    if (statusFilter) searchParams.append('status', statusFilter);
    
    const searchQuery = searchParams.toString();
    loadResidences(currentPage, searchQuery);
  };

  // Função para renderizar os botões de paginação
  const renderPaginationButtons = () => {
    if (!residencePagination || residencePagination.last_page <= 1) {
      return null;
    }

    const buttons = [];
    const currentPage = residencePagination.current_page;
    const lastPage = residencePagination.last_page;

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
  const handleManageResidents = (residenceId: string) => {
    setSelectedResidenceId(residenceId);
  };

  if (selectedResidenceId) {
    return (
      <ResidentManagement
        residenceId={selectedResidenceId}
        onBack={() => setSelectedResidenceId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Residências</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Residência</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, rua ou número..."
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
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
          {loading && (
            <div className="flex items-center space-x-2 text-green-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              <span className="text-sm">Carregando...</span>
            </div>
          )}
        </div>

        {/* Informações de paginação */}
        {residencePagination && (
          <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
            <div>
              Mostrando {residencePagination.from} a {residencePagination.to} de {residencePagination.total} residências
            </div>
            <div>
              Página {residencePagination.current_page} de {residencePagination.last_page}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {/* Loading inicial */}
          {initialLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3 text-green-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-lg font-medium">Carregando residências...</span>
              </div>
            </div>
          )}

          {/* Tabela de residências */}
          {!initialLoading && (
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome da Residência
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Endereço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número
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
              {residences.map((residence) => (
                <tr key={residence.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        <Home className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {residence.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {residence.street}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {residence.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      residence.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {residence.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleManageResidents(residence.id)}
                        className="text-purple-600 hover:text-purple-800 p-1 rounded-full hover:bg-purple-50 transition-colors"
                        title="Gerenciar Moradores"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(residence)}
                        disabled={loadingResidenceData[residence.id]}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                        title="Editar"
                      >
                        {loadingResidenceData[residence.id] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Edit className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(residence)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        {residences.length === 0 && !loading && !initialLoading && (
          <div className="text-center py-8">
            <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Nenhuma residência encontrada para a busca realizada' : 'Nenhuma residência encontrada'}
            </p>
          </div>
        )}

        {/* Controles de paginação */}
        {residencePagination && residencePagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              {residencePagination.total} {residencePagination.total === 1 ? 'residência' : 'residências'} no total
            </div>
            <div className="flex items-center space-x-1">
              {renderPaginationButtons()}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ResidenceForm
          residence={editingResidence}
          onClose={handleFormSuccess}
        />
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a residência "${deleteConfirmation.residence?.name}"? Esta ação não pode ser desfeita e todos os moradores relacionados também serão removidos.`}
        confirmText="Excluir Residência"
        cancelText="Cancelar"
        type="danger"
        loading={deleteConfirmation.loading}
      />
    </div>
  );
};

export default ResidenceManagement;