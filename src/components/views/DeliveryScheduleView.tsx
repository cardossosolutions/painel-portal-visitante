import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Package, Clock, Home, Hash, MapPin, X, Search, Eye, Loader2, Calendar, Truck, ShoppingBag } from 'lucide-react';
import { apiRequest, API_CONFIG } from '../../config/api';

// Interface para os dados da entrega baseada na API
interface DeliveryDetails {
  id: number;
  residence: string;
  ecommerce_id: number | null;
  ecommerce: string;
  quantity: number;
  date_start: string;
  date_ending: string;
}

const DeliveryCard: React.FC<{ delivery: DeliveryDetails; onClick: () => void }> = ({ delivery, onClick }) => {
  const formatDateRange = (dateStart: string, dateEnding: string) => {
    const start = new Date(dateStart).toLocaleDateString('pt-BR');
    const end = new Date(dateEnding).toLocaleDateString('pt-BR');
    
    if (start === end) {
      return start;
    }
    return `${start} até ${end}`;
  };

  const getEcommerceIcon = () => {
    // Se tem ecommerce_id, é um e-commerce cadastrado
    if (delivery.ecommerce_id) {
      return <ShoppingBag className="w-6 h-6 text-white" />;
    }
    // Se não tem ecommerce_id, é "outros"
    return <Truck className="w-6 h-6 text-white" />;
  };

  const getEcommerceBadgeColor = () => {
    if (delivery.ecommerce_id) {
      return 'bg-emerald-100 text-emerald-800';
    }
    return 'bg-amber-100 text-amber-800';
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-amber-300 transform hover:scale-[1.02] h-full"
      onClick={onClick}
    >
      <div className="p-6 h-full flex flex-col">
        {/* Badge - Topo */}
        <div className="flex justify-end mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEcommerceBadgeColor()}`}>
            <Package className="w-4 h-4 mr-1" />
            {delivery.ecommerce_id ? 'E-commerce' : 'Outros'}
          </span>
        </div>

        {/* Header - Ícone, E-commerce e Quantidade */}
        <div className="flex items-start space-x-3 mb-4">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-full shadow-lg flex-shrink-0">
            {getEcommerceIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight break-words">{delivery.ecommerce}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Hash className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 font-medium">
                {delivery.quantity} {delivery.quantity === 1 ? 'entrega' : 'entregas'}
              </span>
            </div>
          </div>
        </div>

        {/* Content - Flex grow para ocupar espaço disponível */}
        <div className="space-y-3 flex-grow">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="bg-green-100 p-1.5 rounded-full flex-shrink-0">
              <Home className="w-4 h-4 text-green-600" />
            </div>
            <span className="font-medium">Residência: {delivery.residence}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="bg-blue-100 p-1.5 rounded-full flex-shrink-0">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <span>
              {formatDateRange(delivery.date_start, delivery.date_ending)}
            </span>
          </div>

          {/* Tipo de E-commerce */}
          <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
            <div className="flex items-center space-x-2">
              {delivery.ecommerce_id ? (
                <>
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-emerald-700 font-medium">E-commerce Cadastrado</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-700 font-medium">Entrega Personalizada</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Sempre no final */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Package className="w-3 h-3 flex-shrink-0" />
              <span>ID: {delivery.id}</span>
            </div>
            <div className="flex items-center space-x-1 text-amber-600 flex-shrink-0">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Ver detalhes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeliveryDetailsModal: React.FC<{ 
  delivery: DeliveryDetails | null; 
  onClose: () => void 
}> = ({ delivery, onClose }) => {
  if (!delivery) return null;

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
            {/* Left Column - Delivery Information */}
            <div className="space-y-6">
              {/* Delivery Information */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Informações da Entrega</h2>
                
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200 space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-full shadow-lg">
                      {delivery.ecommerce_id ? (
                        <ShoppingBag className="w-8 h-8 text-white" />
                      ) : (
                        <Truck className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{delivery.ecommerce}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                        delivery.ecommerce_id 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        <Package className="w-4 h-4 mr-1" />
                        {delivery.ecommerce_id ? 'E-commerce Cadastrado' : 'Entrega Personalizada'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <Hash className="w-5 h-5 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-700">Quantidade:</span>
                        <span className="text-gray-900 ml-2 font-semibold">
                          {delivery.quantity} {delivery.quantity === 1 ? 'entrega' : 'entregas'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <Package className="w-5 h-5 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-700">ID da Entrega:</span>
                        <span className="text-gray-900 font-mono ml-2">#{delivery.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Residence Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Local de Entrega</h3>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-full shadow-lg">
                      <Home className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {delivery.residence}
                      </h4>
                      <p className="text-sm text-green-700 mt-1">Endereço autorizado para entrega</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Delivery Details and Actions */}
            <div className="space-y-6">
              {/* Delivery Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes da Entrega</h3>
                <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    <div>
                      <span className="font-medium text-gray-700">Período Autorizado:</span>
                      <p className="text-gray-900">Início: {new Date(delivery.date_start).toLocaleDateString('pt-BR')}</p>
                      <p className="text-gray-900">Fim: {new Date(delivery.date_ending).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3 mb-3">
                      {delivery.ecommerce_id ? (
                        <>
                          <ShoppingBag className="w-5 h-5 text-emerald-600" />
                          <span className="font-medium text-gray-700">E-commerce Oficial:</span>
                        </>
                      ) : (
                        <>
                          <Truck className="w-5 h-5 text-amber-600" />
                          <span className="font-medium text-gray-700">Entrega Personalizada:</span>
                        </>
                      )}
                    </div>
                    <p className="text-gray-900 font-semibold">{delivery.ecommerce}</p>
                    {delivery.ecommerce_id && (
                      <p className="text-sm text-gray-600 mt-1">ID do E-commerce: #{delivery.ecommerce_id}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Statistics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">{delivery.quantity}</div>
                      <div className="text-sm text-gray-600">
                        {delivery.quantity === 1 ? 'Entrega' : 'Entregas'}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.ceil((new Date(delivery.date_ending).getTime() - new Date(delivery.date_start).getTime()) / (1000 * 60 * 60 * 24)) + 1}
                      </div>
                      <div className="text-sm text-gray-600">Dias</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4">Ações Rápidas</h4>
                <div className="space-y-3">
                  <button className="w-full bg-gradient-to-r from-amber-600 to-orange-700 text-white py-3 px-4 rounded-lg hover:from-amber-700 hover:to-orange-800 transition-all duration-200 font-medium shadow-md">
                    Confirmar Recebimento
                  </button>
                  <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-md">
                    Marcar como Entregue
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

const DeliveryScheduleView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryDetails | null>(null);
  
  // Estados para scroll infinito
  const [deliveries, setDeliveries] = useState<DeliveryDetails[]>([]);
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
  const loadDeliveryData = useCallback(async (page: number, search?: string, reset: boolean = false) => {
    // Evitar múltiplas requisições simultâneas
    if (loadingRef.current) {
      console.log('⏳ Requisição já em andamento, ignorando...');
      return;
    }

    try {
      loadingRef.current = true;
      console.log(`🔄 Carregando entregas - Página: ${page}, Busca: ${search || 'N/A'}, Reset: ${reset}`);
      
      if (page === 1 && !reset) {
        setInitialLoading(true);
      } else if (page > 1) {
        setLoadingMore(true);
      }
      
      // Construir URL com parâmetros de paginação e busca
      let url = `/deliveries?page=${page}`;
      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      
      const response = await apiRequest(url, {
        method: 'GET'
      });
      
      console.log('✅ Resposta do cronograma de entregas:', response);
      
      if (response && response.data && Array.isArray(response.data)) {
        const newDeliveries = response.data;
        
        if (reset || page === 1) {
          // Primeira página ou reset - substituir todos os dados
          setDeliveries(newDeliveries);
        } else {
          // Páginas subsequentes - adicionar aos dados existentes, evitando duplicatas
          setDeliveries(prev => {
            const existingIds = new Set(prev.map(d => d.id));
            const uniqueNewDeliveries = newDeliveries.filter(d => !existingIds.has(d.id));
            return [...prev, ...uniqueNewDeliveries];
          });
        }
        
        setCurrentPage(response.current_page);
        setHasNextPage(response.current_page < response.last_page);
        setTotalCount(response.total);
        
        console.log(`💾 Entregas carregadas - Página: ${response.current_page}/${response.last_page}, Total: ${response.total}`);
      } else {
        console.warn('⚠️ Resposta do cronograma de entregas inválida:', response);
        if (reset || page === 1) {
          setDeliveries([]);
          setTotalCount(0);
          setHasNextPage(false);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar cronograma de entregas:', error);
      if (reset || page === 1) {
        setDeliveries([]);
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
      loadDeliveryData(currentPage + 1, searchTerm);
    }
  }, [loadDeliveryData, currentPage, searchTerm, loadingMore, hasNextPage]);

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
    console.log('👁️ DeliveryScheduleView montado - carregando cronograma inicial...');
    loadDeliveryData(1, '', true);
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
      loadDeliveryData(1, searchTerm, true);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadDeliveryData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entregas Programadas</h1>
          <p className="text-gray-600 mt-1">
            Visualize e gerencie todas as entregas autorizadas
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar e-commerce ou residência..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 min-w-[300px]"
            />
          </div>
          
          {loading && (
            <div className="flex items-center space-x-2 text-amber-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
              <span className="text-sm">Buscando...</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium opacity-90">Total de Entregas</h3>
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
            <Package className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Deliveries Grid */}
      {initialLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center space-x-3 text-amber-600">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-lg font-medium">Carregando entregas...</span>
          </div>
        </div>
      ) : deliveries.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {deliveries.map((delivery) => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                onClick={() => setSelectedDelivery(delivery)}
              />
            ))}
          </div>
          
          {/* Sentinela para scroll infinito */}
          <div ref={sentinelRef} className="h-20 flex items-center justify-center">
            {loadingMore && (
              <div className="flex items-center space-x-3 text-amber-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm font-medium">Carregando mais entregas...</span>
              </div>
            )}
            {!hasNextPage && deliveries.length > 0 && (
              <div className="text-center text-gray-500">
                <p className="text-sm">✨ Todas as entregas foram carregadas</p>
                <p className="text-xs mt-1">{totalCount} {totalCount === 1 ? 'entrega' : 'entregas'} no total</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhuma entrega encontrada</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchTerm 
              ? 'Não há entregas para a busca realizada. Tente outros termos.'
              : 'Não há entregas programadas no momento.'}
          </p>
        </div>
      )}

      {/* Delivery Details Modal */}
      <DeliveryDetailsModal
        delivery={selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
      />
    </div>
  );
};

export default DeliveryScheduleView;