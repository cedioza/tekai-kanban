import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { responsableApi } from '../../infrastructure/api/responsableApi';
import { Responsable, CreateResponsableDto, UpdateResponsableDto } from '../../domain/entities/Responsable';
import { toast } from 'react-hot-toast';

interface ResponsableState {
  responsables: Responsable[];
  loading: boolean;
  error: string | null;
}

type ResponsableAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RESPONSABLES'; payload: Responsable[] }
  | { type: 'ADD_RESPONSABLE'; payload: Responsable }
  | { type: 'UPDATE_RESPONSABLE'; payload: Responsable }
  | { type: 'DELETE_RESPONSABLE'; payload: number }
  | { type: 'SET_ERROR'; payload: string | null };

interface ResponsableContextType {
  state: ResponsableState;
  actions: {
    loadResponsables: () => Promise<void>;
    createResponsable: (responsable: CreateResponsableDto) => Promise<Responsable | null>;
    updateResponsable: (id: number, responsable: UpdateResponsableDto) => Promise<Responsable | null>;
    deleteResponsable: (id: number) => Promise<boolean>;
    getActiveResponsables: () => Responsable[];
    getResponsableNames: () => string[];
  };
}

const initialState: ResponsableState = {
  responsables: [],
  loading: false,
  error: null,
};

function responsableReducer(state: ResponsableState, action: ResponsableAction): ResponsableState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_RESPONSABLES':
      return { ...state, responsables: action.payload, loading: false, error: null };
    case 'ADD_RESPONSABLE':
      return { ...state, responsables: [...state.responsables, action.payload] };
    case 'UPDATE_RESPONSABLE':
      return {
        ...state,
        responsables: state.responsables.map(r => 
          r.id === action.payload.id ? action.payload : r
        )
      };
    case 'DELETE_RESPONSABLE':
      return {
        ...state,
        responsables: state.responsables.filter(r => r.id !== action.payload)
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

const ResponsableContext = createContext<ResponsableContextType | undefined>(undefined);

export const ResponsableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(responsableReducer, initialState);

  const loadResponsables = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const responsables = await responsableApi.getAll();
      dispatch({ type: 'SET_RESPONSABLES', payload: responsables });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar responsables';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  const createResponsable = async (responsableData: CreateResponsableDto): Promise<Responsable | null> => {
    try {
      const newResponsable = await responsableApi.create(responsableData);
      dispatch({ type: 'ADD_RESPONSABLE', payload: newResponsable });
      toast.success('Responsable creado exitosamente');
      return newResponsable;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear responsable';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return null;
    }
  };

  const updateResponsable = async (id: number, responsableData: UpdateResponsableDto): Promise<Responsable | null> => {
    try {
      const updatedResponsable = await responsableApi.update(id, responsableData);
      dispatch({ type: 'UPDATE_RESPONSABLE', payload: updatedResponsable });
      toast.success('Responsable actualizado exitosamente');
      return updatedResponsable;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar responsable';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return null;
    }
  };

  const deleteResponsable = async (id: number): Promise<boolean> => {
    try {
      await responsableApi.delete(id);
      dispatch({ type: 'DELETE_RESPONSABLE', payload: id });
      toast.success('Responsable eliminado exitosamente');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar responsable';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  };

  const getActiveResponsables = (): Responsable[] => {
    return state.responsables.filter(r => r.activo);
  };

  const getResponsableNames = (): string[] => {
    return getActiveResponsables().map(r => r.nombre);
  };

  useEffect(() => {
    loadResponsables();
  }, []);

  const contextValue: ResponsableContextType = {
    state,
    actions: {
      loadResponsables,
      createResponsable,
      updateResponsable,
      deleteResponsable,
      getActiveResponsables,
      getResponsableNames,
    },
  };

  return (
    <ResponsableContext.Provider value={contextValue}>
      {children}
    </ResponsableContext.Provider>
  );
};

export const useResponsables = (): ResponsableContextType => {
  const context = useContext(ResponsableContext);
  if (context === undefined) {
    throw new Error('useResponsables must be used within a ResponsableProvider');
  }
  return context;
};

export default ResponsableContext;