import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Settings, User, Bell, Shield, Palette, LogOut } from 'lucide-react';

export function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'privacy', label: 'Privacidad', icon: Shield },
    { id: 'appearance', label: 'Apariencia', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-surface-900">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-gray-300" />
          <h1 className="text-2xl font-bold text-gray-100">Configuración</h1>
        </div>

        <div className="bg-surface-800 rounded-lg shadow border border-surface-700">
          <div className="flex border-b border-surface-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary-400 border-b-2 border-primary-400'
                    : 'text-surface-300 hover:text-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.username || ''}
                    className="w-full px-4 py-2 border border-surface-600 rounded-lg bg-surface-700 text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-surface-600 rounded-lg bg-surface-700 text-surface-300"
                  />
                </div>
                <button className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                  Guardar cambios
                </button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-200">Notificaciones push</p>
                    <p className="text-sm text-surface-300">Recibe notificaciones de nuevos mensajes</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-200">Sonidos</p>
                    <p className="text-sm text-surface-300">Reproduce sonido al recibir mensajes</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary-500" />
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-200">Última conexión</p>
                    <p className="text-sm text-surface-300">Mostrar cuándo estuviste en línea</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-200">Confirmación de lectura</p>
                    <p className="text-sm text-surface-300">Mostrar cuando leíste los mensajes</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary-500" />
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-200 mb-3">Tema</p>
                  <div className="flex gap-4">
                    <button className="px-4 py-2 border border-surface-600 rounded-lg text-surface-300 hover:border-surface-400">
                      Claro
                    </button>
                    <button className="px-4 py-2 border-2 border-primary-500 rounded-lg text-primary-400">
                      Oscuro
                    </button>
                    <button className="px-4 py-2 border border-surface-600 rounded-lg text-surface-300 hover:border-surface-400">
                      Sistema
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={logout}
          className="mt-6 flex items-center gap-2 px-6 py-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}