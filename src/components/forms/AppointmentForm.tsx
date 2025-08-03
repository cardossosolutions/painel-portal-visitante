import React, { useState, useEffect } from 'react';
import { Calendar, Search, X, Save, Loader2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface AppointmentFormProps {
  appointment?: any;
  onClose: () => void;
}

interface FormErrors {
  visitor?: string;
  dateBegin?: string;
  dateEnding?: string;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ appointment, onClose }) => {
  const { addAppointment, updateAppointment, guestsSelect, loadGuestsSelect } = useData();
  const [formData, setFormData] = useState({
    visitor: appointment?.visitor || '',
    dateBegin: appointment?.dateBegin || '',
    dateEnding: appointment?.dateEnding || ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  
  // Estados para pesquisa de convidado
  const [guestSearchTerm, setGuestSearchTerm] = useState('');
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);

  // Carregar convidados para seleção quando o componente for montado
  useEffect(() => {
    loadGuestsSelect();
  }, []);

  // Filtrar convidados baseado na pesquisa
  const filteredGuests = guestsSelect.filter(guest =>
    guest.name.toLowerCase().includes(guestSearchTerm.toLowerCase()) ||
    guest.cpf.includes(guestSearchTerm) ||
    guest.description.toLowerCase().includes(guestSearchTerm.toLowerCase())
  );

  // Obter nome do convidado selecionado
  const selectedGuestName = guestsSelect.find(guest => guest.id === Number(formData.visitor))?.name || '';

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.visitor) {
      newErrors.visitor = 'Convidado é obrigatório';
    }

    if (!formData.dateBegin) {
      newErrors.dateBegin = 'Data de início é obrigatória';
    }

    if (!formData.dateEnding) {
      newErrors.dateEnding = 'Data de término é obrigatória';
    }

    if (formData.dateBegin && formData.dateEnding) {
      const beginDate = new Date(formData.dateBegin);
      const endingDate = new Date(formData.dateEnding);
      
      if (endingDate < beginDate) {
        newErrors.dateEnding = 'Data de término deve ser posterior à data de início';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Preparar dados para envio
    const dataToSubmit = {
      visitor: Number(formData.visitor),
      dateBegin: formData.dateBegin,
      dateEnding: formData.dateEnding
    };

    const operation = appointment 
      ? updateAppointment(appointment.id, dataToSubmit)
      : addAppointment(dataToSubmit);

    operation
      .then(() => {
        onClose();
      })
      .catch(() => {
        // Erro já tratado no DataContext
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const handleGuestSelect = (guest: any) => {
    setFormData({
      ...formData,
      visitor: guest.id.toString()
    });
    setGuestSearchTerm('');
    setShowGuestDropdown(false);
    
    // Clear error
    if (errors.visitor) {
      setErrors({
        ...errors,
        visitor: undefined
      });
    }
  };

  const clearGuestSelection = () => {
    setFormData({
      ...formData,
      visitor: ''
    });
    setGuestSearchTerm('');
    setShowGuestDropdown(false);
  };

  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-red-100 p-3 rounded-full">
          <Calendar className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Convidado com Pesquisa */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Convidado <span className="text-red-500">*</span>
          </label>
          
          <div className="relative">
            <div
              className={`w-full px-3 py-2 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 cursor-pointer ${
                errors.visitor ? 'border-red-500' : 'border-gray-300'
              } bg-white`}
              onClick={() => setShowGuestDropdown(!showGuestDropdown)}
            >
              <div className="flex items-center justify-between">
                <span className={selectedGuestName ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedGuestName || 'Selecione o convidado'}
                </span>
                <div className="flex items-center space-x-2">
                  {selectedGuestName && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearGuestSelection();
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Dropdown de Convidados */}
            {showGuestDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                <div className="p-3 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Pesquisar por nome, CPF ou descrição..."
                      value={guestSearchTerm}
                      onChange={(e) => setGuestSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {filteredGuests.length > 0 ? (
                    filteredGuests.map(guest => (
                      <button
                        key={guest.id}
                        type="button"
                        onClick={() => handleGuestSelect(guest)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                      >
                        <div>
                          <div className="font-medium">{guest.name}</div>
                          <div className="text-sm text-gray-500">CPF: {guest.cpf} | Residência: {guest.residence}</div>
                          {guest.plate && (
                            <div className="text-xs text-gray-400">Placa: {guest.plate}</div>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500 text-sm">
                      Nenhum convidado encontrado
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {errors.visitor && (
            <p className="text-red-500 text-sm mt-1">{errors.visitor}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Início <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dateBegin"
              value={formData.dateBegin}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.dateBegin ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.dateBegin && (
              <p className="text-red-500 text-sm mt-1">{errors.dateBegin}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Término <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dateEnding"
              value={formData.dateEnding}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.dateEnding ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.dateEnding && (
              <p className="text-red-500 text-sm mt-1">{errors.dateEnding}</p>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Informações do Agendamento:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• O agendamento será válido durante todo o período selecionado</li>
            <li>• O convidado poderá acessar a residência nas datas especificadas</li>
            <li>• Certifique-se de que as datas estão corretas antes de confirmar</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <div className="flex items-center space-x-2">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{loading ? 'Salvando...' : (appointment ? 'Atualizar' : 'Salvar')}</span>
            </div>
          </button>
        </div>
      </form>

      {/* Overlay para fechar dropdown */}
      {showGuestDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowGuestDropdown(false)}
        />
      )}
    </div>
  );
};

export default AppointmentForm;