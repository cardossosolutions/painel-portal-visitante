import React, { useState, useEffect } from 'react';
import { Package, Save, Loader2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface DeliveryFormProps {
  delivery?: any;
  onClose: () => void;
}

interface FormErrors {
  ecommerce?: string;
  other_name?: string;
  quantity?: string;
  date_start?: string;
  date_ending?: string;
}

const DeliveryForm: React.FC<DeliveryFormProps> = ({ delivery, onClose }) => {
  const { addDelivery, updateDelivery, ecommerces, loadEcommerces } = useData();
  const [formData, setFormData] = useState({
    ecommerce: delivery?.ecommerce_id ? delivery.ecommerce_id.toString() : (delivery?.ecommerce_id === null ? 'others' : ''),
    other_name: delivery?.ecommerce_id === null ? delivery?.ecommerce || '' : '',
    quantity: delivery?.quantity || 1,
    date_start: delivery?.date_start ? delivery.date_start.split('T')[0] : '',
    date_ending: delivery?.date_ending ? delivery.date_ending.split('T')[0] : ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showOtherName, setShowOtherName] = useState(false);

  // Carregar e-commerces quando o componente for montado
  useEffect(() => {
    loadEcommerces();
  }, [loadEcommerces]);

  // Verificar se "Outros" está selecionado
  useEffect(() => {
    const isOthersSelected = formData.ecommerce === 'others';
    setShowOtherName(isOthersSelected);
    
    // Limpar other_name se não for "Outros"
    if (!isOthersSelected && formData.other_name) {
      setFormData(prev => ({ ...prev, other_name: '' }));
    }
  }, [formData.ecommerce]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.ecommerce) {
      newErrors.ecommerce = 'E-commerce é obrigatório';
    }

    if (formData.ecommerce === 'others' && !formData.other_name) {
      newErrors.other_name = 'Nome do e-commerce é obrigatório quando "Outros" for selecionado';
    }

    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = 'Quantidade deve ser maior que zero';
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
    const dataToSubmit: any = {
      quantity: Number(formData.quantity),
      date_start: formData.date_start,
      date_ending: formData.date_ending
    };

    // Se "Outros" foi selecionado, enviar other_name
    if (formData.ecommerce === 'others') {
      dataToSubmit.ecommerce = null;
      dataToSubmit.other_name = formData.other_name;
    } else {
      dataToSubmit.ecommerce = Number(formData.ecommerce);
      dataToSubmit.other_name = null;
    }

    const operation = delivery 
      ? updateDelivery(delivery.id, dataToSubmit)
      : addDelivery(dataToSubmit);

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
      [name]: name === 'quantity' ? Number(value) : value
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
        <div className="bg-amber-100 p-3 rounded-full">
          <Package className="w-6 h-6 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {delivery ? 'Editar Entrega' : 'Nova Entrega'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-commerce <span className="text-red-500">*</span>
          </label>
          <select
            name="ecommerce"
            value={formData.ecommerce}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.ecommerce ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecione o e-commerce</option>
            {ecommerces.map(ecommerce => (
              <option key={ecommerce.id} value={ecommerce.id}>{ecommerce.name}</option>
            ))}
            <option value="others">Outros</option>
          </select>
          {errors.ecommerce && (
            <p className="text-red-500 text-sm mt-1">{errors.ecommerce}</p>
          )}
        </div>

        {/* Campo "Outros" - aparece apenas quando "Outros" for selecionado */}
        {showOtherName && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do E-commerce <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="other_name"
              value={formData.other_name}
              onChange={handleChange}
              placeholder="Digite o nome do e-commerce"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.other_name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.other_name && (
              <p className="text-red-500 text-sm mt-1">{errors.other_name}</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantidade <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            placeholder="Número de entregas"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.quantity ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.quantity && (
            <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
          )}
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

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-amber-800 mb-2">Informações da Entrega:</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• A entrega será válida durante todo o período selecionado</li>
            <li>• Certifique-se de que as datas estão corretas</li>
            <li>• A quantidade representa o número de entregas esperadas</li>
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
              <span>{loading ? 'Salvando...' : (delivery ? 'Atualizar' : 'Salvar')}</span>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeliveryForm;