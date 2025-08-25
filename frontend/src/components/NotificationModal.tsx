import { X, Clock, User, FileText } from 'lucide-react';
import { useActivity } from '../context/ActivityContext';
import { TipoActividad } from '../types/Tarea';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getActivityIcon = (tipo: TipoActividad) => {
  switch (tipo) {
    case TipoActividad.CREACION:
      return <FileText size={16} className="text-green-500" />;
    case TipoActividad.ACTUALIZACION:
      return <FileText size={16} className="text-blue-500" />;
    case TipoActividad.CAMBIO_ESTADO:
      return <FileText size={16} className="text-orange-500" />;
    case TipoActividad.CAMBIO_RESPONSABLE:
      return <User size={16} className="text-purple-500" />;
    case TipoActividad.CAMBIO_PRIORIDAD:
      return <FileText size={16} className="text-red-500" />;
    case TipoActividad.AGREGADO_COMENTARIO:
      return <FileText size={16} className="text-gray-500" />;
    case TipoActividad.ELIMINACION:
      return <FileText size={16} className="text-red-600" />;
    default:
      return <FileText size={16} className="text-gray-400" />;
  }
};

const formatTimeAgo = (fecha: Date) => {
  const now = new Date();
  const diff = now.getTime() - fecha.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours}h`;
  return `Hace ${days}d`;
};

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const { state, actions } = useActivity();

  if (!isOpen) return null;

  const recentActivities = state.actividades
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 20);

  const handleMarkAllAsRead = () => {
    state.notificaciones.forEach(notif => {
      if (!notif.leida) {
        actions.marcarNotificacionLeida(notif.id);
      }
    });
  };

  return (
    <div className="notification-modal-overlay" onClick={onClose}>
      <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
        <div className="notification-modal-header">
          <h3>Notificaciones</h3>
          <div className="notification-modal-actions">
            <button 
              className="mark-all-read-btn"
              onClick={handleMarkAllAsRead}
            >
              Marcar todas como leídas
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="notification-modal-body">
          {recentActivities.length === 0 ? (
            <div className="no-notifications">
              <Clock size={48} className="text-gray-400" />
              <p>No hay actividades recientes</p>
            </div>
          ) : (
            <div className="notifications-list">
              {recentActivities.map((actividad) => {
                const notification = state.notificaciones.find(n => n.actividadId === actividad.id);
                const isUnread = notification && !notification.leida;
                
                return (
                  <div 
                    key={actividad.id} 
                    className={`notification-item ${isUnread ? 'unread' : ''}`}
                  >
                    <div className="notification-icon">
                      {getActivityIcon(actividad.tipo)}
                    </div>
                    <div className="notification-content">
                      <p className="notification-description">
                        {actividad.descripcion}
                      </p>
                      <div className="notification-meta">
                        <span className="notification-user">{actividad.usuario}</span>
                        <span className="notification-time">
                          {formatTimeAgo(new Date(actividad.fecha))}
                        </span>
                      </div>
                      {actividad.detalles?.comentario && (
                        <p className="notification-details">
                          {actividad.detalles.comentario}
                        </p>
                      )}
                    </div>
                    {isUnread && <div className="unread-indicator"></div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}