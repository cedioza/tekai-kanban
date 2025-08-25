/**
 * @fileoverview Context de React para la gestión global del estado de tareas
 * Proporciona un estado centralizado y acciones para operaciones CRUD de tareas
 * @author TEKAI Team
 * @version 1.0.0
 */

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Tarea, CreateTareaDto, UpdateTareaDto, EstadoTarea, CreateComentarioDto } from '../../domain/entities/Tarea';
import { tareaApi } from '../../infrastructure/api/tareaApi';
import toast from 'react-hot-toast';

/**
 * Estado global de las tareas en la aplicación
 * @interface TareaState
 */
interface TareaState {
  /** Lista de todas las tareas cargadas */
  tareas: Tarea[];
  /** Indicador de carga para operaciones asíncronas */
  loading: boolean;
  /** Mensaje de error si ocurre algún problema */
  error: string | null;
}

/**
 * Acciones disponibles para el reducer de tareas
 * Define todas las operaciones que pueden modificar el estado
 * @type TareaAction
 */
type TareaAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TAREAS'; payload: Tarea[] }
  | { type: 'ADD_TAREA'; payload: Tarea }
  | { type: 'UPDATE_TAREA'; payload: Tarea }
  | { type: 'DELETE_TAREA'; payload: number }
  | { type: 'SET_ERROR'; payload: string | null };

/**
 * Tipo del contexto de tareas que se proporciona a los componentes
 * Incluye el estado actual y todas las acciones disponibles
 * @interface TareaContextType
 */
interface TareaContextType {
  /** Estado actual de las tareas */
  state: TareaState;
  /** Acciones disponibles para manipular las tareas */
  actions: {
    /** Carga todas las tareas desde el servidor */
    loadTareas: () => Promise<void>;
    /** Crea una nueva tarea */
    createTarea: (tarea: CreateTareaDto) => Promise<void>;
    /** Actualiza una tarea existente */
    updateTarea: (id: number, updates: UpdateTareaDto) => Promise<void>;
    /** Elimina una tarea */
    deleteTarea: (id: number) => Promise<void>;
    /** Mueve una tarea a un nuevo estado (para Kanban) */
    moveTarea: (id: number, newEstado: EstadoTarea) => Promise<void>;
    /** Crea un comentario en una tarea */
    createComentario: (tareaId: number, comentario: CreateComentarioDto) => Promise<void>;
    /** Alias para createComentario */
    addComment: (tareaId: number, comentario: CreateComentarioDto) => Promise<void>;
    /** Elimina un comentario */
    deleteComentario: (comentarioId: number) => Promise<void>;
  };
}

/**
 * Estado inicial del contexto de tareas
 * @constant {TareaState}
 */
const initialState: TareaState = {
  tareas: [],
  loading: false,
  error: null,
};

/**
 * Reducer para manejar las acciones del estado de tareas
 * Implementa el patrón Redux para gestión de estado inmutable
 * @param {TareaState} state - Estado actual
 * @param {TareaAction} action - Acción a ejecutar
 * @returns {TareaState} Nuevo estado
 */
