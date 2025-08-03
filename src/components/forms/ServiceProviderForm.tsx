import React, { useState } from 'react';
import { Briefcase, Save, Loader2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { otherMasks, phoneMasks } from '../../utils/masks';

interface ServiceProviderFormProps {
  provider?: any;
  onClose: () => void;
}

interface FormErrors {
  name?: string;
  rg?: string;
  cpf?: string;
  mobile?: string;
  date_start?: string;
  date_ending?: string;
}

const ServiceProviderForm: React.FC<ServiceProviderFormProps> = ({ provider, onClose }) => {
  const { addServiceProvider, updateServiceProvider } = useData();
  const [formData, setFormData] = useState({
    name: provider?.name || '',
    rg: provider?.rg || '',
    cpf: provider?.cpf || '',
    mobile: provider?.mobile || '',
    plate: provider?.plate || '',
    observation: provider?.observation || '',
    date_start: provider?.date_start || '',
    date_ending: provider?.date_ending || ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.rg) {
      newErrors.rg = 'RG é obrigatório';
    }

    if (!formData.cpf) {
      newErrors.cpf = 'CPF é obrigatório';
    }

    if (!formData.mobile) {
      newErrors.mobile = 'Celular é obrigatório';
    } else if (!phoneMasks.isValid(formData.mobile)) {
      newErrors.mobile = 'Celular deve ter um formato válido';
    }

    if (!formData.date_start) {
      newErrors.date_start = 'Data de início é obrigatória';
    }

    if (!formData.date_ending) {
      newErrors.date_ending = 'Data de término é obrigatória';
    }

    if (formData.date_start && formData.date_ending) {
      const startDate = new Date(formData.date_start);
      const endDate = new Date(formData.date_ending);
      
      if (endDate < startDate) {
        newErrors.date_ending = 'Data de término deve ser posterior à data de início';
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
      name: formData.name,
      rg: formData.rg,
      cpf: formData.cpf,
      mobile: phoneMasks.unmask(formData.mobile),
      plate: formData.plate.toUpperCase() || null,
      observation: formData.observation,
      date_start: formData.date_start,
      date_ending: formData.date_ending
    };

    const operation = provider 
      ? updateServiceProvider(provider.id, dataToSubmit)
      : addServiceProvider(dataToSubmit);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;

    // Aplicar máscaras específicas
    switch (name) {
      case 'cpf':
        maskedValue = otherMasks.cpf(value);
        break;
      case 'mobile':
        maskedValue = phoneMasks.mobile(value);
        break;
      case 'plate':
        // Máscara para placa de veículo (ABC-1234 ou ABC1D23)
        maskedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (maskedValue.length > 3 && maskedValue.length <= 7) {
          // Formato antigo: ABC-1234
          if (/^[A-Z]{3}[0-9]/.test(maskedValue)) {
            maskedValue = `${maskedValue.slice(0, 3)}-${maskedValue.slice(3)}`;
          }
        }
        break;
      default:
        maskedValue = value;
    }

    setFormData({
      ...formData,
      [name]: maskedValue
    });

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-indigo-100 p-3 rounded-full">
          <Briefcase className="w-6 h-6 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {provider ? 'Editar Prestador de Serviços' : 'Novo Prestador de Serviços'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nome completo do prestador de serviços"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RG <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="rg"
              value={formData.rg}
              onChange={handleChange}
              placeholder="12.345.678-9"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.rg ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.rg && (
              <p className="text-red-500 text-sm mt-1">{errors.rg}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="123.456.789-00"
              maxLength={14}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.cpf ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.cpf && (
              <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Celular <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
              maxLength={15}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.mobile ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.mobile && (
              <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placa do Veículo
            </label>
            <input
              type="text"
              name="plate"
              value={formData.plate}
              onChange={handleChange}
              placeholder="ABC-1234 ou ABC1D23"
              maxLength={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Formato antigo (ABC-1234) ou Mercosul (ABC1D23)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Início <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date_start"
              value={formData.date_start}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.date_start ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date_start && (
              <p className="text-red-500 text-sm mt-1">{errors.date_start}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Término <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date_ending"
              value={formData.date_ending}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.date_ending ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date_ending && (
              <p className="text-red-500 text-sm mt-1">{errors.date_ending}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            name="observation"
            value={formData.observation}
            onChange={handleChange}
            rows={3}
            placeholder="Informações adicionais sobre o serviço..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Informações do Prestador de Serviços:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• O prestador terá acesso durante o período especificado</li>
            <li>• Certifique-se de que as datas estão corretas</li>
            <li>• Use as observações para detalhar o tipo de serviço</li>
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
              <span>{loading ? 'Salvando...' : (provider ? 'Atualizar' : 'Salvar')}</span>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceProviderForm;