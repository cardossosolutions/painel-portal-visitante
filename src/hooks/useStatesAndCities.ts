import { useState, useEffect } from 'react';
import { apiRequest, API_CONFIG } from '../config/api';

interface State {
  id: number;
  sigla: string;
  name: string;
}

interface City {
  id: number;
  name: string;
  state_id: number;
}

export const useStatesAndCities = () => {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [statesError, setStatesError] = useState<string | null>(null);
  const [citiesError, setCitiesError] = useState<string | null>(null);

  // Estados brasileiros como fallback
  const fallbackStates: State[] = [
    { id: 1, sigla: 'AC', name: 'Acre' },
    { id: 2, sigla: 'AL', name: 'Alagoas' },
    { id: 3, sigla: 'AP', name: 'Amapá' },
    { id: 4, sigla: 'AM', name: 'Amazonas' },
    { id: 5, sigla: 'BA', name: 'Bahia' },
    { id: 6, sigla: 'CE', name: 'Ceará' },
    { id: 7, sigla: 'DF', name: 'Distrito Federal' },
    { id: 8, sigla: 'ES', name: 'Espírito Santo' },
    { id: 9, sigla: 'GO', name: 'Goiás' },
    { id: 10, sigla: 'MA', name: 'Maranhão' },
    { id: 11, sigla: 'MT', name: 'Mato Grosso' },
    { id: 12, sigla: 'MS', name: 'Mato Grosso do Sul' },
    { id: 13, sigla: 'MG', name: 'Minas Gerais' },
    { id: 14, sigla: 'PA', name: 'Pará' },
    { id: 15, sigla: 'PB', name: 'Paraíba' },
    { id: 16, sigla: 'PR', name: 'Paraná' },
    { id: 17, sigla: 'PE', name: 'Pernambuco' },
    { id: 18, sigla: 'PI', name: 'Piauí' },
    { id: 19, sigla: 'RJ', name: 'Rio de Janeiro' },
    { id: 20, sigla: 'RN', name: 'Rio Grande do Norte' },
    { id: 21, sigla: 'RS', name: 'Rio Grande do Sul' },
    { id: 22, sigla: 'RO', name: 'Rondônia' },
    { id: 23, sigla: 'RR', name: 'Roraima' },
    { id: 24, sigla: 'SC', name: 'Santa Catarina' },
    { id: 25, sigla: 'SP', name: 'São Paulo' },
    { id: 26, sigla: 'SE', name: 'Sergipe' },
    { id: 27, sigla: 'TO', name: 'Tocantins' }
  ];

  // Carregar estados
  const loadStates = async () => {
    setLoadingStates(true);
    setStatesError(null);

    try {
      console.log('🗺️ Carregando estados...');
      const response = await apiRequest(API_CONFIG.ENDPOINTS.STATES, {
        method: 'GET'
      });

      console.log('✅ Estados carregados:', response);

      if (response && Array.isArray(response)) {
        setStates(response);
      } else {
        console.warn('⚠️ Resposta de estados inválida, usando fallback');
        setStates(fallbackStates);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar estados:', error);
      setStatesError('Erro ao carregar estados. Usando lista padrão.');
      setStates(fallbackStates);
    } finally {
      setLoadingStates(false);
    }
  };

  // Carregar cidades por estado
  const loadCities = async (stateId: number) => {
    if (!stateId) {
      setCities([]);
      return;
    }

    setLoadingCities(true);
    setCitiesError(null);

    try {
      console.log(`🏙️ Carregando cidades do estado ${stateId}...`);
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.CITIES}/${stateId}`, {
        method: 'GET'
      });

      console.log('✅ Cidades carregadas:', response);

      if (response && Array.isArray(response)) {
        setCities(response);
      } else {
        console.warn('⚠️ Resposta de cidades inválida');
        setCities([]);
        setCitiesError('Nenhuma cidade encontrada para este estado.');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar cidades:', error);
      setCitiesError('Erro ao carregar cidades. Tente novamente.');
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  // Carregar estados quando o hook for inicializado
  useEffect(() => {
    loadStates();
  }, []);

  // Função para limpar cidades
  const clearCities = () => {
    setCities([]);
    setCitiesError(null);
  };

  // Função para encontrar estado por sigla
  const findStateByAbbreviation = (abbreviation: string): State | undefined => {
    return states.find(state => state.sigla === abbreviation.toUpperCase());
  };

  // Função para encontrar cidade por nome e estado
  const findCityByName = (cityName: string, stateId: number): City | undefined => {
    return cities.find(city => 
      city.name.toLowerCase() === cityName.toLowerCase() && 
      city.state_id === stateId
    );
  };

  return {
    states,
    cities,
    loadingStates,
    loadingCities,
    statesError,
    citiesError,
    loadStates,
    loadCities,
    clearCities,
    findStateByAbbreviation,
    findCityByName
  };
};