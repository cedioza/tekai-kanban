import React, { useState } from 'react';
import { BarChart3, Users, Settings, Kanban, Clock, Plus, TestTube } from 'lucide-react';
import NotificationIcon from './NotificationIcon';
import NotificationModal from './NotificationModal';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateTask?: () => void;
  onLoadTestData?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, onCreateTask, onLoadTestData }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  const tabs = [
    {
      id: 'kanban',
      label: 'Tablero',
      icon: Kanban,
      description: 'Gestión de tareas Kanban'
    },
    {
      id: 'counter',
      label: 'Contador',
      icon: BarChart3,
      description: 'Estadísticas por responsable'
    },
    {
      id: 'admin',
      label: 'Administrador',
      icon: Settings,
      description: 'Gestión de responsables'
    },
    {
      id: 'history',
      label: 'Historial',
      icon: Clock,
      description: 'Historial de actividades'
    }
  ];

  return (
    <nav className="navigation-container">
      <div className="navigation-header">
        <div className="navigation-logo">
          <Users className="logo-icon" />
          <h1>TEKAI</h1>
        </div>
        <div className="navigation-actions">
          <NotificationIcon onClick={handleNotificationClick} />
          {activeTab === 'kanban' && onLoadTestData && (
            <button 
              className="test-data-btn"
              onClick={onLoadTestData}
              title="Cargar datos de prueba"
            >
              <TestTube size={16} />
              <span>Test</span>
            </button>
          )}
          {activeTab === 'kanban' && onCreateTask && (
            <button 
              className="create-task-btn"
              onClick={onCreateTask}
              title="Crear nueva tarea"
            >
              <Plus size={16} />
              <span>Nueva Tarea</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="navigation-tabs">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              className={`navigation-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
              title={tab.description}
            >
              <IconComponent size={20} />
              <span className="tab-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      <NotificationModal 
        isOpen={showNotifications} 
        onClose={handleCloseNotifications} 
      />
    </nav>
  );
};

export default Navigation;