import { useState } from 'react';
import { useStatesAndCities } from './useStatesAndCities';

interface CepData {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
  location?: {
    type: string;
    coordinates: {
      longitude: string;
      latitude: string;
    };
  };
}

interface AddressData {
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
  estadoId: number;
  cidadeId: number;
  estadoSigla: string;
}

export const useCepLookup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { states, loadCities, findStateByAbbreviation } = useStatesAndCities();

  const lookupCep = async (cep: string): Promise<AddressData | null> => {
    // Limpar CEP (remover caracteres não numéricos)
    const cleanCep = cep.replace(/\D/g, '');
    
    // Validar CEP
    if (cleanCep.length !== 8) {
      setError('CEP deve ter 8 dígitos');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`🔍 Buscando dados do CEP: ${cleanCep}`);
      
      // Fazer requisição para a API do BrasilAPI
      const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const data: CepData = await response.json();
      console.log('✅ Dados do CEP recebidos:', data);

      // Encontrar o estado pelos dados da API
      const state = findStateByAbbreviation(data.state);
      if (!state) {
        throw new Error(`Estado não encontrado: ${data.state}`);
      }

      console.log(`🗺️ Estado encontrado: ${state.name} (${state.sigla})`);

      // Carregar cidades do estado e aguardar o resultado
      const citiesResponse = await new Promise<any[]>((resolve, reject) => {
        loadCities(state.id).then(() => {
          // Aguardar um pouco para garantir que as cidades foram carregadas
          setTimeout(() => {
            // Fazer uma nova requisição para obter as cidades carregadas
            import('../config/api').then(({ apiRequest, API_CONFIG }) => {
              apiRequest(`${API_CONFIG.ENDPOINTS.CITIES}/${state.id}`, {
                method: 'GET'
              }).then(citiesData => {
                console.log('🏙️ Cidades carregadas para busca:', citiesData);
                resolve(Array.isArray(citiesData) ? citiesData : []);
              }).catch(reject);
            }).catch(reject);
          }, 1000);
        }).catch(reject);
      });

      // Encontrar a cidade pelos dados da API
      const city = citiesResponse.find(c => 
        c.name.toLowerCase() === data.city.toLowerCase()
      );
      
      if (!city) {
        console.warn(`⚠️ Cidade não encontrada na API: ${data.city}. Usando dados da BrasilAPI.`);
        
        // Se não encontrar a cidade na nossa API, retornar com ID 0 e nome da BrasilAPI
        return {
          logradouro: data.street,
          bairro: data.neighborhood,
          cidade: data.city,
          estado: state.name,
          estadoId: state.id,
          cidadeId: 0, // ID 0 indica que a cidade não foi encontrada na nossa API
          estadoSigla: state.sigla
        };
      }

      console.log(`🏙️ Cidade encontrada: ${city.name} (ID: ${city.id})`);

      // Retornar dados formatados
      return {
        logradouro: data.street,
        bairro: data.neighborhood,
        cidade: city.name,
        estado: state.name,
        estadoId: state.id,
        cidadeId: city.id,
        estadoSigla: state.sigla
      };

    } catch (err) {
      console.error('❌ Erro ao buscar CEP:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('404')) {
          setError('CEP não encontrado');
        } else if (err.message.includes('Estado não encontrado')) {
          setError('Estado não encontrado no sistema');
        } else {
          setError('Erro ao buscar dados do CEP. Tente novamente.');
        }
      } else {
        setError('Erro desconhecido ao buscar CEP');
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    lookupCep,
    loading,
    error,
    clearError
  };
};