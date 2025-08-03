import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Briefcase, Calendar, Clock, Loader2, ChevronLeft, ChevronRight, Car, Phone } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import Modal from '../common/Modal';
import ConfirmationModal from '../common/ConfirmationModal';
import ServiceProviderForm from '../forms/ServiceProviderForm';

const ServiceProviderManagement: React.FC = () => {
  const { serviceProviders, serviceProviderPagination, loadServiceProviders, deleteServiceProvider } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    provider: any | null;
    loading: boolean;
  }>({
    isOpen: false,
    provider: null,
    loading: false
  });

  // Carregar prestadores de serviços quando o componente for montado
  useEffect(() => {
    console.log('🔧 ServiceProviderManagement.useEffect[mount] - Iniciando...');
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        console.log('🔧 ServiceProviderManagement.loadInitialData - Chamando loadServiceProviders...');
        await loadServiceProviders();
        console.log('✅ ServiceProviderManagement.loadInitialData - Concluído');
      } finally {
        setInitialLoading(false);
      }
    };
    loadInitialData();
  }, []); // Executar apenas uma vez no mount

  // Debounce para busca
  useEffect(() => {
    // Evitar busca na primeira renderização se não há termo de busca
    if (searchTerm === '') {
      return; // Não fazer busca se o termo estiver vazio
    }

    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]); // Remover loadServiceProviders das dependências

  const handleSearch = async () => {
    setLoading(true);
    try {
      await loadServiceProviders(1, searchTerm);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    setLoading(true);
    try {
      await loadServiceProviders(page, searchTerm);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (provider: any) => {
    setEditingProvider(provider);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (provider: any) => {
    setDeleteConfirmation({
      isOpen: true,
      provider,
      loading: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.provider) return;

    setDeleteConfirmation(prev => ({ ...prev, loading: true }));

    try {
      await deleteServiceProvider(deleteConfirmation.provider.id);
      
      setDeleteConfirmation({
        isOpen: false,
        provider: null,
        loading: false
      });

      // Recarregar a página atual após exclusão
      const currentPage = serviceProviderPagination?.current_page || 1;
      await loadServiceProviders(currentPage, searchTerm);
    } catch (error) {
      console.error('Erro ao excluir prestador de serviços:', error);
      setDeleteConfirmation(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      provider: null,
      loading: false
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProvider(null);
  };

  const handleFormSuccess = () => {
    handleCloseModal();
    // Recarregar a página atual após sucesso
    const currentPage = serviceProviderPagination?.current_page || 1;
    loadServiceProviders(currentPage, searchTerm);
  };

  const formatDateRange = (dateStart: string, dateEnding: string) => {
    if (dateStart === dateEnding) {
      return new Date(dateStart).toLocaleDateString('pt-BR');
    }
    return `${new Date(dateStart).toLocaleDateString('pt-BR')} até ${new Date(dateEnding).toLocaleDateString('pt-BR')}`;
  };

  // Função para renderizar os botões de paginação
  const renderPaginationButtons = () => {
    if (!serviceProviderPagination || serviceProviderPagination.last_page <= 1) {
      return null;
    }

    const buttons = [];
    const currentPage = serviceProviderPagination.current_page;
    const lastPage = serviceProviderPagination.last_page;

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
        <h1 className="text-3xl font-bold text-gray-900">Prestadores de Serviços</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Prestador</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF, RG ou observações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {loading && (
            <div className="flex items-center space-x-2 text-indigo-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              <span className="text-sm">Carregando...</span>
            </div>
          )}
        </div>

        {/* Informações de paginação */}
        {serviceProviderPagination && (
          <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
            <div>
              Mostrando {serviceProviderPagination.from} a {serviceProviderPagination.to} de {serviceProviderPagination.total} prestadores
            </div>
            <div>
              Página {serviceProviderPagination.current_page} de {serviceProviderPagination.last_page}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {/* Loading inicial */}
          {initialLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3 text-indigo-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-lg font-medium">Carregando prestadores de serviços...</span>
              </div>
            </div>
          )}

          {/* Tabela de prestadores de serviços */}
          {!initialLoading && (
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prestador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documentos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Veículo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {serviceProviders.map((provider) => (
                <tr key={provider.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 p-2 rounded-full mr-3">
                        <Briefcase className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                        {provider.observation && (
                          <div className="text-sm text-gray-500 truncate max-w-xs" title={provider.observation}>
                            {provider.observation}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>CPF: {provider.cpf}</div>
                    <div className="text-gray-500">RG: {provider.rg}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-1" />
                      {provider.mobile}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                      {formatDateRange(provider.date_start, provider.date_ending)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {provider.plate ? (
                      <div className="flex items-center">
                        <Car className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="font-mono">{provider.plate}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Não informado</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(provider)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(provider)}
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

        {serviceProviders.length === 0 && !loading && !initialLoading && (
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Nenhum prestador de serviços encontrado para a busca realizada' : 'Nenhum prestador de serviços encontrado'}
            </p>
          </div>
        )}

        {/* Controles de paginação */}
        {serviceProviderPagination && serviceProviderPagination.last_page > 1 && !initialLoading && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              {serviceProviderPagination.total} {serviceProviderPagination.total === 1 ? 'prestador' : 'prestadores'} no total
            </div>
            <div className="flex items-center space-x-1">
              {renderPaginationButtons()}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      <Modal isOpen={isModalOpen} onClose={handleFormSuccess}>
        <ServiceProviderForm
          provider={editingProvider}
          onClose={handleFormSuccess}
        />
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o prestador de serviços "${deleteConfirmation.provider?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir Prestador"
        cancelText="Cancelar"
        type="danger"
        loading={deleteConfirmation.loading}
      />
    </div>
  );
};

export default ServiceProviderManagement;