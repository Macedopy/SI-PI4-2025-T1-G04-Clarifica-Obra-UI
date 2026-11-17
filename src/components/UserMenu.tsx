//Responsável de User: Bruno Macedo
import React, { useState } from 'react';
import { useUserType } from '../contexts/UserTypeContext';
import { UI_SIZES, useUiSize } from '../contexts/UiSizeContext';
import type { UiSize } from '../contexts/UiSizeContext';

const roleLabels: Record<string, string> = {
  CLIENT: 'Cliente',
  MASTER_BUILDER: 'Mestre de Obras',
  OWNER: 'Proprietário da Construção',
};

export const UserMenu: React.FC = () => {
  const { customerId, userType, logout } = useUserType();
  const { uiSize, setUiSize } = useUiSize();
  const [open, setOpen] = useState(false);

  const label = userType ? roleLabels[userType] || userType : 'Usuário';

  return (
    <div className="relative inline-block">
      {/* Botão hambúrguer (3 seções) */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-gray-500 hover:text-gray-900 transition-colors focus:outline-none"
        aria-label="Abrir menu da conta"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Card de funcionalidades (dropdown) */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-[60] overflow-hidden"
        >
          {/* Cabeçalho da conta */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full p-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {label}
                </p>
                <p className="text-xs text-gray-400 truncate" title={customerId || ''}>
                  {customerId ? `${customerId.slice(0, 8)}…` : 'Conta'}
                </p>
              </div>
            </div>
          </div>

          {/* Tamanho dos elementos da visão */}
          <div className="px-4 py-3 border-b border-gray-100">
            <label
              htmlFor="user-menu-ui-size"
              className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
            >
              Tamanho
            </label>
            <select
              id="user-menu-ui-size"
              value={uiSize}
              onChange={(e) => setUiSize(e.target.value as UiSize)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {(Object.keys(UI_SIZES) as UiSize[]).map((key) => (
                <option key={key} value={key}>{UI_SIZES[key].label}</option>
              ))}
            </select>
            <p className="text-[11px] text-gray-400 mt-1.5">
              Ajusta o tamanho dos elementos da obra.
            </p>
          </div>

          <div className="py-2">
            {/* Configurações */}
            <button
              onClick={() => {
                setOpen(false);
                alert('Configurações - em desenvolvimento');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Configurações
            </button>

            {/* Ajuda */}
            <button
              onClick={() => {
                setOpen(false);
                alert('Ajuda - em desenvolvimento');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Ajuda
            </button>

            {/* Logoff */}
            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logoff
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
