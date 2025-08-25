import React from 'react';
import { useTareas } from '../context/TareaContext';
import { User, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { EstadoTarea } from '../types/Tarea';

interface TaskCounterProps {
  filteredTareas?: any[];
}

const TaskCounter: React.FC<TaskCounterProps> = ({ filteredTareas }) => {
  const { state } = useTareas();
  
  // Usar las tareas filtradas si se proporcionan, sino usar todas las tareas
  const tareas = filteredTareas || state.tareas;
  
  // Contar tareas por responsable
  const tasksByResponsable = tareas.reduce((acc, tarea) => {
    const responsable = tarea.responsable || 'Sin asignar';
    if (!acc[responsable]) {
      acc[responsable] = {
        total: 0,
        creada: 0,
        en_progreso: 0,
        bloqueada: 0,
        finalizada: 0,
        cancelada: 0
      };
    }
    
    acc[responsable].total++;
    
    switch (tarea.estado) {
      case EstadoTarea.CREADA:
        acc[responsable].creada++;
        break;
      case EstadoTarea.EN_PROGRESO:
        acc[responsable].en_progreso++;
        break;
      case EstadoTarea.BLOQUEADA:
        acc[responsable].bloqueada++;
        break;
      case EstadoTarea.FINALIZADA:
        acc[responsable].finalizada++;
        break;
      case EstadoTarea.CANCELADA:
        acc[responsable].cancelada++;
        break;
    }
    
    return acc;
  }, {} as Record<string, any>);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'finalizada':
        return <CheckCircle size={12} className="status-icon-completed" />;
      case 'en_progreso':
        return <Clock size={12} className="status-icon-progress" />;
      case 'bloqueada':
        return <AlertCircle size={12} className="status-icon-blocked" />;
      case 'cancelada':
        return <XCircle size={12} className="status-icon-cancelled" />;
      default:
        return <Clock size={12} className="status-icon-created" />;
    }
  };
  
  const responsables = Object.keys(tasksByResponsable).sort();
  
  if (responsables.length === 0) {
    return (
      <div className="task-counter-empty">
        <p>No hay tareas para mostrar</p>
      </div>
    );
  }
  
  return (
    <div className="task-counter">
      <h3 className="task-counter-title">
        <User size={16} />
        Contador de Tareas por Responsable
      </h3>
      
      <div className="task-counter-grid">
        {responsables.map(responsable => {
          const stats = tasksByResponsable[responsable];
          return (
            <div key={responsable} className="task-counter-card">
              <div className="task-counter-header">
                <span className="responsable-name">{responsable}</span>
                <span className="total-tasks">{stats.total} tareas</span>
              </div>
              
              <div className="task-counter-details">
                {stats.creada > 0 && (
                  <div className="task-stat">
                    {getStatusIcon('creada')}
                    <span>Creadas: {stats.creada}</span>
                  </div>
                )}
                {stats.en_progreso > 0 && (
                  <div className="task-stat">
                    {getStatusIcon('en_progreso')}
                    <span>En progreso: {stats.en_progreso}</span>
                  </div>
                )}
                {stats.bloqueada > 0 && (
                  <div className="task-stat">
                    {getStatusIcon('bloqueada')}
                    <span>Bloqueadas: {stats.bloqueada}</span>
                  </div>
                )}
                {stats.finalizada > 0 && (
                  <div className="task-stat">
                    {getStatusIcon('finalizada')}
                    <span>Finalizadas: {stats.finalizada}</span>
                  </div>
                )}
                {stats.cancelada > 0 && (
                  <div className="task-stat">
                    {getStatusIcon('cancelada')}
                    <span>Canceladas: {stats.cancelada}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskCounter;