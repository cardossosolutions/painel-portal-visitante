import React, { useState } from 'react';
import { Users, Save, Loader2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import PasswordDisplayModal from '../common/PasswordDisplayModal';

interface EmployeeFormProps {
  employee?: any;
  onClose: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  role?: string;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onClose }) => {
  const { addEmployee, updateEmployee } = useData();
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    role: employee?.permission === 'Administrador' ? 2 : employee?.permission === 'Funcionário' ? 3 : 3,
    status: employee?.status === 'active' ? 1 : (employee?.status === 'inactive' || employee?.status === 'no-active') ? 2 : 1
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState<{ message: string; password: string } | null>(null);

  const roleOptions = [
    { value: 2, label: 'Administrador' },
    { value: 3, label: 'Funcionário' }
  ];

  const statusOptions = [
    { value: 1, label: 'Ativo' },
    { value: 2, label: 'Inativo' }
  ];

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

    if (!formData.role) {
      newErrors.role = 'Função é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (employee) {
        // Atualizar funcionário existente
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status
        };
        
        await updateEmployee(employee.id, updateData);
        onClose();
      } else {
        // Adicionar novo funcionário
        const result = await addEmployee({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status
        });
        
        // Mostrar a senha gerada
        setPasswordData(result);
      }
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: (name === 'role' || name === 'status') ? Number(value) : value
    });

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const handlePasswordModalClose = () => {
    setPasswordData(null);
    onClose();
  };

  return (
    <>
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {employee ? 'Editar Funcionário' : 'Novo Funcionário'}
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
              placeholder="Nome completo do funcionário"
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
              placeholder="email@empresa.com"
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
              Função <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.role ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecione a função</option>
              {roleOptions.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role}</p>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          {!employee && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Informação importante:</h4>
              <p className="text-sm text-blue-700">
                Uma senha será gerada automaticamente para o novo funcionário. 
                Certifique-se de anotar a senha que será exibida após o cadastro.
              </p>
            </div>
          )}

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
                <span>{loading ? 'Salvando...' : (employee ? 'Atualizar' : 'Salvar')}</span>
              </div>
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Exibição de Senha */}
      <PasswordDisplayModal
        isOpen={!!passwordData}
        onClose={handlePasswordModalClose}
        passwordData={passwordData}
      />
    </>
  );
};

export default EmployeeForm;