import React, { useState } from 'react';
import { User, Save, Loader2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { phoneMasks } from '../../utils/masks';

interface ResidentFormProps {
  resident?: any;
  residenceId: string;
  onClose: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  mobile?: string;
}

const ResidentForm: React.FC<ResidentFormProps> = ({ resident, residenceId, onClose }) => {
  const { addResident, updateResident } = useData();
  const [formData, setFormData] = useState({
    name: resident?.name || '',
    email: resident?.email || '',
    mobile: resident?.mobile || ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido';
    }

    if (!formData.mobile) {
      newErrors.mobile = 'Celular é obrigatório';
    } else if (!phoneMasks.isValid(formData.mobile)) {
      newErrors.mobile = 'Celular deve ter um formato válido';
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
      residence_id: residenceId,
      name: formData.name,
      email: formData.email,
      mobile: phoneMasks.unmask(formData.mobile)
    };

    const operation = resident 
      ? updateResident(resident.id, dataToSubmit)
      : addResident(dataToSubmit);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;

    // Aplicar máscara para celular
    if (name === 'mobile') {
      maskedValue = phoneMasks.mobile(value);
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
        <div className="bg-purple-100 p-3 rounded-full">
          <User className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {resident ? 'Editar Morador' : 'Novo Morador'}
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
            placeholder="Nome completo do morador"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@exemplo.com"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

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
          <p className="text-xs text-gray-500 mt-1">Número do celular com DDD</p>
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
              <span>{loading ? 'Salvando...' : (resident ? 'Atualizar' : 'Salvar')}</span>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResidentForm;