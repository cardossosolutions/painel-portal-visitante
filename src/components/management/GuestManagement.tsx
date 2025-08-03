import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, UserCheck, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { apiRequest, API_CONFIG } from '../../config/api';
import Modal from '../common/Modal';
import ConfirmationModal from '../common/ConfirmationModal';
import GuestForm from '../forms/GuestForm';

const GuestManagement: React.FC = () => {
  const { guests, guestPagination, loadGuests, deleteGuest } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingGuestData, setLoadingGuestData] = useState<Record<string, boolean>>({});
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    guest: any | null;
    loading: boolean;
  }>({
    isOpen: false,
    guest: null,
    loading: false
  });

  // Carregar convidados quando o componente for montado
  useEffect(() => {
    console.log('👤 GuestManagement.useEffect[mount] - Iniciando...');
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        console.log('👤 GuestManagement.loadInitialData - Chamando loadGuests...');
        await loadGuests();
        console.log('✅ GuestManagement.loadInitialData - Concluído');
      } finally {
        setInitialLoading(false);
      }
    };
    loadInitialData();
  }, []); // Executar apenas uma vez no mount

  // Debounce para busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        handleSearch();
      } else {
        loadGuests(1); // Recarregar primeira página sem busca
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadGuests]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      await loadGuests(1, searchTerm);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    setLoading(true);
    try {
      await loadGuests(page, searchTerm);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (guest: any) => {
    setLoadingGuestData(prev => ({ ...prev, [guest.id]: true }));
    try {
      console.log(`📝 Carregando dados do convidado ${guest.id} para edição...`);
      
      // Fazer requisição para obter dados completos do convidado
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.GUESTS}/${guest.id}`, {
        method: 'GET'
      });
      
      console.log('✅ Dados do convidado carregados:', response);
      
      if (response) {
        // Converter dados da API para o formato esperado pelo formulário
        const guestData = {
          id: response.id,
          name: response.name,
          residence: response.residence,
          cpf: response.cpf,
          rg: response.rg || '', // Usar RG da resposta da API
          plate: response.plate,
          observation: response.observation || '', // Usar observação da resposta da API
          type: 'visitor'
        };
        
        setEditingGuest(guestData);
        setIsModalOpen(true);
      } else {
        console.error('❌ Dados do convidado não encontrados');
        // Fallback para dados básicos se a API falhar
        setEditingGuest(guest);
        setIsModalOpen(true);
      }
    } finally {
      setLoadingGuestData(prev => ({ ...prev, [guest.id]: false }));
    }
  };

  const handleDeleteClick = (guest: any) => {
    setDeleteConfirmation({
      isOpen: true,
      guest,
      loading: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.guest) return;

    setDeleteConfirmation(prev => ({ ...prev, loading: true }));

    try {
      await deleteGuest(deleteConfirmation.guest.id);
      
      setDeleteConfirmation({
        isOpen: false,
        guest: null,
        loading: false
      });

      // Recarregar a página atual após exclusão
      const currentPage = guestPagination?.current_page || 1;
      await loadGuests(currentPage, searchTerm);
    } catch (error) {
      console.error('Erro ao excluir convidado:', error);
      setDeleteConfirmation(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      guest: null,
      loading: false
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGuest(null);
  };

  const handleFormSuccess = () => {
    handleCloseModal();
    // Recarregar a página atual após sucesso
    const currentPage = guestPagination?.current_page || 1;
    loadGuests(currentPage, searchTerm);
  };

  // Função para renderizar os botões de paginação
  const renderPaginationButtons = () => {
    if (!guestPagination || guestPagination.last_page <= 1) {
      return null;
    }

    const buttons = [];
    const currentPage = guestPagination.current_page;
    const lastPage = guestPagination.last_page;

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Convidados</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Convidado</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF, residência ou placa do veículo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {loading && (
            <div className="flex items-center space-x-2 text-orange-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
              <span className="text-sm">Carregando...</span>
            </div>
          )}
        </div>

        {/* Informações de paginação */}
        {guestPagination && (
          <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
            <div>
              Mostrando {guestPagination.from} a {guestPagination.to} de {guestPagination.total} convidados
            </div>
            <div>
              Página {guestPagination.current_page} de {guestPagination.last_page}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {initialLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3 text-orange-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-lg font-medium">Carregando convidados...</span>
              </div>
            </div>
          )}

          {/* Tabela de convidados */}
          {!initialLoading && (
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documentos
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
                {guests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-orange-100 p-2 rounded-full mr-3">
                          <UserCheck className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>CPF: {guest.cpf}</div>
                      {guest.rg && <div className="text-gray-500">RG: {guest.rg}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {guest.plate || 'Não informado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(guest)}
                          disabled={loadingGuestData[guest.id]}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          {loadingGuestData[guest.id] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Edit className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(guest)}
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

        {guests.length === 0 && !loading && !initialLoading && (
          <div className="text-center py-8">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Nenhum convidado encontrado para a busca realizada' : 'Nenhum convidado encontrado'}
            </p>
          </div>
        )}

        {/* Controles de paginação */}
        {guestPagination && guestPagination.last_page > 1 && !initialLoading && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              {guestPagination.total} {guestPagination.total === 1 ? 'convidado' : 'convidados'} no total
            </div>
            <div className="flex items-center space-x-1">
              {renderPaginationButtons()}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      <Modal isOpen={isModalOpen} onClose={handleFormSuccess}>
        <GuestForm
          guest={editingGuest}
          onClose={handleFormSuccess}
        />
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o convidado "${deleteConfirmation.guest?.name}"? Esta ação não pode ser desfeita e todos os agendamentos relacionados também serão removidos.`}
        confirmText="Excluir Convidado"
        cancelText="Cancelar"
        type="danger"
        loading={deleteConfirmation.loading}
      />
    </div>
  );
};

export default GuestManagement;