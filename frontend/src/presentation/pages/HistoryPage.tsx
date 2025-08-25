import { useState, useMemo } from 'react';
import { Clock, Search, User, FileText, AlertCircle, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { useActivity } from '../../application/contexts/ActivityContext';
import { useTareas } from '../../application/contexts/TareaContext';
import { TipoActividad } from '../../domain/entities/Tarea';

const getActivityIcon = (tipo: TipoActividad) => {
  switch (tipo) {
    case TipoActividad.CREACION:
      return <CheckCircle size={16} className="text-green-500" />;
    case TipoActividad.ACTUALIZACION:
      return <Edit size={16} className="text-blue-500" />;
    case TipoActividad.CAMBIO_ESTADO:
      return <AlertCircle size={16} className="text-orange-500" />;
    case TipoActividad.CAMBIO_RESPONSABLE:
      return <User size={16} className="text-purple-500" />;
    case TipoActividad.CAMBIO_PRIORIDAD:
      return <AlertCircle size={16} className="text-red-500" />;
    case TipoActividad.AGREGADO_COMENTARIO:
      return <FileText size={16} className="text-gray-500" />;
    case TipoActividad.ELIMINACION:
      return <Trash2 size={16} className="text-red-600" />;
    default:
      return <FileText size={16} className="text-gray-400" />;
  }
};

const getActivityTypeLabel = (tipo: TipoActividad) => {
  switch (tipo) {
    case TipoActividad.CREACION:
      return 'Creación';
    case TipoActividad.ACTUALIZACION:
      return 'Actualización';
    case TipoActividad.CAMBIO_ESTADO:
      return 'Cambio de Estado';
    case TipoActividad.CAMBIO_RESPONSABLE:
      return 'Cambio de Responsable';
    case TipoActividad.CAMBIO_PRIORIDAD:
      return 'Cambio de Prioridad';
    case TipoActividad.AGREGADO_COMENTARIO:
      return 'Comentario';
    case TipoActividad.ELIMINACION:
      return 'Eliminación';
    default:
      return 'Actividad';
  }
};

const formatDateTime = (fecha: Date) => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(fecha);
};

export default function HistoryPage() {
  const { state: activityState } = useActivity();
  const { state: tareaState } = useTareas();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<TipoActividad | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<number | 'all'>('all');

  // Obtener lista única de usuarios y tareas para los filtros
  const uniqueUsers = useMemo(() => {
    const users = new Set(activityState.actividades.map(a => a.usuario));
    return Array.from(users).sort();
  }, [activityState.actividades]);

  const availableTasks = useMemo(() => {
    return tareaState.tareas.map(t => ({ id: t.id, titulo: t.titulo }));
  }, [tareaState.tareas]);

  // Filtrar actividades
  const filteredActivities = useMemo(() => {
    return activityState.actividades
      .filter(activity => {
        // Filtro por término de búsqueda
        if (searchTerm && !activity.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !activity.usuario.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        // Filtro por tipo
        if (selectedType !== 'all' && activity.tipo !== selectedType) {
          return false;
        }
        
        // Filtro por usuario
        if (selectedUser !== 'all' && activity.usuario !== selectedUser) {
          return false;
        }
        
        // Filtro por tarea
        if (selectedTask !== 'all' && activity.tareaId !== selectedTask) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [activityState.actividades, searchTerm, selectedType, selectedUser, selectedTask]);

  const getTareaTitle = (tareaId: number) => {
    const tarea = tareaState.tareas.find(t => t.id === tareaId);
    return tarea ? tarea.titulo : `Tarea #${tareaId}`;
  };

  return (
    <div className="history-page">
      <div className="history-header">
        <div className="history-title-section">
          <Clock size={24} className="text-primary" />
          <h1>Historial de Actividades</h1>
          <span className="activity-count">{filteredActivities.length} actividades</span>
        </div>
        
        <div className="history-filters">
          {/* Búsqueda */}
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar en historial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          {/* Filtro por tipo */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as TipoActividad | 'all')}
            className="filter-select"
          >
            <option value="all">Todos los tipos</option>
            {Object.values(TipoActividad).map(tipo => (
              <option key={tipo} value={tipo}>
                {getActivityTypeLabel(tipo)}
              </option>
            ))}
          </select>
          
          {/* Filtro por usuario */}
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos los usuarios</option>
            {uniqueUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
          
          {/* Filtro por tarea */}
          <select
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="filter-select"
          >
            <option value="all">Todas las tareas</option>
            {availableTasks.map(task => (
              <option key={task.id} value={task.id}>
                {task.titulo.length > 30 ? task.titulo.substring(0, 30) + '...' : task.titulo}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="history-content">
        {filteredActivities.length === 0 ? (
          <div className="no-activities">
            <Clock size={48} className="text-gray-400" />
            <h3>No se encontraron actividades</h3>
            <p>Intenta ajustar los filtros para ver más resultados</p>
          </div>
        ) : (
          <div className="activities-timeline">
            {filteredActivities.map((activity, index) => {
              const isFirstOfDay = index === 0 || 
                new Date(activity.fecha).toDateString() !== new Date(filteredActivities[index - 1].fecha).toDateString();
              
              return (
                <div key={activity.id} className="timeline-item">
                  {isFirstOfDay && (
                    <div className="timeline-date-separator">
                      <span className="timeline-date">
                        {new Intl.DateTimeFormat('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }).format(new Date(activity.fecha))}
                      </span>
                    </div>
                  )}
                  
                  <div className="activity-card">
                    <div className="activity-icon">
                      {getActivityIcon(activity.tipo)}
                    </div>
                    
                    <div className="activity-content">
                      <div className="activity-header">
                        <div className="activity-main-info">
                          <h4 className="activity-description">{activity.descripcion}</h4>
                          <span className="activity-type-badge">
                            {getActivityTypeLabel(activity.tipo)}
                          </span>
                        </div>
                        <span className="activity-time">
                          {formatDateTime(new Date(activity.fecha))}
                        </span>
                      </div>
                      
                      <div className="activity-meta">
                        <div className="activity-task">
                          <FileText size={14} />
                          <span>{getTareaTitle(activity.tareaId)}</span>
                        </div>
                        <div className="activity-user">
                          <User size={14} />
                          <span>{activity.usuario}</span>
                        </div>
                      </div>
                      
                      {activity.detalles && (
                        <div className="activity-details">
                          {activity.detalles.comentario && (
                            <p className="detail-comment">{activity.detalles.comentario}</p>
                          )}
                          {activity.detalles.campoModificado && (
                            <div className="detail-change">
                              <strong>Campo:</strong> {activity.detalles.campoModificado}
                              {activity.detalles.valorAnterior && activity.detalles.valorNuevo && (
                                <span className="change-values">
                                  <span className="old-value">{activity.detalles.valorAnterior}</span>
                                  <span className="arrow">→</span>
                                  <span className="new-value">{activity.detalles.valorNuevo}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}