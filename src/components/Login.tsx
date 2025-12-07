//Responsável: Bruno Macedo
import React, { useState } from 'react';
import { useUserType } from '../contexts/UserTypeContext';

const Login: React.FC = () => {
  const [customerId, setCustomerId] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useUserType();

  const handleSubmit = async () => {
    if (!customerId.trim()) return;
    
    setError('');

    try {
      await login(customerId);
    } catch (err) {
      setError('Falha no login. Por favor, verifique seu ID de cliente.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customerId.trim()) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-md w-full mx-4">
        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-800 to-blue-900 rounded-full mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Clarifica Obra</h2>
            <p className="text-gray-600 mt-2">
              Faça login para acessar sua obra
            </p>
          </div>

          {/* Formulário */}
          <div className="space-y-6">
            <div>
              <label
                htmlFor="customerId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                ID do Cliente
              </label>
              <input
                id="customerId"
                name="customerId"
                type="text"
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition duration-150"
                placeholder="Digite seu ID de cliente"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* Botão de submit */}
            <div>
              <button
                onClick={handleSubmit}
                disabled={loading || !customerId.trim()}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-blue-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800 transition duration-150 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </div>

          {/* Info adicional */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não tem um ID de cliente?{' '}
              <a href="#" className="font-medium text-blue-800 hover:text-blue-900">
                Entre em contato
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-600">
          © 2025 Clarifica Obra — Todos os direitos reservados
        </p>
      </div>
    </div>
  );
};

export default Login;
