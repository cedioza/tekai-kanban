import { Request, Response } from 'express';
import { TareaService } from '../services/TareaService';
import { CreateTareaDto, UpdateTareaDto, EstadoTarea, CreateComentarioDto } from '../models/Tarea';

export class TareaController {
  private tareaService: TareaService;

  constructor() {
    this.tareaService = new TareaService();
  }

  // POST /api/tareas
  createTarea = async (req: Request, res: Response): Promise<void> => {
    try {
      const tareaDto: CreateTareaDto = req.body;
      const nuevaTarea = await this.tareaService.createTarea(tareaDto);
      res.status(201).json(nuevaTarea);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  };

  // GET /api/tareas
  getAllTareas = async (req: Request, res: Response): Promise<void> => {
    try {
      const tareas = await this.tareaService.getAllTareas();
      res.status(200).json(tareas);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  };

  // GET /api/tareas/:id
  getTareaById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const tarea = await this.tareaService.getTareaById(id);
      
      if (!tarea) {
        res.status(404).json({ error: 'Tarea no encontrada' });
        return;
      }
      
      res.status(200).json(tarea);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  };

  // PUT /api/tareas/:id
  updateTarea = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const updateDto: UpdateTareaDto = req.body;
      
      // Logging detallado para debugging
      console.log('🔍 PUT /api/tareas/:id - Datos recibidos:');
      console.log('  - ID:', id);
      console.log('  - Body:', JSON.stringify(updateDto, null, 2));
      console.log('  - Headers:', req.headers['content-type']);
      
      const tareaActualizada = await this.tareaService.updateTarea(id, updateDto);
      
      if (!tareaActualizada) {
        console.log('❌ Tarea no encontrada con ID:', id);
        res.status(404).json({ error: 'Tarea no encontrada' });
        return;
      }
      
      console.log('✅ Tarea actualizada exitosamente:', tareaActualizada.id);
      res.status(200).json(tareaActualizada);
    } catch (error) {
      console.log('❌ Error en updateTarea:');
      console.log('  - Error:', error);
      console.log('  - Stack:', error instanceof Error ? error.stack : 'No stack available');
      
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  };

  // DELETE /api/tareas/:id
  deleteTarea = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const eliminada = await this.tareaService.deleteTarea(id);
      
      if (!eliminada) {
        res.status(404).json({ error: 'Tarea no encontrada' });
        return;
      }
      
      res.status(200).json({ message: 'Tarea eliminada exitosamente' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  };

  // GET /api/tareas/estado/:estado
  getTareasByEstado = async (req: Request, res: Response): Promise<void> => {
    try {
      const estado = req.params.estado as EstadoTarea;
      
      if (!Object.values(EstadoTarea).includes(estado)) {
        res.status(400).json({ error: 'Estado de tarea inválido' });
        return;
      }
      
      const tareas = await this.tareaService.getTareasByEstado(estado);
      res.status(200).json(tareas);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  };

  // GET /api/tareas/responsable/:responsable
  getTareasByResponsable = async (req: Request, res: Response): Promise<void> => {
    try {
      const responsable = req.params.responsable;
      const tareas = await this.tareaService.getTareasByResponsable(responsable);
      res.status(200).json(tareas);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  };

  // GET /api/tareas/estadisticas
  getEstadisticas = async (req: Request, res: Response): Promise<void> => {
    try {
      const estadisticas = await this.tareaService.getEstadisticas();
      res.status(200).json(estadisticas);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  };

  // POST /api/tareas/:id/comentarios
  createComentario = async (req: Request, res: Response): Promise<void> => {
    try {
      const tareaId = parseInt(req.params.id);
      const comentarioDto: CreateComentarioDto = {
        ...req.body,
        tareaId
      };
      
      const nuevoComentario = await this.tareaService.createComentario(comentarioDto);
      res.status(201).json(nuevoComentario);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  };

  // DELETE /api/comentarios/:id
  deleteComentario = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const eliminado = await this.tareaService.deleteComentario(id);
      
      if (!eliminado) {
        res.status(404).json({ error: 'Comentario no encontrado' });
        return;
      }
      
      res.status(200).json({ message: 'Comentario eliminado exitosamente' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  };
}