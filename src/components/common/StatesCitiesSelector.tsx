import React, { useEffect, useState } from 'react';
import { MapPin, Loader2, Search, X } from 'lucide-react';
import { useStatesAndCities } from '../../hooks/useStatesAndCities';

interface StatesCitiesSelectorProps {
  selectedStateId: number | string;
  selectedCityId: number | string;
  onStateChange: (stateId: number, stateName: string, stateAbbreviation: string) => void;
  onCityChange: (cityId: number, cityName: string) => void;
  stateError?: string;
  cityError?: string;
  disabled?: boolean;
  required?: boolean;
}

const StatesCitiesSelector: React.FC<StatesCitiesSelectorProps> = ({
  selectedStateId,
  selectedCityId,
  onStateChange,
  onCityChange,
  stateError,
  cityError,
  disabled = false,
  required = false
}) => {
  const {
    states,
    cities,
    loadingStates,
    loadingCities,
    statesError,
    citiesError,
    loadCities,
    clearCities
  } = useStatesAndCities();

  const [stateSearchTerm, setStateSearchTerm] = useState('');
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Carregar cidades quando o estado mudar
  useEffect(() => {
    const stateIdNumber = Number(selectedStateId);
    console.log(`🔄 StatesCitiesSelector - Estado mudou para: ${stateIdNumber}`);
    
    if (selectedStateId && stateIdNumber > 0) {
      console.log(`📍 Carregando cidades para o estado ${stateIdNumber}...`);
      loadCities(stateIdNumber);
    } else {
      console.log('🧹 Limpando cidades (estado não selecionado)');
      clearCities();
    }
  }, [selectedStateId]);

  // Log quando as cidades mudarem
  useEffect(() => {
    console.log(`🏙️ StatesCitiesSelector - Cidades atualizadas:`, cities);
    console.log(`🎯 Cidade selecionada ID: ${selectedCityId}`);
  }, [cities, selectedCityId]);

  // Filtrar estados baseado na pesquisa
  const filteredStates = states.filter(state =>
    state.name.toLowerCase().includes(stateSearchTerm.toLowerCase()) ||
    state.sigla.toLowerCase().includes(stateSearchTerm.toLowerCase())
  );

  // Filtrar cidades baseado na pesquisa
  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(citySearchTerm.toLowerCase())
  );

  // Obter nome do estado selecionado
  const selectedState = states.find(state => state.id === Number(selectedStateId));
  const selectedStateName = selectedState?.name || '';
  const selectedStateAbbr = selectedState?.sigla || '';

  // Obter nome da cidade selecionada
  const selectedCity = cities.find(city => city.id === Number(selectedCityId));
  const selectedCityName = selectedCity?.name || '';

  console.log(`🔍 Debug seleção:`, {
    selectedStateId: Number(selectedStateId),
    selectedCityId: Number(selectedCityId),
    selectedStateName,
    selectedCityName,
    citiesCount: cities.length,
    selectedCity
  });

  const handleStateSelect = (state: any) => {
    console.log(`🗺️ Estado selecionado:`, state);
    onStateChange(state.id, state.name, state.sigla);
    onCityChange(0, ''); // Limpar cidade
    setStateSearchTerm('');
    setShowStateDropdown(false);
  };

  const handleCitySelect = (city: any) => {
    console.log(`🏙️ Cidade selecionada:`, city);
    onCityChange(city.id, city.name);
    setCitySearchTerm('');
    setShowCityDropdown(false);
  };

  const clearStateSelection = () => {
    console.log('🧹 Limpando seleção de estado');
    onStateChange(0, '', '');
    onCityChange(0, '');
    setStateSearchTerm('');
    setShowStateDropdown(false);
  };

  const clearCitySelection = () => {
    console.log('🧹 Limpando seleção de cidade');
    onCityChange(0, '');
    setCitySearchTerm('');
    setShowCityDropdown(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Estado */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>Estado {required && <span className="text-red-500">*</span>}</span>
          </div>
        </label>
        
        <div className="relative">
          <div
            className={`w-full px-3 py-2 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 cursor-pointer ${
              stateError || statesError ? 'border-red-500' : 'border-gray-300'
            } ${disabled || loadingStates ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            onClick={() => !disabled && !loadingStates && setShowStateDropdown(!showStateDropdown)}
          >
            <div className="flex items-center justify-between">
              <span className={selectedStateName ? 'text-gray-900' : 'text-gray-500'}>
                {loadingStates 
                  ? 'Carregando estados...' 
                  : selectedStateName 
                    ? `${selectedStateAbbr} - ${selectedStateName}`
                    : 'Selecione o estado'
                }
              </span>
              <div className="flex items-center space-x-2">
                {selectedStateName && !disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearStateSelection();
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {loadingStates ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                ) : (
                  <Search className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Dropdown de Estados */}
          {showStateDropdown && !disabled && !loadingStates && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Pesquisar estado..."
                    value={stateSearchTerm}
                    onChange={(e) => setStateSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {filteredStates.length > 0 ? (
                  filteredStates.map(state => (
                    <button
                      key={state.id}
                      type="button"
                      onClick={() => handleStateSelect(state)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                    >
                      <span className="font-medium">{state.sigla}</span> - {state.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-sm">
                    Nenhum estado encontrado
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {(stateError || statesError) && (
          <p className="text-red-500 text-sm mt-1">{stateError || statesError}</p>
        )}
        
        {statesError && (
          <p className="text-yellow-600 text-xs mt-1">
            ⚠️ Usando lista padrão de estados brasileiros
          </p>
        )}
      </div>

      {/* Cidade */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>Cidade {required && <span className="text-red-500">*</span>}</span>
          </div>
        </label>
        
        <div className="relative">
          <div
            className={`w-full px-3 py-2 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 cursor-pointer ${
              cityError || citiesError ? 'border-red-500' : 'border-gray-300'
            } ${disabled || loadingCities || !selectedStateId || Number(selectedStateId) === 0 ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            onClick={() => {
              if (!disabled && !loadingCities && selectedStateId && Number(selectedStateId) > 0) {
                setShowCityDropdown(!showCityDropdown);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <span className={selectedCityName ? 'text-gray-900' : 'text-gray-500'}>
                {!selectedStateId || Number(selectedStateId) === 0
                  ? 'Selecione um estado primeiro'
                  : loadingCities
                  ? 'Carregando cidades...'
                  : cities.length === 0
                  ? 'Nenhuma cidade encontrada'
                  : selectedCityName || 'Selecione a cidade'
                }
              </span>
              <div className="flex items-center space-x-2">
                {selectedCityName && !disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearCitySelection();
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {loadingCities ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                ) : selectedStateId && Number(selectedStateId) > 0 ? (
                  <Search className="w-4 h-4 text-gray-400" />
                ) : null}
              </div>
            </div>
          </div>

          {/* Dropdown de Cidades */}
          {showCityDropdown && !disabled && !loadingCities && selectedStateId && Number(selectedStateId) > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Pesquisar cidade..."
                    value={citySearchTerm}
                    onChange={(e) => setCitySearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {filteredCities.length > 0 ? (
                  filteredCities.map(city => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleCitySelect(city)}
                      className={`w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${
                        Number(selectedCityId) === city.id ? 'bg-blue-100 font-medium' : ''
                      }`}
                    >
                      {city.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-sm">
                    Nenhuma cidade encontrada
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {(cityError || citiesError) && (
          <p className="text-red-500 text-sm mt-1">{cityError || citiesError}</p>
        )}
        
        {!selectedStateId && (
          <p className="text-gray-500 text-xs mt-1">Selecione um estado para ver as cidades</p>
        )}
        
        {selectedStateId && Number(selectedStateId) > 0 && cities.length === 0 && !loadingCities && !citiesError && (
          <p className="text-yellow-600 text-xs mt-1">
            ⚠️ Nenhuma cidade encontrada para este estado
          </p>
        )}
      </div>

      {/* Overlay para fechar dropdowns */}
      {(showStateDropdown || showCityDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowStateDropdown(false);
            setShowCityDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default StatesCitiesSelector;