import React from 'react';
import { LabProvider, useLab } from './context/LabContext';
import { RoleSelector } from './components/RoleSelector';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomBar } from './components/BottomBar';
import { RecepcionView } from './components/recepcion/RecepcionView';
import { TecnicoView } from './components/tecnico/TecnicoView';
import { QuimicoView } from './components/quimico/QuimicoView';
import { AdminView } from './components/admin/AdminView';

const MainLayout: React.FC = () => {
  const { activeRole } = useLab();

  // If no role has been chosen yet, display the clean 2 col mobile / 4 col desktop RoleSelector
  if (!activeRole) {
    return <RoleSelector />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Cabecera Institucional Unificada */}
      <Header />

      {/* Main Container with Sidebar (Desktop) + Dynamic Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 lg:pb-8">
        {/* Menú Lateral Desplegable en Escritorio */}
        <Sidebar />

        {/* Dynamic Role Content Area */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0">
          {activeRole === 'recepcion' && <RecepcionView />}
          {activeRole === 'tecnico' && <TecnicoView />}
          {activeRole === 'quimico' && <QuimicoView />}
          {activeRole === 'admin' && <AdminView />}
        </main>
      </div>

      {/* Navegación Móvil y Tablet (Bottom Bar fija para uso táctil) */}
      <BottomBar />
    </div>
  );
};

export default function App() {
  return (
    <LabProvider>
      <MainLayout />
    </LabProvider>
  );
}
