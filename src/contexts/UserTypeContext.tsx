//Responsável de User: Bruno Macedo
import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserTypeContextData {
  isAuthenticated: boolean;
  loading: boolean;
  customerId: string | null;
  userType: string | null;
  login: (customerId: string) => Promise<void>;
  logout: () => void;
}

const UserTypeContext = createContext<UserTypeContextData>({} as UserTypeContextData);

export const UserTypeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);

  // Verifica se existe sessão salva ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedCustomerId = localStorage.getItem('customerId');
        const savedUserType = localStorage.getItem('userType');
        
        if (savedCustomerId && savedUserType) {
          setCustomerId(savedCustomerId);
          setUserType(savedUserType);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (inputCustomerId: string) => {
    try {
      setLoading(true);
      
      // Faz a requisição para o backend
      const response = await fetch(`http://localhost:8080/users/customer/${inputCustomerId}`);
      
      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Salva os dados do usuário
      setCustomerId(inputCustomerId);
      setUserType(data.type || 'cliente');
      setIsAuthenticated(true);

      // Persiste no localStorage
      localStorage.setItem('customerId', inputCustomerId);
      localStorage.setItem('userType', data.type || 'cliente');
      
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCustomerId(null);
    setUserType(null);
    localStorage.removeItem('customerId');
    localStorage.removeItem('userType');
  };

  return (
    <UserTypeContext.Provider
      value={{
        isAuthenticated,
        loading,
        customerId,
        userType,
        login,
        logout,
      }}
    >
      {children}
    </UserTypeContext.Provider>
  );
};

export const useUserType = () => {
  const context = useContext(UserTypeContext);
  
  if (!context) {
    throw new Error('useUserType deve ser usado dentro de UserTypeProvider');
  }
  
  return context;
};
