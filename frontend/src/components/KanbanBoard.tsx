import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useTareasWithActivity } from '../hooks/useTareasWithActivity';
import { EstadoTarea, ESTADOS_KANBAN, Tarea } from '../types/Tarea';
import TareaCard from './TareaCard';
import TareaModal from './TareaModal';
import TaskFilters from './TaskFilters';



const KanbanBoard: React.FC = () => {
  const { state, actions } = useTareasWithActivity();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [tareaToEdit, setTareaToEdit] = useState<Tarea | undefined>(undefined);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponsable, setSelectedResponsable] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  
  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedResponsable('');
    setSelectedEstado('');
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Si no hay destino, no hacer nada
    if (!destination) {
      return;
    }

    // Si se suelta en la misma posición, no hacer nada
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const tareaId = parseInt(draggableId);
    const newEstado = destination.droppableId as EstadoTarea;

    console.log('🔍 Debug drag and drop:', {
      draggableId,
      tareaId,
      newEstado,
      sourceDroppableId: source.droppableId,
      destinationDroppableId: destination.droppableId,
      estadosDisponibles: Object.values(EstadoTarea)
    });

    // Validar que el ID de la tarea sea válido
    if (isNaN(tareaId)) {
      console.error('ID de tarea inválido:', draggableId);
      return;
    }

    // Validar que el nuevo estado sea válido
    if (!Object.values(EstadoTarea).includes(newEstado)) {
      console.error('Estado inválido:', newEstado, 'Estados disponibles:', Object.values(EstadoTarea));
      return;
    }

    try {
      await actions.moveTarea(tareaId, newEstado);
    } catch (error) {
      console.error('Error al mover tarea:', error);
      // Mostrar mensaje de error al usuario
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al mover la tarea';
      alert(`Error al mover la tarea: ${errorMessage}`);
    }
  };

  // Filtrar tareas basado en los criterios de búsqueda y filtros
  const filteredTareas = useMemo(() => {
    return state.tareas.filter(tarea => {
      // Filtro por búsqueda (título o descripción)
      const matchesSearch = !searchTerm || 
        tarea.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tarea.descripcion && tarea.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtro por responsable
      const matchesResponsable = !selectedResponsable || tarea.responsable === selectedResponsable;
      
      // Filtro por estado
      const matchesEstado = !selectedEstado || tarea.estado === selectedEstado;
      
      return matchesSearch && matchesResponsable && matchesEstado;
    });
  }, [state.tareas, searchTerm, selectedResponsable, selectedEstado]);

  const getTareasByEstado = (estado: EstadoTarea) => {
    return filteredTareas.filter(tarea => tarea.estado === estado);
  };

  const handleEditTarea = (tarea: Tarea) => {
    setTareaToEdit(tarea);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setTareaToEdit(undefined);
  };

  if (state.loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
        <div style={{ 
          width: '3rem', 
          height: '3rem', 
          border: '3px solid var(--color-border)', 
          borderTop: '3px solid var(--color-primary)', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
      </div>
    );
  }

  return (
    <div>
      {state.error && (
        <div style={{
          background: 'var(--color-error-light)',
          border: '1px solid var(--color-error)',
          color: 'var(--color-error-dark)',
          padding: 'var(--spacing-md)',
          borderRadius: 'var(--radius-md)',
          margin: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-md)'
        }}>
          {state.error}
        </div>
      )}

      {/* Filtros */}
      <div style={{ maxWidth: '95%', width: '95%', margin: '0 auto', padding: '0 var(--spacing-md)' }}>
        <TaskFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedResponsable={selectedResponsable}
          setSelectedResponsable={setSelectedResponsable}
          selectedEstado={selectedEstado}
          setSelectedEstado={setSelectedEstado}
          onClearFilters={clearFilters}
        />
        

      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {ESTADOS_KANBAN.map((estado) => {
            const tareas = getTareasByEstado(estado.key);
            
            return (
              <div key={estado.key} className="kanban-column slide-up">
                <div className="kanban-column-header">
                  <h2 className="kanban-column-title">
                    {estado.label}
                    <span className="kanban-column-count">
                      {tareas.length}
                    </span>
                  </h2>
                  {estado.key === EstadoTarea.CREADA && tareas.length > 0 && (
                    <button 
                      onClick={() => {
                        console.log('🧪 Test button clicked - moving first task');
                        const firstTarea = tareas[0];
                        if (firstTarea.id) {
                          actions.moveTarea(firstTarea.id, EstadoTarea.EN_PROGRESO);
                        }
                      }}
                      style={{
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        marginTop: '4px'
                      }}
                    >
                      Test Move
                    </button>
                  )}
                </div>

                <Droppable droppableId={estado.key}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`kanban-column-body custom-scrollbar ${
                        snapshot.isDraggingOver ? 'drag-over' : ''
                      }`}
                    >
                      {tareas.map((tarea, index) => (
                        <Draggable
                          key={tarea.id!.toString()}
                          draggableId={tarea.id!.toString()}
                          index={index}
                          isDragDisabled={!tarea.id || state.loading}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`
                                ${snapshot.isDragging ? 'dragging' : ''}
                                ${state.loading ? 'drag-disabled' : ''}
                              `}
                              style={{
                                ...provided.draggableProps.style,
                                transform: snapshot.isDragging 
                                  ? `${provided.draggableProps.style?.transform} rotate(5deg)` 
                                  : provided.draggableProps.style?.transform
                              }}
                            >
                              <TareaCard 
                                tarea={tarea} 
                                onEdit={handleEditTarea}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Edit Modal */}
      <TareaModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        mode="edit"
        tarea={tareaToEdit}
      />
    </div>
  );
};

export default KanbanBoard;