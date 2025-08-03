import React from 'react';
import { useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { useToast } from './contexts/ToastContext';
import ToastContainer from './components/common/ToastContainer';
import LoginScreen from './components/auth/LoginScreen';
import Dashboard from './components/layout/Dashboard';

// Componente de loading
const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  );
};

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toasts, removeToast } = useToast();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated ? (
        <DataProvider>
          <Dashboard />
        </DataProvider>
      ) : (
        <LoginScreen />
      )}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;