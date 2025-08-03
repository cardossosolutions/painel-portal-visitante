import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, Clock, Loader2, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import Modal from '../common/Modal';
import ConfirmationModal from '../common/ConfirmationModal';
import AppointmentForm from '../forms/AppointmentForm';

const AppointmentManagement: React.FC = () => {
  const { appointments, appointmentPagination, loadAppointments, deleteAppointment } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [loadingAppointmentData, setLoadingAppointmentData] = useState<Record<string, boolean>>({});
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    appointment: any | null;
    loading: boolean;
  }>({
    isOpen: false,
    appointment: null,
    loading: false
  });

  // Carregar agendamentos quando o componente for montado
  useEffect(() => {
    console.log('📅 AppointmentManagement.useEffect[mount] - Iniciando...');
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        console.log('📅 AppointmentManagement.loadInitialData - Chamando loadAppointments...');
        await loadAppointments();
        console.log('✅ AppointmentManagement.loadInitialData - Concluído');
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
        loadAppointments(1); // Recarregar primeira página sem busca
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadAppointments]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      await loadAppointments(1, searchTerm);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    setLoading(true);
    try {
      await loadAppointments(page, searchTerm);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (appointment: any) => {
    setLoadingAppointmentData(prev => ({ ...prev, [appointment.id]: true }));
    try {
      // Para agendamentos, podemos usar os dados já carregados
      // Converter formato de data de DD/MM/YYYY para YYYY-MM-DD
      const convertDateFormat = (dateStr: string) => {
        if (!dateStr) return '';
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      };

      const appointmentData = {
        id: appointment.id,
        visitor: appointment.visitor_id ? appointment.visitor_id.toString() : '', // Usar visitor_id da listagem
        dateBegin: convertDateFormat(appointment.dateBegin),
        dateEnding: convertDateFormat(appointment.dateEnding)
      };

      setEditingAppointment(appointmentData);
      setIsModalOpen(true);
    } finally {
      setLoadingAppointmentData(prev => ({ ...prev, [appointment.id]: false }));
    }
  };

  const handleDeleteClick = (appointment: any) => {
    setDeleteConfirmation({
      isOpen: true,
      appointment,
      loading: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.appointment) return;

    setDeleteConfirmation(prev => ({ ...prev, loading: true }));

    try {
      await deleteAppointment(deleteConfirmation.appointment.id);
      
      setDeleteConfirmation({
        isOpen: false,
        appointment: null,
        loading: false
      });

      // Recarregar a página atual após exclusão
      const currentPage = appointmentPagination?.current_page || 1;
      await loadAppointments(currentPage, searchTerm);
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      setDeleteConfirmation(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      appointment: null,
      loading: false
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAppointment(null);
  };

  const handleFormSuccess = () => {
    handleCloseModal();
    // Recarregar a página atual após sucesso
    const currentPage = appointmentPagination?.current_page || 1;
    loadAppointments(currentPage, searchTerm);
  };

  const formatDateRange = (dateBegin: string, dateEnding: string) => {
    if (dateBegin === dateEnding) {
      return dateBegin;
    }
    return `${dateBegin} até ${dateEnding}`;
  };

  // Função para renderizar os botões de paginação
  const renderPaginationButtons = () => {
    if (!appointmentPagination || appointmentPagination.last_page <= 1) {
      return null;
    }

    const buttons = [];
    const currentPage = appointmentPagination.current_page;
    const lastPage = appointmentPagination.last_page;

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
        <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Agendamento</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome do convidado, CPF ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {loading && (
            <div className="flex items-center space-x-2 text-red-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              <span className="text-sm">Carregando...</span>
            </div>
          )}
        </div>

        {/* Informações de paginação */}
        {appointmentPagination && (
          <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
            <div>
              Mostrando {appointmentPagination.from} a {appointmentPagination.to} de {appointmentPagination.total} agendamentos
            </div>
            <div>
              Página {appointmentPagination.current_page} de {appointmentPagination.last_page}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {/* Loading inicial */}
          {initialLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3 text-red-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-lg font-medium">Carregando agendamentos...</span>
              </div>
            </div>
          )}

          {/* Tabela de agendamentos */}
          {!initialLoading && (
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Convidado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsável
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-red-100 p-2 rounded-full mr-3">
                        <User className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.cpf}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.responsible}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                      {formatDateRange(appointment.dateBegin, appointment.dateEnding)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(appointment)}
                        disabled={loadingAppointmentData[appointment.id]}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                        title="Editar"
                      >
                        {loadingAppointmentData[appointment.id] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Edit className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(appointment)}
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

        {appointments.length === 0 && !loading && !initialLoading && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Nenhum agendamento encontrado para a busca realizada' : 'Nenhum agendamento encontrado'}
            </p>
          </div>
        )}

        {/* Controles de paginação */}
        {appointmentPagination && appointmentPagination.last_page > 1 && !initialLoading && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              {appointmentPagination.total} {appointmentPagination.total === 1 ? 'agendamento' : 'agendamentos'} no total
            </div>
            <div className="flex items-center space-x-1">
              {renderPaginationButtons()}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      <Modal isOpen={isModalOpen} onClose={handleFormSuccess}>
        <AppointmentForm
          appointment={editingAppointment}
          onClose={handleFormSuccess}
        />
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o agendamento para "${deleteConfirmation.appointment?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir Agendamento"
        cancelText="Cancelar"
        type="danger"
        loading={deleteConfirmation.loading}
      />
    </div>
  );
};

export default AppointmentManagement;