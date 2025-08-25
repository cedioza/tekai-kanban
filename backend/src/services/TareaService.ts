import { TareaRepository } from '../repositories/TareaRepository';
import { Tarea, CreateTareaDto, UpdateTareaDto, EstadoTarea, CreateComentarioDto, Comentario } from '../models/Tarea';

export class TareaService {
  private tareaRepository: TareaRepository;

  constructor() {
    this.tareaRepository = new TareaRepository();
  }

  async createTarea(tareaDto: CreateTareaDto): Promise<Tarea> {
    // Validaciones de negocio
    if (!tareaDto.titulo || tareaDto.titulo.trim().length === 0) {
      throw new Error('El título es requerido');
    }

    if (!tareaDto.descripcion || tareaDto.descripcion.trim().length === 0) {
      throw new Error('La descripción es requerida');
    }

    if (!tareaDto.responsable || tareaDto.responsable.trim().length === 0) {
      throw new Error('El responsable es requerido');
    }

    if (!Object.values(EstadoTarea).includes(tareaDto.estado)) {
      throw new Error('Estado de tarea inválido');
    }

    return await this.tareaRepository.create(tareaDto);
  }

  async getAllTareas(): Promise<Tarea[]> {
    return await this.tareaRepository.findAll();
  }

  async getTareaById(id: number): Promise<Tarea | null> {
    if (!id || id <= 0) {
      throw new Error('ID de tarea inválido');
    }

    return await this.tareaRepository.findById(id);
  }

  async updateTarea(id: number, updateDto: UpdateTareaDto): Promise<Tarea | null> {
    if (!id || id <= 0) {
      throw new Error('ID de tarea inválido');
    }

    // Validar que la tarea existe
    const existingTarea = await this.tareaRepository.findById(id);
    if (!existingTarea) {
      throw new Error('Tarea no encontrada');
    }

    // Validaciones de negocio
    if (updateDto.titulo !== undefined && updateDto.titulo.trim().length === 0) {
      throw new Error('El título no puede estar vacío');
    }

    if (updateDto.descripcion !== undefined && updateDto.descripcion.trim().length === 0) {
      throw new Error('La descripción no puede estar vacía');
    }

    if (updateDto.responsable !== undefined && updateDto.responsable.trim().length === 0) {
      throw new Error('El responsable no puede estar vacío');
    }

    if (updateDto.estado !== undefined && !Object.values(EstadoTarea).includes(updateDto.estado)) {
      throw new Error('Estado de tarea inválido');
    }

    return await this.tareaRepository.update(id, updateDto);
  }

  async deleteTarea(id: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error('ID de tarea inválido');
    }

    // Validar que la tarea existe
    const existingTarea = await this.tareaRepository.findById(id);
    if (!existingTarea) {
      throw new Error('Tarea no encontrada');
    }

    return await this.tareaRepository.delete(id);
  }

  async getTareasByEstado(estado: EstadoTarea): Promise<Tarea[]> {
    const allTareas = await this.tareaRepository.findAll();
    return allTareas.filter(tarea => tarea.estado === estado);
  }

  async getTareasByResponsable(responsable: string): Promise<Tarea[]> {
    if (!responsable || responsable.trim().length === 0) {
      throw new Error('El responsable es requerido');
    }

    const allTareas = await this.tareaRepository.findAll();
    return allTareas.filter(tarea => tarea.responsable.toLowerCase().includes(responsable.toLowerCase()));
  }

  async getEstadisticas(): Promise<{ [key: string]: number }> {
    const allTareas = await this.tareaRepository.findAll();
    const estadisticas: { [key: string]: number } = {};

    // Contar tareas por estado
    Object.values(EstadoTarea).forEach(estado => {
      estadisticas[estado] = allTareas.filter(tarea => tarea.estado === estado).length;
    });

    // Contar tareas por responsable
    const responsables = [...new Set(allTareas.map(tarea => tarea.responsable))];
    responsables.forEach(responsable => {
      estadisticas[`responsable_${responsable}`] = allTareas.filter(tarea => tarea.responsable === responsable).length;
    });

    return estadisticas;
  }

  async createComentario(comentarioDto: CreateComentarioDto): Promise<Comentario> {
    if (!comentarioDto.tareaId || comentarioDto.tareaId <= 0) {
      throw new Error('ID de tarea inválido');
    }

    if (!comentarioDto.autor || comentarioDto.autor.trim().length === 0) {
      throw new Error('El autor es requerido');
    }

    if (!comentarioDto.contenido || comentarioDto.contenido.trim().length === 0) {
      throw new Error('El contenido del comentario es requerido');
    }

    // Validar que la tarea existe
    const existingTarea = await this.tareaRepository.findById(comentarioDto.tareaId);
    if (!existingTarea) {
      throw new Error('Tarea no encontrada');
    }

    return await this.tareaRepository.createComentario(comentarioDto.tareaId, comentarioDto);
  }

  async deleteComentario(id: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error('ID de comentario inválido');
    }

    return await this.tareaRepository.deleteComentario(id);
  }
}