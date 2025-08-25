// React Context for Activity Management
import { createContext, useContext, useReducer, ReactNode } from 'react';
import { ActividadHistorial, TipoActividad, NotificacionActividad } from '../types/Tarea';
import { toast } from 'react-hot-toast';

interface ActivityState {
  actividades: ActividadHistorial[];
  notificaciones: NotificacionActividad[];
  notificacionesNoLeidas: number;
}

type ActivityAction =
  | { type: 'ADD_ACTIVIDAD'; payload: ActividadHistorial }
  | { type: 'SET_ACTIVIDADES'; payload: ActividadHistorial[] }
  | { type: 'ADD_NOTIFICACION'; payload: NotificacionActividad }
  | { type: 'MARCAR_NOTIFICACION_LEIDA'; payload: string }
  | { type: 'MARCAR_TODAS_LEIDAS' }
  | { type: 'SET_NOTIFICACIONES'; payload: NotificacionActividad[] };

interface ActivityContextType {
  state: ActivityState;
  actions: {
    registrarActividad: (actividad: Omit<ActividadHistorial, 'id' | 'fecha'>) => void;
    obtenerActividadesPorTarea: (tareaId: number) => ActividadHistorial[];
    marcarNotificacionLeida: (notificacionId: string) => void;
    marcarTodasLeidas: () => void;
    obtenerActividadesRecientes: (limite?: number) => ActividadHistorial[];
  };
}

const initialState: ActivityState = {
  actividades: [],
  notificaciones: [],
  notificacionesNoLeidas: 0,
};

function activityReducer(state: ActivityState, action: ActivityAction): ActivityState {
  switch (action.type) {
    case 'ADD_ACTIVIDAD':
      const nuevaActividad = action.payload;
      const nuevaNotificacion: NotificacionActividad = {
        id: `notif_${Date.now()}_${Math.random()}`,
        actividadId: nuevaActividad.id,
        leida: false,
        fecha: nuevaActividad.fecha,
      };
      
      return {
        ...state,
        actividades: [nuevaActividad, ...state.actividades],
        notificaciones: [nuevaNotificacion, ...state.notificaciones],
        notificacionesNoLeidas: state.notificacionesNoLeidas + 1,
      };
      
    case 'SET_ACTIVIDADES':
      return {
        ...state,
        actividades: action.payload,
      };
      
    case 'ADD_NOTIFICACION':
      return {
        ...state,
        notificaciones: [action.payload, ...state.notificaciones],
        notificacionesNoLeidas: action.payload.leida ? state.notificacionesNoLeidas : state.notificacionesNoLeidas + 1,
      };
      
    case 'MARCAR_NOTIFICACION_LEIDA':
      return {
        ...state,
        notificaciones: state.notificaciones.map(notif =>
          notif.id === action.payload ? { ...notif, leida: true } : notif
        ),
        notificacionesNoLeidas: Math.max(0, state.notificacionesNoLeidas - 1),
      };
      
    case 'MARCAR_TODAS_LEIDAS':
      return {
        ...state,
        notificaciones: state.notificaciones.map(notif => ({ ...notif, leida: true })),
        notificacionesNoLeidas: 0,
      };
      
    case 'SET_NOTIFICACIONES':
      const noLeidas = action.payload.filter(notif => !notif.leida).length;
      return {
        ...state,
        notificaciones: action.payload,
        notificacionesNoLeidas: noLeidas,
      };
      
    default:
      return state;
  }
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(activityReducer, initialState);

  const registrarActividad = (actividad: Omit<ActividadHistorial, 'id' | 'fecha'>) => {
    const nuevaActividad: ActividadHistorial = {
      ...actividad,
      id: `act_${Date.now()}_${Math.random()}`,
      fecha: new Date().toISOString(),
    };
    
    dispatch({ type: 'ADD_ACTIVIDAD', payload: nuevaActividad });
    
    // Mostrar notificación toast para cambios importantes
    if (actividad.tipo === TipoActividad.CAMBIO_ESTADO) {
      toast.success(`Estado cambiado: ${actividad.descripcion}`);
    } else if (actividad.tipo === TipoActividad.CREACION) {
      toast.success('Nueva tarea creada');
    }
  };

  const obtenerActividadesPorTarea = (tareaId: number): ActividadHistorial[] => {
    return state.actividades.filter(actividad => actividad.tareaId === tareaId);
  };

  const marcarNotificacionLeida = (notificacionId: string) => {
    dispatch({ type: 'MARCAR_NOTIFICACION_LEIDA', payload: notificacionId });
  };

  const marcarTodasLeidas = () => {
    dispatch({ type: 'MARCAR_TODAS_LEIDAS' });
  };

  const obtenerActividadesRecientes = (limite: number = 10): ActividadHistorial[] => {
    return state.actividades
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, limite);
  };

  const actions = {
    registrarActividad,
    obtenerActividadesPorTarea,
    marcarNotificacionLeida,
    marcarTodasLeidas,
    obtenerActividadesRecientes,
  };

  return (
    <ActivityContext.Provider value={{ state, actions }}>
      {children}
    </ActivityContext.Provider>
  );
}

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};