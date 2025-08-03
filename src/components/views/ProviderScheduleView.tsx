import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Briefcase, Clock, User, Phone, Car, MapPin, X, Search, Eye, Loader2, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { apiRequest, API_CONFIG } from '../../config/api';

// Interface para os dados do prestador baseada na API
interface ProviderDetails {
  id: number;
  name: string;
  residence: string;
  residence: string;
  mobile: string;
  rg: string;
  cpf: string;
  plate: string | null;
  date_start: string;
  date_ending: string;
  observation: string;
}

const LicensePlate: React.FC<{ plate: string }> = ({ plate }) => {
  const formatPlate = (plate: string) => {
    // Remove any non-alphanumeric characters and convert to uppercase
    const cleanPlate = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    // Format for Mercosul pattern: ABC1D23
    if (cleanPlate.length === 7) {
      return `${cleanPlate.slice(0, 3)}${cleanPlate.slice(3, 4)}${cleanPlate.slice(4, 5)}${cleanPlate.slice(5, 7)}`;
    }
    return cleanPlate;
  };

  const formattedPlate = formatPlate(plate);

  return (
    <div className="relative bg-white rounded-lg shadow-lg overflow-hidden" style={{ width: '280px', height: '140px' }}>
      {/* Header azul com BRASIL */}
      <div className="bg-blue-600 text-white text-center py-2">
        <div className="text-lg font-bold tracking-wider">BRASIL</div>
      </div>

      {/* Área principal da placa */}
      <div className="bg-white flex-1 flex flex-col justify-center items-center py-4">
        {/* Placa */}
        <div className="text-4xl font-bold text-gray-900 tracking-wider font-mono mb-2">
          {formattedPlate}
        </div>
        
        {/* Footer com BR e MERCOSUL */}
        <div className="flex items-center justify-between w-full px-6">
          <div className="text-lg font-bold text-gray-700">BR</div>
          <div className="text-sm text-gray-600 font-medium">MERCOSUL</div>
          <div className="w-6 h-4 bg-blue-600 rounded"></div>
        </div>
      </div>

      {/* Borda preta */}
      <div className="absolute inset-0 border-4 border-black rounded-lg pointer-events-none"></div>
    </div>
  );
};

