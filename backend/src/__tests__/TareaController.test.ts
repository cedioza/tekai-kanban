import request from 'supertest';
import express from 'express';
import { TareaController } from '../controllers/TareaController';
import { EstadoTarea } from '../models/Tarea';

// Mock del servicio
jest.mock('../services/TareaService');

const app = express();
app.use(express.json());

const tareaController = new TareaController();

// Configurar rutas
app.get('/api/tareas', tareaController.getAllTareas.bind(tareaController));
app.get('/api/tareas/:id', tareaController.getTareaById.bind(tareaController));
app.post('/api/tareas', tareaController.createTarea.bind(tareaController));
app.put('/api/tareas/:id', tareaController.updateTarea.bind(tareaController));
app.delete('/api/tareas/:id', tareaController.deleteTarea.bind(tareaController));

describe('TareaController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/tareas', () => {
    it('debería crear una nueva tarea', async () => {
      const nuevaTarea = {
        titulo: 'Nueva tarea',
        descripcion: 'Descripción de la nueva tarea',
        estado: EstadoTarea.CREADA,
        responsable: 'Juan Pérez'
      };

      const tareaCreada = {
        id: 1,
        ...nuevaTarea,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      };

      // Mock del servicio
      const mockCreateTarea = jest.fn().mockResolvedValue(tareaCreada);
      (tareaController as any).tareaService.createTarea = mockCreateTarea;

      const response = await request(app)
        .post('/api/tareas')
        .send(nuevaTarea)
        .expect(201);

      expect(response.body).toEqual(tareaCreada);
      expect(mockCreateTarea).toHaveBeenCalledWith(nuevaTarea);
    });

    it('debería retornar error 400 para datos inválidos', async () => {
      const tareaInvalida = {
        titulo: '',
        descripcion: 'Descripción',
        estado: EstadoTarea.CREADA,
        responsable: 'Juan Pérez'
      };

      const mockCreateTarea = jest.fn().mockRejectedValue(new Error('El título es requerido'));
      (tareaController as any).tareaService.createTarea = mockCreateTarea;

      const response = await request(app)
        .post('/api/tareas')
        .send(tareaInvalida)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('El título es requerido');
    });
  });

  describe('GET /api/tareas', () => {
    it('debería obtener todas las tareas', async () => {
      const mockTareas = [
        {
          id: 1,
          titulo: 'Tarea 1',
          descripcion: 'Descripción 1',
          estado: EstadoTarea.CREADA,
          responsable: 'Juan Pérez',
          fechaCreacion: new Date().toISOString(),
          fechaActualizacion: new Date().toISOString()
        },
        {
          id: 2,
          titulo: 'Tarea 2',
          descripcion: 'Descripción 2',
          estado: EstadoTarea.EN_PROGRESO,
          responsable: 'María García',
          fechaCreacion: new Date().toISOString(),
          fechaActualizacion: new Date().toISOString()
        }
      ];

      const mockGetAllTareas = jest.fn().mockResolvedValue(mockTareas);
      (tareaController as any).tareaService.getAllTareas = mockGetAllTareas;

      const response = await request(app)
        .get('/api/tareas')
        .expect(200);

      expect(response.body).toEqual(mockTareas);
      expect(mockGetAllTareas).toHaveBeenCalled();
    });
  });

  describe('GET /api/tareas/:id', () => {
    it('debería obtener una tarea por ID', async () => {
      const tareaId = 1;
      const mockTarea = {
        id: tareaId,
        titulo: 'Tarea de prueba',
        descripcion: 'Descripción de prueba',
        estado: EstadoTarea.CREADA,
        responsable: 'Juan Pérez',
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      };

      const mockGetTareaById = jest.fn().mockResolvedValue(mockTarea);
      (tareaController as any).tareaService.getTareaById = mockGetTareaById;

      const response = await request(app)
        .get(`/api/tareas/${tareaId}`)
        .expect(200);

      expect(response.body).toEqual(mockTarea);
      expect(mockGetTareaById).toHaveBeenCalledWith(tareaId);
    });

    it('debería retornar error 404 para tarea no encontrada', async () => {
      const tareaId = 999;
      const mockGetTareaById = jest.fn().mockResolvedValue(null);
      (tareaController as any).tareaService.getTareaById = mockGetTareaById;

      const response = await request(app)
        .get(`/api/tareas/${tareaId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Tarea no encontrada');
    });
  });

  describe('PUT /api/tareas/:id', () => {
    it('debería actualizar una tarea (mover estado)', async () => {
      const tareaId = 1;
      const datosActualizacion = {
        estado: EstadoTarea.EN_PROGRESO
      };

      const tareaActualizada = {
        id: tareaId,
        titulo: 'Tarea de prueba',
        descripcion: 'Descripción',
        estado: EstadoTarea.EN_PROGRESO,
        responsable: 'Juan Pérez',
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      };

      const mockUpdateTarea = jest.fn().mockResolvedValue(tareaActualizada);
      (tareaController as any).tareaService.updateTarea = mockUpdateTarea;

      const response = await request(app)
        .put(`/api/tareas/${tareaId}`)
        .send(datosActualizacion)
        .expect(200);

      expect(response.body).toEqual(tareaActualizada);
      expect(mockUpdateTarea).toHaveBeenCalledWith(tareaId, datosActualizacion);
    });

    it('debería actualizar título y descripción de una tarea', async () => {
      const tareaId = 1;
      const datosActualizacion = {
        titulo: 'Título actualizado',
        descripcion: 'Descripción actualizada'
      };

      const tareaActualizada = {
        id: tareaId,
        titulo: 'Título actualizado',
        descripcion: 'Descripción actualizada',
        estado: EstadoTarea.CREADA,
        responsable: 'Juan Pérez',
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      };

      const mockUpdateTarea = jest.fn().mockResolvedValue(tareaActualizada);
      (tareaController as any).tareaService.updateTarea = mockUpdateTarea;

      const response = await request(app)
        .put(`/api/tareas/${tareaId}`)
        .send(datosActualizacion)
        .expect(200);

      expect(response.body).toEqual(tareaActualizada);
      expect(mockUpdateTarea).toHaveBeenCalledWith(tareaId, datosActualizacion);
    });

    it('debería retornar error 400 para datos inválidos en actualización', async () => {
      const tareaId = 1;
      const datosInvalidos = {
        titulo: ''
      };

      const mockUpdateTarea = jest.fn().mockRejectedValue(new Error('El título no puede estar vacío'));
      (tareaController as any).tareaService.updateTarea = mockUpdateTarea;

      const response = await request(app)
        .put(`/api/tareas/${tareaId}`)
        .send(datosInvalidos)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('El título no puede estar vacío');
    });
  });

  describe('DELETE /api/tareas/:id', () => {
    it('debería eliminar una tarea', async () => {
      const tareaId = 1;
      const mockDeleteTarea = jest.fn().mockResolvedValue(true);
      (tareaController as any).tareaService.deleteTarea = mockDeleteTarea;

      const response = await request(app)
        .delete(`/api/tareas/${tareaId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Tarea eliminada exitosamente');
      expect(mockDeleteTarea).toHaveBeenCalledWith(tareaId);
    });

    it('debería retornar error 404 para tarea no encontrada en eliminación', async () => {
      const tareaId = 999;
      const mockDeleteTarea = jest.fn().mockResolvedValue(false);
      (tareaController as any).tareaService.deleteTarea = mockDeleteTarea;

      const response = await request(app)
        .delete(`/api/tareas/${tareaId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Tarea no encontrada');
    });
  });
});