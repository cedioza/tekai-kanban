import { useCallback } from 'react';
import { useTareas } from '../contexts/TareaContext';
import { useActivity } from '../contexts/ActivityContext';
import { CreateTareaDto, UpdateTareaDto, EstadoTarea, CreateComentarioDto, TipoActividad } from '../../domain/entities/Tarea';

export function useTareasWithActivity() {
  const { state, actions: tareaActions } = useTareas();
  const { actions: activityActions } = useActivity();

  const createTarea = useCallback(async (tareaDto: CreateTareaDto) => {
    try {
      await tareaActions.createTarea(tareaDto);
      
      // Registrar actividad de creación
      activityActions.registrarActividad({
        tareaId: 0, // Se actualizará cuando tengamos el ID real
        tipo: TipoActividad.CREACION,
        descripcion: `Tarea "${tareaDto.titulo}" creada`,
        usuario: tareaDto.responsable || 'Usuario',
        detalles: {
          comentario: `Nueva tarea creada con prioridad ${tareaDto.prioridad}`
        }
      });
    } catch (error) {
      throw error;
    }
  }, [tareaActions, activityActions]);

  const updateTarea = useCallback(async (id: number, updates: UpdateTareaDto) => {
    try {
      const tareaAnterior = state.tareas.find(t => t.id === id);
      await tareaActions.updateTarea(id, updates);
      
      // Registrar actividades según los cambios
      if (tareaAnterior) {
        if (updates.estado && updates.estado !== tareaAnterior.estado) {
          activityActions.registrarActividad({
            tareaId: id,
            tipo: TipoActividad.CAMBIO_ESTADO,
            descripcion: `Estado cambiado de "${tareaAnterior.estado}" a "${updates.estado}"`,
            usuario: updates.responsable || tareaAnterior.responsable,
            detalles: {
              campoModificado: 'estado',
              valorAnterior: tareaAnterior.estado,
              valorNuevo: updates.estado
            }
          });
        }
        
        if (updates.responsable && updates.responsable !== tareaAnterior.responsable) {
          activityActions.registrarActividad({
            tareaId: id,
            tipo: TipoActividad.CAMBIO_RESPONSABLE,
            descripcion: `Responsable cambiado de "${tareaAnterior.responsable}" a "${updates.responsable}"`,
            usuario: updates.responsable,
            detalles: {
              campoModificado: 'responsable',
              valorAnterior: tareaAnterior.responsable,
              valorNuevo: updates.responsable
            }
          });
        }
        
        if (updates.prioridad && updates.prioridad !== tareaAnterior.prioridad) {
          activityActions.registrarActividad({
            tareaId: id,
            tipo: TipoActividad.CAMBIO_PRIORIDAD,
            descripcion: `Prioridad cambiada de "${tareaAnterior.prioridad}" a "${updates.prioridad}"`,
            usuario: updates.responsable || tareaAnterior.responsable,
            detalles: {
              campoModificado: 'prioridad',
              valorAnterior: tareaAnterior.prioridad,
              valorNuevo: updates.prioridad
            }
          });
        }
        
        // Si hay otros cambios generales
        const otrosCambios = Object.keys(updates).filter(key => 
          !['estado', 'responsable', 'prioridad'].includes(key)
        );
        
        if (otrosCambios.length > 0) {
          activityActions.registrarActividad({
            tareaId: id,
            tipo: TipoActividad.ACTUALIZACION,
            descripcion: `Tarea "${tareaAnterior.titulo}" actualizada`,
            usuario: updates.responsable || tareaAnterior.responsable,
            detalles: {
              comentario: `Campos modificados: ${otrosCambios.join(', ')}`
            }
          });
        }
      }
    } catch (error) {
      throw error;
    }
  }, [state.tareas, tareaActions, activityActions]);

  const deleteTarea = useCallback(async (id: number) => {
    try {
      const tarea = state.tareas.find(t => t.id === id);
      await tareaActions.deleteTarea(id);
      
      if (tarea) {
        activityActions.registrarActividad({
          tareaId: id,
          tipo: TipoActividad.ELIMINACION,
          descripcion: `Tarea "${tarea.titulo}" eliminada`,
          usuario: tarea.responsable,
          detalles: {
            comentario: `Tarea eliminada del estado ${tarea.estado}`
          }
        });
      }
    } catch (error) {
      throw error;
    }
  }, [state.tareas, tareaActions, activityActions]);

  const moveTarea = useCallback(async (id: number, newEstado: EstadoTarea) => {
    try {
      const tarea = state.tareas.find(t => t.id === id);
      await tareaActions.moveTarea(id, newEstado);
      
      if (tarea) {
        activityActions.registrarActividad({
          tareaId: id,
          tipo: TipoActividad.CAMBIO_ESTADO,
          descripcion: `Tarea movida de "${tarea.estado}" a "${newEstado}"`,
          usuario: tarea.responsable,
          detalles: {
            campoModificado: 'estado',
            valorAnterior: tarea.estado,
            valorNuevo: newEstado
          }
        });
      }
    } catch (error) {
      throw error;
    }
  }, [state.tareas, tareaActions, activityActions]);

  const createComentario = useCallback(async (tareaId: number, comentario: CreateComentarioDto) => {
    try {
      await tareaActions.createComentario(tareaId, comentario);
      
      activityActions.registrarActividad({
        tareaId,
        tipo: TipoActividad.AGREGADO_COMENTARIO,
        descripcion: `Nuevo comentario agregado`,
        usuario: comentario.autor,
        detalles: {
          comentario: comentario.contenido.substring(0, 100) + (comentario.contenido.length > 100 ? '...' : '')
        }
      });
    } catch (error) {
      throw error;
    }
  }, [tareaActions, activityActions]);

  return {
    state,
    actions: {
      ...tareaActions,
      createTarea,
      updateTarea,
      deleteTarea,
      moveTarea,
      createComentario,
      addComment: createComentario,
    }
  };
}