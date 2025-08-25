import axios from 'axios';
import { Tarea, CreateTareaDto, UpdateTareaDto, EstadoTarea, CreateComentarioDto, Comentario } from '../types/Tarea';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logging de requests
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para logging de responses
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const tareaApi = {
  // Crear nueva tarea
  async createTarea(tarea: CreateTareaDto): Promise<Tarea> {
    const response = await api.post<Tarea>('/tareas', tarea);
    return response.data;
  },

  // Obtener todas las tareas
  async getAllTareas(): Promise<Tarea[]> {
    const response = await api.get<Tarea[]>('/tareas');
    return response.data;
  },

  // Obtener tarea por ID
  async getTareaById(id: number): Promise<Tarea> {
    const response = await api.get<Tarea>(`/tareas/${id}`);
    return response.data;
  },

  // Actualizar tarea
  async updateTarea(id: number, updates: UpdateTareaDto): Promise<Tarea> {
    const response = await api.put<Tarea>(`/tareas/${id}`, updates);
    return response.data;
  },

  // Eliminar tarea
  async deleteTarea(id: number): Promise<void> {
    await api.delete(`/tareas/${id}`);
  },

  // Obtener tareas por estado
  async getTareasByEstado(estado: EstadoTarea): Promise<Tarea[]> {
    const response = await api.get<Tarea[]>(`/tareas/estado/${estado}`);
    return response.data;
  },

  // Obtener tareas por responsable
  async getTareasByResponsable(responsable: string): Promise<Tarea[]> {
    const response = await api.get<Tarea[]>(`/tareas/responsable/${responsable}`);
    return response.data;
  },

  // Obtener estadísticas
  async getEstadisticas(): Promise<{ [key: string]: number }> {
    const response = await api.get<{ [key: string]: number }>('/estadisticas');
    return response.data;
  },

  // Health check
  async healthCheck(): Promise<{ status: string; message: string; timestamp: string }> {
    const response = await axios.get(`http://localhost:3000/health`);
    return response.data;
  },

  // Crear comentario
  async createComentario(tareaId: number, comentario: CreateComentarioDto): Promise<Comentario> {
    const response = await api.post<Comentario>(`/tareas/${tareaId}/comentarios`, comentario);
    return response.data;
  },

  // Eliminar comentario
  async deleteComentario(comentarioId: number): Promise<void> {
    await api.delete(`/comentarios/${comentarioId}`);
  }
};

export default api;