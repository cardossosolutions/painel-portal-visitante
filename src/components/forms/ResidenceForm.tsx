import React, { useState } from 'react';
import { Home, Search, Loader2, Save } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { phoneMasks } from '../../utils/masks';
import StatesCitiesSelector from '../common/StatesCitiesSelector';
import { useCepLookup } from '../../hooks/useCepLookup';

interface ResidenceFormProps {
  residence?: any;
  onClose: () => void;
}

interface FormErrors {
  nome?: string;
  status?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

const ResidenceForm: React.FC<ResidenceFormProps> = ({ residence, onClose }) => {
  const { addResidence, updateResidence } = useData();
  const { lookupCep, loading: cepLoading, error: cepError, clearError: clearCepError } = useCepLookup();
  
  // Inicializar com valores corretos, garantindo que IDs sejam números
  const [formData, setFormData] = useState({
    nome: residence?.nome || '',
    status: residence?.status !== undefined ? residence.status : 'Ativo',
    cep: residence?.cep || '',
    logradouro: residence?.logradouro || residence?.rua || '',
    numero: residence?.numero || '',
    complemento: residence?.complemento || '',
    bairro: residence?.bairro || '',
    cidadeId: residence?.cidadeId || residence?.city_id || residence?.city ? Number(residence.cidadeId || residence.city_id || residence.city) : 0,
    cidadeNome: residence?.cidadeNome || residence?.cidade || residence?.city_name || '',
    estadoId: residence?.estadoId || residence?.state_id || residence?.state ? Number(residence.estadoId || residence.state_id || residence.state) : 0,
    estadoNome: residence?.estadoNome || residence?.estado || residence?.state_name || residence?.name_state || '',
    estadoSigla: residence?.estadoSigla || residence?.state || '',
    telefone: residence?.telefone || residence?.phone || '',
    email: residence?.email || ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  console.log('📝 ResidenceForm - Dados iniciais do formulário:', formData);
  console.log('📝 ResidenceForm - Residence prop recebida:', residence);

  const statusOptions = ['Ativo', 'Inativo'];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nome) {
      newErrors.nome = 'Nome da residência é obrigatório';
    }

    if (!formData.status) {
      newErrors.status = 'Status é obrigatório';
    }

    if (!formData.cep) {
      newErrors.cep = 'CEP é obrigatório';
    }

    if (!formData.logradouro) {
      newErrors.logradouro = 'Logradouro é obrigatório';
    }

    if (!formData.numero) {
      newErrors.numero = 'Número é obrigatório';
    }

    if (!formData.bairro) {
      newErrors.bairro = 'Bairro é obrigatório';
    }

    if (!formData.cidadeId || Number(formData.cidadeId) === 0) {
      newErrors.cidade = 'Cidade é obrigatória';
    }

    if (!formData.estadoId || Number(formData.estadoId) === 0) {
      newErrors.estado = 'Estado é obrigatório';
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
      nameResidence: formData.nome,
      active: formData.status === 'Ativo',
      cep: formData.cep.replace(/\D/g, ''),
      street: formData.logradouro,
      number: formData.numero,
      complement: formData.complemento,
      neighborhood: formData.bairro,
      state: Number(formData.estadoId),
      city: Number(formData.cidadeId)
    };

    console.log('📤 Enviando dados da residência:', dataToSubmit);

    const operation = residence 
      ? updateResidence(residence.id, dataToSubmit)
      : addResidence(dataToSubmit);

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
    let maskedValue = value;

    // Aplicar máscaras específicas
    switch (name) {
      case 'cep':
        maskedValue = value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2');
        break;
      case 'telefone':
        maskedValue = phoneMasks.auto(value);
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

    // Limpar erro de CEP quando usuário digitar
    if (name === 'cep' && cepError) {
      clearCepError();
    }
  };

  const handleCepLookup = async () => {
    const cleanCep = formData.cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      setErrors({
        ...errors,
        cep: 'CEP deve ter 8 dígitos para buscar automaticamente'
      });
      return;
    }

    const addressData = await lookupCep(cleanCep);
    
    if (addressData) {
      console.log('📍 Preenchendo dados do endereço:', addressData);
      
      // Aguardar um pouco para garantir que o estado seja atualizado primeiro
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          logradouro: addressData.logradouro,
          bairro: addressData.bairro,
          cidadeId: addressData.cidadeId,
          cidadeNome: addressData.cidade,
          estadoId: addressData.estadoId,
          estadoNome: addressData.estado,
          estadoSigla: addressData.estadoSigla
        }));

