import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Tarea, EstadoTarea, CreateTareaDto, UpdateTareaDto, CreateComentarioDto } from '../types/Tarea';
import { tareaApi } from '../services/api';
import toast from 'react-hot-toast';

interface TareaState {
  tareas: Tarea[];
  loading: boolean;
  error: string | null;
}

type TareaAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TAREAS'; payload: Tarea[] }
  | { type: 'ADD_TAREA'; payload: Tarea }
  | { type: 'UPDATE_TAREA'; payload: Tarea }
  | { type: 'DELETE_TAREA'; payload: number }
  | { type: 'SET_ERROR'; payload: string | null };

interface TareaContextType {
  state: TareaState;
  actions: {
    loadTareas: () => Promise<void>;
    createTarea: (tarea: CreateTareaDto) => Promise<void>;
    updateTarea: (id: number, updates: UpdateTareaDto) => Promise<void>;
    deleteTarea: (id: number) => Promise<void>;
    moveTarea: (id: number, newEstado: EstadoTarea) => Promise<void>;
    createComentario: (tareaId: number, comentario: CreateComentarioDto) => Promise<void>;
    addComment: (tareaId: number, comentario: CreateComentarioDto) => Promise<void>;
    deleteComentario: (comentarioId: number) => Promise<void>;
  };
}

const initialState: TareaState = {
  tareas: [],
  loading: false,
  error: null,
};

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

const TareaContext = createContext<TareaContextType | undefined>(undefined);

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
      // Encontrar la tarea actual para mostrar información en el toast
      const tarea = state.tareas.find(t => t.id === id);
      const tareaTitle = tarea?.titulo || `Tarea #${id}`;
      
      console.log('🔄 Moviendo tarea:', { id, newEstado, tareaTitle });
      
      // Actualizar la tarea con el nuevo estado
      const updatedTarea = await tareaApi.updateTarea(id, { estado: newEstado });
      
      // Actualizar el estado local
      dispatch({ type: 'UPDATE_TAREA', payload: updatedTarea });
      
      // Mostrar mensaje de éxito
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
      // Recargar la tarea específica para obtener los comentarios actualizados
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
      // Recargar las tareas para obtener los comentarios actualizados
      await loadTareas();
      toast.success('Comentario eliminado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar comentario';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error('Error al eliminar el comentario');
      throw error;
    }
  };

  // Cargar tareas al montar el componente
  useEffect(() => {
    loadTareas();
  }, []);

  const actions = {
    loadTareas,
    createTarea,
    updateTarea,
    deleteTarea,
    moveTarea,
    createComentario,
    addComment: createComentario, // Alias para compatibilidad
    deleteComentario,
  };

  return (
    <TareaContext.Provider value={{ state, actions }}>
      {children}
    </TareaContext.Provider>
  );
}

export const useTareas = () => {
  const context = useContext(TareaContext);
  if (context === undefined) {
    throw new Error('useTareas must be used within a TareaProvider');
  }
  return context;
};