function tareaReducer(state: TareaState, action: TareaAction): TareaState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TAREAS':
      return { ...state, tareas: action.payload, loading: false, error: null };
    case 'ADD_TAREA':
      return { ...state, tareas: [action.payload, ...state.tareas] };
    case 'UPDATE_TAREA':
      return {
        ...state,
        tareas: state.tareas.map(tarea =>
          tarea.id === action.payload.id ? action.payload : tarea
        ),
      };
    case 'DELETE_TAREA':
      return {
        ...state,
        tareas: state.tareas.filter(tarea => tarea.id !== action.payload),
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

/**
 * Contexto de React para las tareas
 * @type {React.Context<TareaContextType | undefined>}
 */
const TareaContext = createContext<TareaContextType | undefined>(undefined);

/**
 * Proveedor del contexto de tareas
 * Envuelve la aplicación y proporciona el estado y acciones de tareas a todos los componentes hijos
 * @param {Object} props - Propiedades del componente
 * @param {ReactNode} props.children - Componentes hijos que tendrán acceso al contexto
 * @returns {JSX.Element} Proveedor del contexto configurado
 */
export function TareaProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tareaReducer, initialState);

  const loadTareas = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const tareas = await tareaApi.getAllTareas();
      dispatch({ type: 'SET_TAREAS', payload: tareas });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar tareas';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error('Error al cargar las tareas');
    }
  };

  const createTarea = async (tareaDto: CreateTareaDto) => {
    try {
      const nuevaTarea = await tareaApi.createTarea(tareaDto);
      dispatch({ type: 'ADD_TAREA', payload: nuevaTarea });
      toast.success('Tarea creada exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear tarea';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error('Error al crear la tarea');
      throw error;
    }
  };

  const updateTarea = async (id: number, updates: UpdateTareaDto) => {
    try {
      const tareaActualizada = await tareaApi.updateTarea(id, updates);
      dispatch({ type: 'UPDATE_TAREA', payload: tareaActualizada });
      toast.success('Tarea actualizada exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar tarea';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error('Error al actualizar la tarea');
      throw error;
    }
  };

  const deleteTarea = async (id: number) => {
    try {
      await tareaApi.deleteTarea(id);
      dispatch({ type: 'DELETE_TAREA', payload: id });
      toast.success('Tarea eliminada exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar tarea';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error('Error al eliminar la tarea');
      throw error;
    }
  };

  const moveTarea = async (id: number, newEstado: EstadoTarea) => {
    try {
      const tarea = state.tareas.find(t => t.id === id);
      const tareaTitle = tarea?.titulo || `Tarea #${id}`;
      
      console.log('🔄 Moviendo tarea:', { id, newEstado, tareaTitle });
      
      const updatedTarea = await tareaApi.updateTarea(id, { estado: newEstado });
      
      dispatch({ type: 'UPDATE_TAREA', payload: updatedTarea });
      
      const estadoLabel = newEstado.replace('_', ' ');
      toast.success(`"${tareaTitle}" movida a ${estadoLabel}`);
      
      console.log('✅ Tarea movida exitosamente:', updatedTarea);
    } catch (error) {
      console.error('❌ Error al mover tarea:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al mover tarea';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error('Error al mover la tarea');
      throw error;
    }
  };

  const createComentario = async (tareaId: number, comentario: CreateComentarioDto) => {
    try {
      await tareaApi.createComentario(tareaId, comentario);
      await loadTareas();
      toast.success('Comentario agregado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al agregar comentario';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error('Error al agregar el comentario');
      throw error;
    }
  };

  const deleteComentario = async (comentarioId: number) => {
    try {
      await tareaApi.deleteComentario(comentarioId);
      await loadTareas();
      toast.success('Comentario eliminado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar comentario';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error('Error al eliminar el comentario');
      throw error;
    }
  };

  useEffect(() => {
    loadTareas();
    
    // Polling cada 3 segundos para actualizaciones automáticas
    const interval = setInterval(() => {
      loadTareas();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const actions = {
    loadTareas,
    createTarea,
    updateTarea,
    deleteTarea,
    moveTarea,
    createComentario,
    addComment: createComentario,
    deleteComentario,
  };

  return (
    <TareaContext.Provider value={{ state, actions }}>
      {children}
    </TareaContext.Provider>
  );
}

/**
 * Hook personalizado para acceder al contexto de tareas
 * Debe ser usado dentro de un componente envuelto por TareaProvider
 * @returns {TareaContextType} El contexto de tareas con estado y acciones
 * @throws {Error} Si se usa fuera de un TareaProvider
 * @example
 * ```tsx
 * function MiComponente() {
 *   const { state, actions } = useTareas();
 *   const { tareas, loading } = state;
 *   const { createTarea, updateTarea } = actions;
 *   
 *   // Usar las tareas y acciones...
 * }
 * ```
 */
export const useTareas = () => {
  const context = useContext(TareaContext);
  if (context === undefined) {
    throw new Error('useTareas must be used within a TareaProvider');
  }
  return context;
};