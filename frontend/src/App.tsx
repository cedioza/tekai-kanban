import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProviders } from './context/AppProviders';
import Navigation from './components/Navigation';
import KanbanPage from './pages/KanbanPage';
import CounterPage from './pages/CounterPage';
import AdminPage from './pages/AdminPage';
import HistoryPage from './pages/HistoryPage';
import TareaModal from './components/TareaModal';
import TareaEditPage from './pages/TareaEditPage';
import { useTareasWithActivity } from './hooks/useTareasWithActivity';
import { useResponsables } from './context/ResponsableContext';
import { CreateTareaDto, EstadoTarea, PrioridadTarea } from './types/Tarea';
import { toast } from 'react-hot-toast';
import './App.css';

function HomePage() {
  const [activeTab, setActiveTab] = useState('kanban');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { actions: tareaActions } = useTareasWithActivity();
  const { state: { responsables } } = useResponsables();

  const handleLoadTestData = async () => {
    try {
      const activeResponsables = responsables.filter(r => r.activo);
      if (activeResponsables.length === 0) {
        toast.error('No hay responsables activos disponibles');
        return;
      }

      const testTasks: CreateTareaDto[] = [
        {
          titulo: 'Implementar autenticación de usuarios',
          descripcion: 'Desarrollar sistema de login y registro con JWT',
          estado: EstadoTarea.CREADA,
          responsable: activeResponsables[0]?.nombre || 'Juan Henao',
          prioridad: PrioridadTarea.ALTA,
          etiquetas: ['backend', 'seguridad'],
          tiempoEstimado: 8
        },
        {
          titulo: 'Diseñar interfaz de dashboard',
          descripcion: 'Crear mockups y prototipos para el panel principal',
          estado: EstadoTarea.EN_PROGRESO,
          responsable: activeResponsables[1]?.nombre || 'María García',
          prioridad: PrioridadTarea.MEDIA,
          etiquetas: ['frontend', 'diseño'],
          tiempoEstimado: 12
        },
        {
          titulo: 'Configurar base de datos',
          descripcion: 'Establecer esquemas y relaciones en PostgreSQL',
          estado: EstadoTarea.FINALIZADA,
          responsable: activeResponsables[2]?.nombre || 'Carlos López',
          prioridad: PrioridadTarea.CRITICA,
          etiquetas: ['database', 'backend'],
          tiempoEstimado: 6
        },
        {
          titulo: 'Optimizar rendimiento del frontend',
          descripcion: 'Implementar lazy loading y code splitting',
          estado: EstadoTarea.BLOQUEADA,
          responsable: activeResponsables[3]?.nombre || 'Ana Martínez',
          prioridad: PrioridadTarea.MEDIA,
          etiquetas: ['frontend', 'performance'],
          tiempoEstimado: 10
        },
        {
          titulo: 'Escribir documentación técnica',
          descripcion: 'Documentar APIs y guías de instalación',
          estado: EstadoTarea.CREADA,
          responsable: activeResponsables[4]?.nombre || 'Pedro Rodríguez',
          prioridad: PrioridadTarea.BAJA,
          etiquetas: ['documentación'],
          tiempoEstimado: 4
        },
        {
          titulo: 'Implementar notificaciones push',
          descripcion: 'Sistema de notificaciones en tiempo real',
          estado: EstadoTarea.EN_PROGRESO,
          responsable: activeResponsables[0]?.nombre || 'Juan Henao',
          prioridad: PrioridadTarea.ALTA,
          etiquetas: ['backend', 'notificaciones'],
          tiempoEstimado: 15
        },
        {
          titulo: 'Crear tests unitarios',
          descripcion: 'Cobertura de tests para componentes críticos',
          estado: EstadoTarea.CREADA,
          responsable: activeResponsables[1]?.nombre || 'María García',
          prioridad: PrioridadTarea.MEDIA,
          etiquetas: ['testing', 'calidad'],
          tiempoEstimado: 20
        },
        {
          titulo: 'Configurar CI/CD pipeline',
          descripcion: 'Automatizar despliegues con GitHub Actions',
          estado: EstadoTarea.BLOQUEADA,
          responsable: activeResponsables[2]?.nombre || 'Carlos López',
          prioridad: PrioridadTarea.ALTA,
          etiquetas: ['devops', 'automatización'],
          tiempoEstimado: 8
        },
        {
          titulo: 'Migrar datos legacy',
          descripcion: 'Transferir información del sistema anterior',
          estado: EstadoTarea.FINALIZADA,
          responsable: activeResponsables[3]?.nombre || 'Ana Martínez',
          prioridad: PrioridadTarea.CRITICA,
          etiquetas: ['migración', 'datos'],
          tiempoEstimado: 25
        }
        // {
        //   titulo: 'Implementar chat en vivo',
        //   descripcion: 'Sistema de mensajería instantánea para usuarios',
        //   estado: EstadoTarea.EN_PROGRESO,
        //   responsable: activeResponsables[4]?.nombre || 'Pedro Rodríguez',
        //   prioridad: PrioridadTarea.MEDIA,
        //   etiquetas: ['frontend', 'comunicación'],
        //   tiempoEstimado: 18
        // }
      ];

      // Crear las tareas una por una
      for (const task of testTasks) {
        await tareaActions.createTarea(task);
      }

      toast.success('¡10 tareas de prueba creadas exitosamente!');
    } catch (error) {
      console.error('Error al cargar datos de prueba:', error);
      toast.error('Error al crear las tareas de prueba');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'kanban':
        return <KanbanPage />;
      case 'counter':
        return <CounterPage />;
      case 'admin':
        return <AdminPage />;
      case 'history':
        return <HistoryPage />;
      default:
        return <KanbanPage />;
    }
  };

  return (
    <>
      {/* Navigation */}
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onCreateTask={() => setIsCreateModalOpen(true)}
        onLoadTestData={handleLoadTestData}
      />

      {/* Main Content */}
      <main>
        {renderContent()}
      </main>

      {/* Create Modal */}
      <TareaModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppProviders>
        <div className="app">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tasks/:id/edit" element={<TareaEditPage />} />
          </Routes>

          {/* Toast Notifications */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                marginBottom: '20px',
                marginRight: '20px',
                zIndex: 9999,
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </AppProviders>
    </Router>
  );
}

export default App;