const ProviderCard: React.FC<{ provider: ProviderDetails; onClick: () => void }> = ({ provider, onClick }) => {
  const formatDateRange = (dateStart: string, dateEnding: string) => {
    const start = new Date(dateStart).toLocaleDateString('pt-BR');
    const end = new Date(dateEnding).toLocaleDateString('pt-BR');
    
    if (start === end) {
      return start;
    }
    return `${start} até ${end}`;
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-indigo-300 transform hover:scale-[1.02] h-full"
      onClick={onClick}
    >
      <div className="p-6 h-full flex flex-col">
        {/* Badge - Topo */}
        <div className="flex justify-end mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
            <Briefcase className="w-4 h-4 mr-1" />
            Prestador
          </span>
        </div>

        {/* Header - Ícone, Nome e Empresa */}
        <div className="flex items-start space-x-3 mb-4">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-full shadow-lg flex-shrink-0">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight break-words">{provider.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{provider.residence}</p>
          </div>
        </div>

        {/* Content - Flex grow para ocupar espaço disponível */}
        <div className="space-y-3 flex-grow">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="bg-green-100 p-1.5 rounded-full flex-shrink-0">
              <MapPin className="w-4 h-4 text-green-600" />
            </div>
            <span className="font-medium">Residência: {provider.residence}</span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="bg-blue-100 p-1.5 rounded-full flex-shrink-0">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <span>CPF: {provider.cpf}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="bg-green-100 p-1.5 rounded-full flex-shrink-0">
              <Phone className="w-4 h-4 text-green-600" />
            </div>
            <span>{provider.mobile}</span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="bg-orange-100 p-1.5 rounded-full flex-shrink-0">
              <Calendar className="w-4 h-4 text-orange-600" />
            </div>
            <span>
              {formatDateRange(provider.date_start, provider.date_ending)}
            </span>
          </div>

          {provider.plate && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="bg-purple-100 p-1.5 rounded-full flex-shrink-0">
                <Car className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-mono font-medium">{provider.plate}</span>
            </div>
          )}

          {provider.observation && (
            <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
              <p className="text-sm text-gray-700 line-clamp-2">{provider.observation}</p>
            </div>
          )}
        </div>

        {/* Footer - Sempre no final */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-indigo-600 flex-shrink-0">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Ver detalhes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProviderDetailsModal: React.FC<{ 
  provider: ProviderDetails | null; 
  onClose: () => void 
}> = ({ provider, onClose }) => {
  if (!provider) return null;

  const formatDateRange = (dateStart: string, dateEnding: string) => {
    const start = new Date(dateStart).toLocaleDateString('pt-BR');
    const end = new Date(dateEnding).toLocaleDateString('pt-BR');
    
    if (start === end) {
      return start;
    }
    return `${start} até ${end}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end items-center p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Provider Information */}
            <div className="space-y-6">
              {/* Provider Information */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Informações do Prestador</h2>
                
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200 space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 rounded-full shadow-lg">
                      <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{provider.name}</h3>
                      <p className="text-gray-600 mt-1">{provider.residence}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <User className="w-5 h-5 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-700">CPF:</span>
                        <span className="text-gray-900 font-mono ml-2">{provider.cpf}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-700">RG:</span>
                        <span className="text-gray-900 font-mono ml-2">{provider.rg}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-700">Celular:</span>
                        <span className="text-gray-900 ml-2">{provider.mobile}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Residence Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Local de Trabalho</h3>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-6 h-6 text-green-600" />
                    <div>
                      <span className="font-semibold text-lg text-gray-900">{provider.residence}</span>
                      <p className="text-sm text-green-700">Local autorizado para prestação de serviços</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Service Details and Vehicle */}
            <div className="space-y-6">
              {/* Service Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes do Serviço</h3>
                <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <div>
                      <span className="font-medium text-gray-700">Período Autorizado:</span>
                      <p className="text-gray-900">Início: {new Date(provider.date_start).toLocaleDateString('pt-BR')}</p>
                      <p className="text-gray-900">Fim: {new Date(provider.date_ending).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>

                  {provider.observation && (
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <span className="font-medium text-gray-700">Observações:</span>
                      <p className="text-gray-900 mt-2">{provider.observation}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Vehicle Information */}
              {provider.plate && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Veículo</h3>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-center justify-center mb-4">
                      <LicensePlate plate={provider.plate} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Placa do veículo autorizada</p>
                      <p className="text-xs text-gray-500 mt-1">Padrão Mercosul</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4">Ações Rápidas</h4>
                <div className="space-y-3">
                  <button className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 font-medium shadow-md">
                    Confirmar Entrada
                  </button>
                  <button className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-medium shadow-md">
                    Registrar Saída
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProviderScheduleView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<ProviderDetails | null>(null);
  
  // Estados para scroll infinito
  const [providers, setProviders] = useState<ProviderDetails[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Ref para o elemento sentinela do scroll infinito
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Ref para controlar requisições em andamento
  const loadingRef = useRef(false);
  const lastSearchRef = useRef('');

  // Função para carregar dados da API
  const loadProviderData = useCallback(async (page: number, search?: string, reset: boolean = false) => {
    // Evitar múltiplas requisições simultâneas
    if (loadingRef.current) {
      console.log('⏳ Requisição já em andamento, ignorando...');
      return;
    }

    try {
      loadingRef.current = true;
      console.log(`🔄 Carregando prestadores - Página: ${page}, Busca: ${search || 'N/A'}, Reset: ${reset}`);
      
      if (page === 1 && !reset) {
        setInitialLoading(true);
      } else if (page > 1) {
        setLoadingMore(true);
      }
      
      // Construir URL com parâmetros de paginação e busca
      let url = `${API_CONFIG.ENDPOINTS.PROVIDERS_SCHEDULE}?page=${page}`;
      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      
      const response = await apiRequest(url, {
        method: 'GET'
      });
      
      console.log('✅ Resposta do cronograma de prestadores:', response);
      
      if (response && response.data && Array.isArray(response.data)) {
        const newProviders = response.data;
        
        if (reset || page === 1) {
          // Primeira página ou reset - substituir todos os dados
          setProviders(newProviders);
        } else {
          // Páginas subsequentes - adicionar aos dados existentes, evitando duplicatas
          setProviders(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNewProviders = newProviders.filter(p => !existingIds.has(p.id));
            return [...prev, ...uniqueNewProviders];
          });
        }
        
        setCurrentPage(response.current_page);
        setHasNextPage(response.current_page < response.last_page);
        setTotalCount(response.total);
        
        console.log(`💾 Prestadores carregados - Página: ${response.current_page}/${response.last_page}, Total: ${response.total}`);
      } else {
        console.warn('⚠️ Resposta do cronograma de prestadores inválida:', response);
        if (reset || page === 1) {
          setProviders([]);
          setTotalCount(0);
          setHasNextPage(false);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar cronograma de prestadores:', error);
      if (reset || page === 1) {
        setProviders([]);
        setTotalCount(0);
        setHasNextPage(false);
      }
    } finally {
      loadingRef.current = false;
      setInitialLoading(false);
      setLoadingMore(false);
      setLoading(false);
    }
  }, []);

  // Função para carregar próxima página
  const loadNextPage = useCallback(() => {
    if (!loadingMore && hasNextPage && !loadingRef.current) {
      console.log(`📄 Carregando próxima página: ${currentPage + 1}`);
      loadProviderData(currentPage + 1, searchTerm);
    }
  }, [loadProviderData, currentPage, searchTerm, loadingMore, hasNextPage]);

  // Configurar Intersection Observer para scroll infinito
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !loadingMore && !initialLoading && !loadingRef.current) {
          console.log('👁️ Sentinela visível - carregando próxima página');
          loadNextPage();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, loadingMore, initialLoading, loadNextPage]);

  // Carregar dados iniciais apenas uma vez
  useEffect(() => {
    console.log('👁️ ProviderScheduleView montado - carregando cronograma inicial...');
    loadProviderData(1, '', true);
  }, []); // Dependências vazias para executar apenas uma vez

  // Debounce para busca
  useEffect(() => {
    // Evitar busca na primeira renderização
    if (lastSearchRef.current === searchTerm) {
      return;
    }

    const timeoutId = setTimeout(() => {
      console.log(`🔍 Executando busca: "${searchTerm}"`);
      lastSearchRef.current = searchTerm;
      setLoading(true);
      loadProviderData(1, searchTerm, true);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadProviderData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prestadores de Serviços Ativos</h1>
          <p className="text-gray-600 mt-1">
            Visualize e gerencie todos os prestadores autorizados
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar prestador, CPF ou observação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[300px]"
            />
          </div>
          
          {loading && (
            <div className="flex items-center space-x-2 text-indigo-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              <span className="text-sm">Buscando...</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium opacity-90">Total de Prestadores</h3>
            <p className="text-3xl font-bold">{totalCount}</p>
            <p className="text-sm opacity-75 mt-1">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-full">
            <Briefcase className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Providers Grid */}
      {initialLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center space-x-3 text-indigo-600">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-lg font-medium">Carregando prestadores...</span>
          </div>
        </div>
      ) : providers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onClick={() => setSelectedProvider(provider)}
              />
            ))}
          </div>
          
          {/* Sentinela para scroll infinito */}
          <div ref={sentinelRef} className="h-20 flex items-center justify-center">
            {loadingMore && (
              <div className="flex items-center space-x-3 text-indigo-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm font-medium">Carregando mais prestadores...</span>
              </div>
            )}
            {!hasNextPage && providers.length > 0 && (
              <div className="text-center text-gray-500">
                <p className="text-sm">✨ Todos os prestadores foram carregados</p>
                <p className="text-xs mt-1">{totalCount} {totalCount === 1 ? 'prestador' : 'prestadores'} no total</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <Briefcase className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum prestador encontrado</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchTerm 
              ? 'Não há prestadores para a busca realizada. Tente outros termos.'
              : 'Não há prestadores cadastrados no momento.'}
          </p>
        </div>
      )}

      {/* Provider Details Modal */}
      <ProviderDetailsModal
        provider={selectedProvider}
        onClose={() => setSelectedProvider(null)}
      />
    </div>
  );
};

export default ProviderScheduleView;