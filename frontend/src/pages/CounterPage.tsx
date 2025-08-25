import React from 'react';
import { useTareas } from '../context/TareaContext';
import TaskCounter from '../components/TaskCounter';
import { EstadoTarea } from '../types/Tarea';
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react';

const CounterPage: React.FC = () => {
  const { state: { tareas } } = useTareas();

  const totalTasks = tareas.length;
  const totalResponsables = new Set(tareas.map(t => t.responsable)).size;
  const completedTasks = tareas.filter(t => t.estado === EstadoTarea.FINALIZADA).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="counter-page">
      <div className="page-header">
        <h2>Contador de Responsables</h2>
        <p>Estadísticas detalladas del rendimiento por responsable</p>
      </div>

      {/* Estadísticas generales */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">
            <Activity className="icon" />
          </div>
          <div className="stat-content">
            <h3>{totalTasks}</h3>
            <p>Total de Tareas</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Users className="icon" />
          </div>
          <div className="stat-content">
            <h3>{totalResponsables}</h3>
            <p>Responsables Activos</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp className="icon" />
          </div>
          <div className="stat-content">
            <h3>{completedTasks}</h3>
            <p>Tareas Completadas</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <BarChart3 className="icon" />
          </div>
          <div className="stat-content">
            <h3>{completionRate}%</h3>
            <p>Tasa de Finalización</p>
          </div>
        </div>
      </div>

      {/* Contador detallado por responsable */}
      <div className="detailed-counter">
        <h3>Desglose por Responsable</h3>
        <TaskCounter filteredTareas={tareas} />
      </div>
    </div>
  );
};

export default CounterPage;