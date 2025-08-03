import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, ArrowLeft, User, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { apiRequest, API_CONFIG } from '../../config/api';
import Modal from '../common/Modal';
import ConfirmationModal from '../common/ConfirmationModal';
import ResidentForm from '../forms/ResidentForm';
import { useEffect } from 'react';

interface ResidentManagementProps {
  residenceId: string;
  onBack: () => void;
}

const ResidentManagement: React.FC<ResidentManagementProps> = ({ residenceId, onBack }) => {
  const { residents, residentPagination, residences, loadResidents, deleteResident } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingResidentData, setLoadingResidentData] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<any>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    resident: any | null;
    loading: boolean;
  }>({
    isOpen: false,
    resident: null,
    loading: false
  });

  const residence = residences.find(r => r.id === residenceId);

  // Carregar moradores quando o componente for montado
  useEffect(() => {
    console.log(`👥 ResidentManagement.useEffect[mount] - Iniciando para residência ${residenceId}...`);
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        console.log(`👥 ResidentManagement.loadInitialData - Chamando loadResidents para ${residenceId}...`);
        await loadResidents(residenceId);
        console.log('✅ ResidentManagement.loadInitialData - Concluído');
      } finally {
        setInitialLoading(false);
      }
    };
    loadInitialData();
  }, [residenceId]); // Executar quando residenceId mudar

  // Debounce para busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        handleSearch();
      } else {
        loadResidents(residenceId, 1); // Recarregar primeira página sem busca
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, residenceId, loadResidents]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      await loadResidents(residenceId, 1, searchTerm);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    setLoading(true);
    try {
      await loadResidents(residenceId, page, searchTerm);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (resident: any) => {
    setLoadingResidentData(prev => ({ ...prev, [resident.id]: true }));
    try {
      console.log(`📝 Carregando dados do morador ${resident.id} para edição...`);
      
      // Para moradores, podemos usar os dados já carregados
      setEditingResident(resident);
      setIsModalOpen(true);
    } finally {
      setLoadingResidentData(prev => ({ ...prev, [resident.id]: false }));
    }
  };

  const handleDeleteClick = (resident: any) => {
    setDeleteConfirmation({
      isOpen: true,
      resident,
      loading: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.resident) return;

    setDeleteConfirmation(prev => ({ ...prev, loading: true }));

    try {
      await deleteResident(deleteConfirmation.resident.id, residenceId);
      
      setDeleteConfirmation({
        isOpen: false,
        resident: null,
        loading: false
      });
    } catch (error) {
      console.error('Erro ao excluir morador:', error);
      setDeleteConfirmation(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      resident: null,
      loading: false
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingResident(null);
  };

  const handleFormSuccess = () => {
    handleCloseModal();
    // Recarregar a página atual após sucesso
    const currentPage = residentPagination?.current_page || 1;
    loadResidents(residenceId, currentPage, searchTerm);
  };

  // Função para renderizar os botões de paginação
  const renderPaginationButtons = () => {
    if (!residentPagination || residentPagination.last_page <= 1) {
      return null;
    }

    const buttons = [];
    const currentPage = residentPagination.current_page;
    const lastPage = residentPagination.last_page;

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

    // Botões de páginas (simplificado para economizar espaço)
    for (let page = Math.max(1, currentPage - 1); page <= Math.min(lastPage, currentPage + 1); page++) {
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
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
            title="Voltar para Residências"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Moradores</h1>
            <p className="text-gray-600">
              {residence ? residence.name : 'Residência não encontrada'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Morador</span>
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
          {loading && (
            <div className="flex items-center space-x-2 text-purple-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              <span className="text-sm">Carregando...</span>
            </div>
          )}
        </div>

        {/* Informações de paginação */}
        {residentPagination && (
          <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
            <div>
              Mostrando {residentPagination.from} a {residentPagination.to} de {residentPagination.total} moradores
            </div>
            <div>
              Página {residentPagination.current_page} de {residentPagination.last_page}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {/* Loading inicial */}
          {initialLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3 text-purple-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-lg font-medium">Carregando moradores...</span>
              </div>
            </div>
          )}

          {/* Tabela de moradores */}
          {!initialLoading && (
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Celular
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {residents.map((resident) => (
                <tr key={resident.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-full mr-3">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">{resident.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {resident.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {resident.mobile}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(resident)}
                        disabled={loadingResidentData[resident.id]}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors disabled:opacity-50"
                        title="Editar"
                      >
                        {loadingResidentData[resident.id] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Edit className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(resident)}
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

        {residents.length === 0 && !loading && !initialLoading && (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Nenhum morador encontrado para a busca realizada' : 'Nenhum morador encontrado'}
            </p>
          </div>
        )}

        {/* Controles de paginação */}
        {residentPagination && residentPagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              {residentPagination.total} {residentPagination.total === 1 ? 'morador' : 'moradores'} no total
            </div>
            <div className="flex items-center space-x-1">
              {renderPaginationButtons()}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      <Modal isOpen={isModalOpen} onClose={handleFormSuccess}>
        <ResidentForm
          resident={editingResident}
          residenceId={residenceId}
          onClose={handleFormSuccess}
        />
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o morador "${deleteConfirmation.resident?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir Morador"
        cancelText="Cancelar"
        type="danger"
        loading={deleteConfirmation.loading}
      />
    </div>
  );
};

export default ResidentManagement;