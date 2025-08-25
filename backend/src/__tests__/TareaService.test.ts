import { TareaService } from '../services/TareaService';
import { CreateTareaDto, EstadoTarea } from '../models/Tarea';

// Mock del repositorio
jest.mock('../repositories/TareaRepository');

describe('TareaService', () => {
  let tareaService: TareaService;

  beforeEach(() => {
    tareaService = new TareaService();
  });

  describe('createTarea', () => {
    it('debería crear una tarea válida', async () => {
      const tareaDto: CreateTareaDto = {
        titulo: 'Tarea de prueba',
        descripcion: 'Descripción de prueba',
        estado: EstadoTarea.CREADA,
        responsable: 'Juan Pérez'
      };

      // Mock del método create del repositorio
      const mockCreate = jest.fn().mockResolvedValue({
        id: 1,
        ...tareaDto,
        fechaCreacion: new Date().toISOString()
      });

      (tareaService as any).tareaRepository.create = mockCreate;

      const result = await tareaService.createTarea(tareaDto);

      expect(mockCreate).toHaveBeenCalledWith(tareaDto);
      expect(result).toHaveProperty('id');
      expect(result.titulo).toBe(tareaDto.titulo);
    });

    it('debería lanzar error si el título está vacío', async () => {
      const tareaDto: CreateTareaDto = {
        titulo: '',
        descripcion: 'Descripción de prueba',
        estado: EstadoTarea.CREADA,
        responsable: 'Juan Pérez'
      };

      await expect(tareaService.createTarea(tareaDto))
        .rejects
        .toThrow('El título es requerido');
    });

    it('debería lanzar error si la descripción está vacía', async () => {
      const tareaDto: CreateTareaDto = {
        titulo: 'Tarea de prueba',
        descripcion: '',
        estado: EstadoTarea.CREADA,
        responsable: 'Juan Pérez'
      };

      await expect(tareaService.createTarea(tareaDto))
        .rejects
        .toThrow('La descripción es requerida');
    });

    it('debería lanzar error si el responsable está vacío', async () => {
      const tareaDto: CreateTareaDto = {
        titulo: 'Tarea de prueba',
        descripcion: 'Descripción de prueba',
        estado: EstadoTarea.CREADA,
        responsable: ''
      };

      await expect(tareaService.createTarea(tareaDto))
        .rejects
        .toThrow('El responsable es requerido');
    });
  });

  describe('getTareaById', () => {
    it('debería lanzar error para ID inválido', async () => {
      await expect(tareaService.getTareaById(0))
        .rejects
        .toThrow('ID de tarea inválido');

      await expect(tareaService.getTareaById(-1))
        .rejects
        .toThrow('ID de tarea inválido');
    });
  });

  describe('updateTarea', () => {
    it('debería lanzar error para ID inválido', async () => {
      await expect(tareaService.updateTarea(0, { titulo: 'Nuevo título' }))
        .rejects
        .toThrow('ID de tarea inválido');
    });
  });

  describe('deleteTarea', () => {
    it('debería lanzar error para ID inválido', async () => {
      await expect(tareaService.deleteTarea(0))
        .rejects
        .toThrow('ID de tarea inválido');
    });
  });

  describe('moverTarea', () => {
    it('debería mover una tarea a un nuevo estado válido', async () => {
      const tareaId = 1;
      const nuevoEstado = EstadoTarea.EN_PROGRESO;
      
      const mockTarea = {
        id: tareaId,
        titulo: 'Tarea de prueba',
        descripcion: 'Descripción',
        estado: EstadoTarea.CREADA,
        responsable: 'Juan Pérez',
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      };

      const mockUpdate = jest.fn().mockResolvedValue({
        ...mockTarea,
        estado: nuevoEstado,
        fechaActualizacion: new Date().toISOString()
      });

      (tareaService as any).tareaRepository.update = mockUpdate;

      const result = await tareaService.updateTarea(tareaId, { estado: nuevoEstado });

      expect(mockUpdate).toHaveBeenCalledWith(tareaId, { estado: nuevoEstado });
      expect(result.estado).toBe(nuevoEstado);
    });

    it('debería lanzar error para estado inválido', async () => {
      const tareaId = 1;
      const estadoInvalido = 'ESTADO_INEXISTENTE' as EstadoTarea;

      await expect(tareaService.updateTarea(tareaId, { estado: estadoInvalido }))
        .rejects
        .toThrow('Estado de tarea inválido');
    });

    it('debería lanzar error para ID inválido en movimiento', async () => {
      await expect(tareaService.updateTarea(0, { estado: EstadoTarea.EN_PROGRESO }))
        .rejects
        .toThrow('ID de tarea inválido');
    });
  });

  describe('editarTarea', () => {
    it('debería editar título y descripción de una tarea', async () => {
      const tareaId = 1;
      const datosActualizacion = {
        titulo: 'Título actualizado',
        descripcion: 'Descripción actualizada'
      };
      
      const mockTarea = {
        id: tareaId,
        titulo: 'Título original',
        descripcion: 'Descripción original',
        estado: EstadoTarea.CREADA,
        responsable: 'Juan Pérez',
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      };

      const mockUpdate = jest.fn().mockResolvedValue({
        ...mockTarea,
        ...datosActualizacion,
        fechaActualizacion: new Date().toISOString()
      });

      (tareaService as any).tareaRepository.update = mockUpdate;

      const result = await tareaService.updateTarea(tareaId, datosActualizacion);

      expect(mockUpdate).toHaveBeenCalledWith(tareaId, datosActualizacion);
      expect(result.titulo).toBe(datosActualizacion.titulo);
      expect(result.descripcion).toBe(datosActualizacion.descripcion);
    });

    it('debería editar responsable y prioridad', async () => {
      const tareaId = 1;
      const datosActualizacion = {
        responsable: 'María García',
        prioridad: 'Alta'
      };
      
      const mockUpdate = jest.fn().mockResolvedValue({
        id: tareaId,
        titulo: 'Tarea de prueba',
        descripcion: 'Descripción',
        estado: EstadoTarea.CREADA,
        ...datosActualizacion,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      });

      (tareaService as any).tareaRepository.update = mockUpdate;

      const result = await tareaService.updateTarea(tareaId, datosActualizacion);

      expect(mockUpdate).toHaveBeenCalledWith(tareaId, datosActualizacion);
      expect(result.responsable).toBe(datosActualizacion.responsable);
      expect(result.prioridad).toBe(datosActualizacion.prioridad);
    });

    it('debería lanzar error al editar con título vacío', async () => {
      const tareaId = 1;
      const datosInvalidos = { titulo: '' };

      await expect(tareaService.updateTarea(tareaId, datosInvalidos))
        .rejects
        .toThrow('El título no puede estar vacío');
    });

    it('debería lanzar error al editar con descripción vacía', async () => {
      const tareaId = 1;
      const datosInvalidos = { descripcion: '' };

      await expect(tareaService.updateTarea(tareaId, datosInvalidos))
        .rejects
        .toThrow('La descripción no puede estar vacía');
    });

    it('debería lanzar error al editar con responsable vacío', async () => {
      const tareaId = 1;
      const datosInvalidos = { responsable: '' };

      await expect(tareaService.updateTarea(tareaId, datosInvalidos))
        .rejects
        .toThrow('El responsable no puede estar vacío');
    });
  });

  describe('getAllTareas', () => {
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

      const mockFindAll = jest.fn().mockResolvedValue(mockTareas);
      (tareaService as any).tareaRepository.findAll = mockFindAll;

      const result = await tareaService.getAllTareas();

      expect(mockFindAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].titulo).toBe('Tarea 1');
      expect(result[1].titulo).toBe('Tarea 2');
    });

    it('debería retornar array vacío cuando no hay tareas', async () => {
      const mockFindAll = jest.fn().mockResolvedValue([]);
      (tareaService as any).tareaRepository.findAll = mockFindAll;

      const result = await tareaService.getAllTareas();

      expect(mockFindAll).toHaveBeenCalled();
      expect(result).toHaveLength(0);
    });
  });
});