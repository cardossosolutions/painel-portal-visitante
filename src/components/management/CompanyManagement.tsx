import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Building, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { apiRequest, API_CONFIG } from '../../config/api';
import Modal from '../common/Modal';
import ConfirmationModal from '../common/ConfirmationModal';
import CompanyForm from '../forms/CompanyForm';

const CompanyManagement: React.FC = () => {
  const { companies, companyPagination, loadCompanies, deleteCompany } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [loadingCompanyData, setLoadingCompanyData] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    company: any | null;
    loading: boolean;
  }>({
    isOpen: false,
    company: null,
    loading: false
  });

  // Carregar empresas quando o componente for montado
  useEffect(() => {
    console.log('📋 CompanyManagement.useEffect[mount] - Iniciando...');
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        console.log('📋 CompanyManagement.loadInitialData - Chamando loadCompanies...');
        await loadCompanies();
        console.log('✅ CompanyManagement.loadInitialData - Concluído');
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
        loadCompanies(1); // Recarregar primeira página sem busca
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadCompanies]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      await loadCompanies(1, searchTerm);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    setLoading(true);
    try {
      await loadCompanies(page, searchTerm);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (company: any) => {
    setLoadingCompanyData(prev => ({ ...prev, [company.id]: true }));
    try {
      console.log(`📝 Carregando dados da empresa ${company.id} para edição...`);
      
      // Fazer requisição para obter dados completos da empresa
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.COMPANIES}/${company.id}`, {
        method: 'GET'
      });
      
      console.log('✅ Dados da empresa carregados:', response);
      
      if (response) {
        // Converter dados da API para o formato esperado pelo formulário
        const companyData = {
          id: response.id,
          cnpj: response.cnpj,
          razaoSocial: response.corporate_name,
          nomeFantasia: response.fantasy_name,
          cep: response.cep,
          logradouro: response.street,
          numero: response.number,
          complemento: response.complement || '',
          bairro: response.neighborhood,
          cidadeId: response.city_id,
          estadoId: response.state_id,
          email: response.email,
          telefone: response.phone_number || '',
          celular: response.mobile_number || ''
        };
        
        setEditingCompany(companyData);
        setIsModalOpen(true);
      } else {
        console.error('❌ Dados da empresa não encontrados');
        // Fallback para dados básicos se a API falhar
        setEditingCompany(company);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados da empresa:', error);
      // Fallback para dados básicos se a API falhar
      setEditingCompany(company);
      setIsModalOpen(true);
    } finally {
      setLoadingCompanyData(prev => ({ ...prev, [company.id]: false }));
    }
  };

  const handleDeleteClick = (company: any) => {
    setDeleteConfirmation({
      isOpen: true,
      company,
      loading: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.company) return;

    setDeleteConfirmation(prev => ({ ...prev, loading: true }));

    try {
      await deleteCompany(deleteConfirmation.company.id);
      
      // Fechar modal de confirmação
      setDeleteConfirmation({
        isOpen: false,
        company: null,
        loading: false
      });

      // Recarregar a página atual após exclusão
      const currentPage = companyPagination?.current_page || 1;
      await loadCompanies(currentPage, searchTerm);
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      setDeleteConfirmation(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      company: null,
      loading: false
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
  };

  const handleFormSuccess = () => {
    handleCloseModal();
    // Recarregar a página atual após sucesso
    const currentPage = companyPagination?.current_page || 1;
    loadCompanies(currentPage, searchTerm);
  };

  // Função para renderizar os botões de paginação
  const renderPaginationButtons = () => {
    if (!companyPagination || companyPagination.last_page <= 1) {
      return null;
    }

    const buttons = [];
    const currentPage = companyPagination.current_page;
    const lastPage = companyPagination.last_page;

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
        <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Empresa</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome fantasia, razão social ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {loading && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Carregando...</span>
            </div>
          )}
        </div>

        {/* Informações de paginação */}
        {companyPagination && (
          <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
            <div>
              Mostrando {companyPagination.from} a {companyPagination.to} de {companyPagination.total} empresas
            </div>
            <div>
              Página {companyPagination.current_page} de {companyPagination.last_page}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {/* Loading inicial */}
          {initialLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3 text-blue-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-lg font-medium">Carregando empresas...</span>
              </div>
            </div>
          )}

          {/* Tabela de empresas */}
          {!initialLoading && (
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CNPJ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <Building className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{company.fantasy_name}</div>
                        <div className="text-sm text-gray-500">{company.corporate_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.cnpj}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      {company.city_name && company.state ? (
                        `${company.city_name}, ${company.state}`
                      ) : (
                        company.state || 'Não informado'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{company.email}</div>
                    <div className="text-gray-500">
                      {company.phone_number || company.mobile_number || 'Não informado'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(company)}
                        disabled={loadingCompanyData[company.id]}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                        title="Editar"
                      >
                        {loadingCompanyData[company.id] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Edit className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(company)}
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

        {companies.length === 0 && !loading && !initialLoading && (
          <div className="text-center py-8">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Nenhuma empresa encontrada para a busca realizada' : 'Nenhuma empresa encontrada'}
            </p>
          </div>
        )}

        {/* Controles de paginação */}
        {companyPagination && companyPagination.last_page > 1 && !initialLoading && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              {companyPagination.total} {companyPagination.total === 1 ? 'empresa' : 'empresas'} no total
            </div>
            <div className="flex items-center space-x-1">
              {renderPaginationButtons()}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <CompanyForm
          company={editingCompany}
          onClose={handleFormSuccess}
        />
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a empresa "${deleteConfirmation.company?.fantasy_name}"? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.`}
        confirmText="Excluir Empresa"
        cancelText="Cancelar"
        type="danger"
        loading={deleteConfirmation.loading}
      />
    </div>
  );
};

export default CompanyManagement;