        // Limpar erros relacionados ao endereço
        setErrors(prev => ({
          ...prev,
          cep: undefined,
          logradouro: undefined,
          bairro: undefined,
          cidade: undefined,
          estado: undefined
        }));

        // Mostrar aviso se a cidade não foi encontrada na nossa API
        if (addressData.cidadeId === 0) {
          console.warn('⚠️ Cidade não encontrada na API interna, usando dados da BrasilAPI');
        }
      }, 100);
    }
  };

  const handleStateChange = (stateId: number, stateName: string, stateAbbreviation: string) => {
    console.log(`🗺️ Estado alterado - ID: ${stateId}, Nome: ${stateName}, Sigla: ${stateAbbreviation}`);
    
    setFormData(prev => ({
      ...prev,
      estadoId: stateId,
      estadoNome: stateName,
      estadoSigla: stateAbbreviation,
      cidadeId: 0, // Limpar cidade quando mudar estado
      cidadeNome: ''
    }));

    // Limpar erro de estado
    if (errors.estado) {
      setErrors({
        ...errors,
        estado: undefined
      });
    }
  };

  const handleCityChange = (cityId: number, cityName: string) => {
    console.log(`🏙️ Cidade alterada - ID: ${cityId}, Nome: ${cityName}`);
    
    setFormData(prev => ({
      ...prev,
      cidadeId: cityId,
      cidadeNome: cityName
    }));

    // Limpar erro de cidade
    if (errors.cidade) {
      setErrors({
        ...errors,
        cidade: undefined
      });
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-green-100 p-3 rounded-full">
          <Home className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {residence ? 'Editar Residência' : 'Nova Residência'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Residência <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Ex: Apartamento 101, Casa A, etc."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.nome ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.nome && (
              <p className="text-red-500 text-sm mt-1">{errors.nome}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.status ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            {errors.status && (
              <p className="text-red-500 text-sm mt-1">{errors.status}</p>
            )}
          </div>
        </div>

        {/* CEP com busca automática */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CEP <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              name="cep"
              value={formData.cep}
              onChange={handleChange}
              placeholder="12345-678"
              maxLength={9}
              className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.cep || cepError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={handleCepLookup}
              disabled={cepLoading || formData.cep.replace(/\D/g, '').length !== 8}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
              title="Buscar endereço pelo CEP"
            >
              {cepLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {cepLoading ? 'Buscando...' : 'Buscar'}
              </span>
            </button>
          </div>
          {(errors.cep || cepError) && (
            <p className="text-red-500 text-sm mt-1">{errors.cep || cepError}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Digite o CEP e clique em "Buscar" para preencher automaticamente o endereço
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rua <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="logradouro"
              value={formData.logradouro}
              onChange={handleChange}
              placeholder="Rua, Avenida, etc."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.logradouro ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.logradouro && (
              <p className="text-red-500 text-sm mt-1">{errors.logradouro}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              placeholder="123"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.numero ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.numero && (
              <p className="text-red-500 text-sm mt-1">{errors.numero}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Complemento
            </label>
            <input
              type="text"
              name="complemento"
              value={formData.complemento}
              onChange={handleChange}
              placeholder="Apartamento, Bloco, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bairro <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="bairro"
              value={formData.bairro}
              onChange={handleChange}
              placeholder="Nome do bairro"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.bairro ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.bairro && (
              <p className="text-red-500 text-sm mt-1">{errors.bairro}</p>
            )}
          </div>
        </div>

        {/* Seletor de Estado e Cidade */}
        <StatesCitiesSelector
          selectedStateId={formData.estadoId}
          selectedCityId={formData.cidadeId}
          onStateChange={handleStateChange}
          onCityChange={handleCityChange}
          stateError={errors.estado}
          cityError={errors.cidade}
          required={true}
        />


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
              <span>{loading ? 'Salvando...' : (residence ? 'Atualizar' : 'Salvar')}</span>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResidenceForm;