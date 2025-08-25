/**
 * @fileoverview Cliente API para comunicación con el backend de TEKAI Kanban
 * Proporciona métodos para CRUD de tareas, comentarios y estadísticas
 * @author TEKAI Team
 * @version 1.0.0
 */

import axios from 'axios';
import { Tarea, CreateTareaDto, UpdateTareaDto, EstadoTarea, CreateComentarioDto, Comentario } from '../../domain/entities/Tarea';

/** URL base de la API del backend */
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Instancia configurada de Axios para realizar peticiones HTTP
 * Incluye configuración base y interceptores para logging
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor para logging de peticiones HTTP salientes
 * Registra información de debug para todas las peticiones realizadas
 */
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

/**
 * Interceptor para logging de respuestas HTTP entrantes
 * Registra información de debug y errores para todas las respuestas recibidas
 */
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

/**
 * API cliente para operaciones relacionadas con tareas
 * Proporciona métodos para CRUD completo y consultas especializadas
 */
export const tareaApi = {
  /**
   * Crea una nueva tarea en el sistema
   * 
   * @async
   * @function createTarea
   * @param {CreateTareaDto} tarea - Datos de la tarea a crear
   * @returns {Promise<Tarea>} Tarea creada con ID asignado
   * @throws {Error} Si la creación falla
   */
  async createTarea(tarea: CreateTareaDto): Promise<Tarea> {
    const response = await api.post<Tarea>('/tareas', tarea);
    return response.data;
  },

  /**
   * Obtiene todas las tareas del sistema
   * 
   * @async
   * @function getAllTareas
   * @returns {Promise<Tarea[]>} Lista completa de tareas
   * @throws {Error} Si la consulta falla
   */
  async getAllTareas(): Promise<Tarea[]> {
    const response = await api.get<Tarea[]>('/tareas');
    return response.data;
  },

  /**
   * Obtiene una tarea específica por su ID
   * 
   * @async
   * @function getTareaById
   * @param {number} id - ID único de la tarea
   * @returns {Promise<Tarea>} Tarea encontrada
   * @throws {Error} Si la tarea no existe o la consulta falla
   */
  async getTareaById(id: number): Promise<Tarea> {
    const response = await api.get<Tarea>(`/tareas/${id}`);
    return response.data;
  },

  /**
   * Actualiza una tarea existente
   * 
   * @async
   * @function updateTarea
   * @param {number} id - ID de la tarea a actualizar
   * @param {UpdateTareaDto} updates - Campos a actualizar
   * @returns {Promise<Tarea>} Tarea actualizada
   * @throws {Error} Si la actualización falla
   */
  async updateTarea(id: number, updates: UpdateTareaDto): Promise<Tarea> {
    const response = await api.put<Tarea>(`/tareas/${id}`, updates);
    return response.data;
  },

  /**
   * Elimina una tarea del sistema
   * 
   * @async
   * @function deleteTarea
   * @param {number} id - ID de la tarea a eliminar
   * @returns {Promise<void>}
   * @throws {Error} Si la eliminación falla
   */
  async deleteTarea(id: number): Promise<void> {
    await api.delete(`/tareas/${id}`);
  },

  /**
   * Obtiene tareas filtradas por estado
   * 
   * @async
   * @function getTareasByEstado
   * @param {EstadoTarea} estado - Estado de las tareas a filtrar
   * @returns {Promise<Tarea[]>} Lista de tareas con el estado especificado
   * @throws {Error} Si la consulta falla
   */
  async getTareasByEstado(estado: EstadoTarea): Promise<Tarea[]> {
    const response = await api.get<Tarea[]>(`/tareas/estado/${estado}`);
    return response.data;
  },

  /**
   * Obtiene tareas asignadas a un responsable específico
   * 
   * @async
   * @function getTareasByResponsable
   * @param {string} responsable - Nombre del responsable
   * @returns {Promise<Tarea[]>} Lista de tareas asignadas al responsable
   * @throws {Error} Si la consulta falla
   */
  async getTareasByResponsable(responsable: string): Promise<Tarea[]> {
    const response = await api.get<Tarea[]>(`/tareas/responsable/${responsable}`);
    return response.data;
  },

  /**
   * Obtiene estadísticas generales del sistema
   * 
   * @async
   * @function getEstadisticas
   * @returns {Promise<{[key: string]: number}>} Objeto con métricas del sistema
   * @throws {Error} Si la consulta falla
   */
  async getEstadisticas(): Promise<{ [key: string]: number }> {
    const response = await api.get<{ [key: string]: number }>('/estadisticas');
    return response.data;
  },

  /**
   * Verifica el estado de salud del servidor backend
   * 
   * @async
   * @function healthCheck
   * @returns {Promise<{status: string; message: string; timestamp: string}>} Estado del servidor
   * @throws {Error} Si el servidor no responde
   */
  async healthCheck(): Promise<{ status: string; message: string; timestamp: string }> {
    const response = await axios.get(`http://localhost:3000/health`);
    return response.data;
  },

  /**
   * Crea un nuevo comentario en una tarea
   * 
   * @async
   * @function createComentario
   * @param {number} tareaId - ID de la tarea donde agregar el comentario
   * @param {CreateComentarioDto} comentario - Datos del comentario a crear
   * @returns {Promise<Comentario>} Comentario creado con ID asignado
   * @throws {Error} Si la creación falla
   */
  async createComentario(tareaId: number, comentario: CreateComentarioDto): Promise<Comentario> {
    const response = await api.post<Comentario>(`/tareas/${tareaId}/comentarios`, comentario);
    return response.data;
  },

  /**
   * Elimina un comentario del sistema
   * 
   * @async
   * @function deleteComentario
   * @param {number} comentarioId - ID del comentario a eliminar
   * @returns {Promise<void>}
   * @throws {Error} Si la eliminación falla
   */
  async deleteComentario(comentarioId: number): Promise<void> {
    await api.delete(`/comentarios/${comentarioId}`);
  }
};

export default api;