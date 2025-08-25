import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useTareas } from '../context/TareaContext';

interface TaskFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedResponsable: string;
  setSelectedResponsable: (responsable: string) => void;
  selectedEstado: string;
  setSelectedEstado: (estado: string) => void;
  onClearFilters: () => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedResponsable,
  setSelectedResponsable,
  selectedEstado,
  setSelectedEstado,
  onClearFilters
}) => {
  const { state } = useTareas();
  
  // Obtener lista única de responsables
  const responsables = Array.from(
    new Set(
      state.tareas
        .map(tarea => tarea.responsable)
        .filter(responsable => responsable && responsable.trim() !== '')
    )
  ).sort();

  // Estados disponibles
  const estados = ['Creada', 'En progreso', 'Bloqueada', 'Finalizada', 'Cancelada'];

  const hasActiveFilters = searchTerm || selectedResponsable || selectedEstado;

  return (
    <div className="task-filters">
      {/* Búsqueda */}
      <div className="filter-group">
        <div className="search-input-container">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por título o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="clear-search-btn"
              title="Limpiar búsqueda"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="filter-group">
        <Filter size={16} className="filter-icon" />
        
        {/* Filtro por Responsable */}
        <select
          value={selectedResponsable}
          onChange={(e) => setSelectedResponsable(e.target.value)}
          className="filter-select"
        >
          <option value="">Todos los responsables</option>
          {responsables.map(responsable => (
            <option key={responsable} value={responsable}>
              {responsable}
            </option>
          ))}
        </select>

        {/* Filtro por Estado */}
        <select
          value={selectedEstado}
          onChange={(e) => setSelectedEstado(e.target.value)}
          className="filter-select"
        >
          <option value="">Todos los estados</option>
          {estados.map(estado => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>

        {/* Botón para limpiar filtros */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="clear-filters-btn"
            title="Limpiar todos los filtros"
          >
            <X size={14} />
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskFilters;