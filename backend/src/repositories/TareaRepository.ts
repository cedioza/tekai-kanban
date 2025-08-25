import { Pool, PoolClient } from 'pg';
import { Tarea, CreateTareaDto, UpdateTareaDto, EstadoTarea } from '../models/Tarea';
import { ResponsableRepository } from './ResponsableRepository';

export class TareaRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.POSTGRES_HOST || '127.0.0.1',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'tekai_db',
      user: process.env.POSTGRES_USER || 'tekai_user',
      password: process.env.POSTGRES_PASSWORD || 'tekai_password_2024',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      // Primero inicializar responsables
      const responsableRepo = new ResponsableRepository();
      
      // Crear tabla de tareas (manteniendo responsable como string por ahora)
      const createTareasTableQuery = `
        CREATE TABLE IF NOT EXISTS tareas (
          id SERIAL PRIMARY KEY,
          titulo VARCHAR(255) NOT NULL,
          descripcion TEXT NOT NULL,
          estado VARCHAR(50) NOT NULL,
          responsable VARCHAR(255) NOT NULL,
          fechaCreacion TIMESTAMP NOT NULL,
          fechaVencimiento TIMESTAMP,
          fechaActualizacion TIMESTAMP,
          prioridad VARCHAR(50) NOT NULL DEFAULT 'Media',
          etiquetas JSONB NOT NULL DEFAULT '[]',
          tiempoEstimado INTEGER,
          tiempoTrabajado INTEGER DEFAULT 0
        )
      `;

      const createComentariosTableQuery = `
        CREATE TABLE IF NOT EXISTS comentarios (
          id SERIAL PRIMARY KEY,
          tareaId INTEGER NOT NULL,
          autor VARCHAR(255) NOT NULL,
          contenido TEXT NOT NULL,
          fechaCreacion TIMESTAMP NOT NULL,
          tipo VARCHAR(50) NOT NULL DEFAULT 'comentario',
          FOREIGN KEY (tareaId) REFERENCES tareas (id) ON DELETE CASCADE
        )
      `;

      await this.pool.query(createTareasTableQuery);
      console.log('Tareas table initialized successfully');
      
      await this.pool.query(createComentariosTableQuery);
      console.log('Comentarios table initialized successfully');
      
      // Ejecutar migración para agregar foreign key de responsables
      await this.migrateToResponsablesForeignKey();
      
      console.log('Database initialized successfully');
    } catch (err) {
      console.error('Error initializing database:', err);
    }
  }

  private async migrateToResponsablesForeignKey(): Promise<void> {
    try {
      // Verificar si ya existe la columna responsable_id
      const checkColumnQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'tareas' AND column_name = 'responsable_id'
      `;
      
      const columnResult = await this.pool.query(checkColumnQuery);
      
      if (columnResult.rows.length === 0) {
        console.log('Migrating tareas table to use responsable foreign key...');
        
        // 1. Agregar nueva columna responsable_id
        await this.pool.query(`
          ALTER TABLE tareas 
          ADD COLUMN responsable_id INTEGER
        `);
        
        // 2. Actualizar responsable_id basado en el nombre del responsable
        await this.pool.query(`
          UPDATE tareas 
          SET responsable_id = r.id 
          FROM responsables r 
          WHERE tareas.responsable = r.nombre
        `);
        
        // 3. Agregar foreign key constraint
        await this.pool.query(`
          ALTER TABLE tareas 
          ADD CONSTRAINT fk_tareas_responsable 
          FOREIGN KEY (responsable_id) REFERENCES responsables (id)
        `);
        
        console.log('Migration to responsable foreign key completed successfully');
      } else {
        console.log('Responsable foreign key migration already applied');
      }
    } catch (err) {
      console.error('Error during responsable foreign key migration:', err);
      // No lanzar error para no interrumpir la inicialización
    }
  }

  async create(tareaDto: CreateTareaDto): Promise<Tarea> {
    try {
      const fechaCreacion = new Date();
      const fechaActualizacion = fechaCreacion;
      
      const query = `
        INSERT INTO tareas (
          titulo, descripcion, estado, responsable, fechaCreacion, 
          fechaVencimiento, fechaActualizacion, prioridad, etiquetas, tiempoEstimado
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const result = await this.pool.query(
        query,
        [
          tareaDto.titulo, 
          tareaDto.descripcion, 
          tareaDto.estado, 
          tareaDto.responsable, 
          fechaCreacion,
          tareaDto.fechaVencimiento || null,
          fechaActualizacion,
          tareaDto.prioridad,
          JSON.stringify(tareaDto.etiquetas || []),
          tareaDto.tiempoEstimado || null
        ]
      );

      const row = result.rows[0];
      const newTarea: Tarea = {
        id: row.id,
        titulo: row.titulo,
        descripcion: row.descripcion,
        estado: row.estado,
        responsable: row.responsable,
        fechaCreacion: row.fechacreacion.toISOString(),
        fechaVencimiento: row.fechavencimiento?.toISOString(),
        fechaActualizacion: row.fechaactualizacion.toISOString(),
        prioridad: row.prioridad,
        etiquetas: row.etiquetas || [],
        comentarios: [],
        tiempoEstimado: row.tiempoestimado,
        tiempoTrabajado: row.tiempotrabajado || 0
      };
      return newTarea;
    } catch (error) {
      throw error;
    }
  }

  async findAll(): Promise<Tarea[]> {
    try {
      const query = 'SELECT * FROM tareas ORDER BY fechaCreacion DESC';
      
      const result = await this.pool.query(query);
      const tareas: Tarea[] = await Promise.all(result.rows.map(async (row) => {
        const comentarios = await this.getComentariosByTareaId(row.id);
        return {
          id: row.id,
          titulo: row.titulo,
          descripcion: row.descripcion,
          estado: row.estado as EstadoTarea,
          responsable: row.responsable,
          fechaCreacion: row.fechacreacion.toISOString(),
          fechaVencimiento: row.fechavencimiento?.toISOString(),
          fechaActualizacion: row.fechaactualizacion.toISOString(),
          prioridad: row.prioridad,
          etiquetas: row.etiquetas || [],
          comentarios,
          tiempoEstimado: row.tiempoestimado,
          tiempoTrabajado: row.tiempotrabajado || 0
        };
      }));
      return tareas;
    } catch (error) {
      throw error;
    }
  }

  private async getComentariosByTareaId(tareaId: number): Promise<any[]> {
    try {
      const query = 'SELECT * FROM comentarios WHERE tareaId = $1 ORDER BY fechaCreacion ASC';
      const result = await this.pool.query(query, [tareaId]);
      return result.rows.map(row => ({
        id: row.id,
        tareaId: row.tareaid,
        autor: row.autor,
        contenido: row.contenido,
        fechaCreacion: row.fechacreacion.toISOString(),
        tipo: row.tipo
      }));
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number): Promise<Tarea | null> {
    try {
      const query = 'SELECT * FROM tareas WHERE id = $1';
      
      const result = await this.pool.query(query, [id]);
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const comentarios = await this.getComentariosByTareaId(row.id);
      const tarea: Tarea = {
        id: row.id,
        titulo: row.titulo,
        descripcion: row.descripcion,
        estado: row.estado as EstadoTarea,
        responsable: row.responsable,
        fechaCreacion: row.fechacreacion.toISOString(),
        fechaVencimiento: row.fechavencimiento?.toISOString(),
        fechaActualizacion: row.fechaactualizacion.toISOString(),
        prioridad: row.prioridad,
        etiquetas: row.etiquetas || [],
        comentarios,
        tiempoEstimado: row.tiempoestimado,
        tiempoTrabajado: row.tiempotrabajado || 0
      };
      return tarea;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateDto: UpdateTareaDto): Promise<Tarea | null> {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;
      
      if (updateDto.titulo !== undefined) {
        fields.push(`titulo = $${paramIndex++}`);
        values.push(updateDto.titulo);
      }
      if (updateDto.descripcion !== undefined) {
        fields.push(`descripcion = $${paramIndex++}`);
        values.push(updateDto.descripcion);
      }
      if (updateDto.estado !== undefined) {
        fields.push(`estado = $${paramIndex++}`);
        values.push(updateDto.estado);
      }
      if (updateDto.responsable !== undefined) {
        fields.push(`responsable = $${paramIndex++}`);
        values.push(updateDto.responsable);
      }
      if (updateDto.fechaVencimiento !== undefined) {
        fields.push(`fechaVencimiento = $${paramIndex++}`);
        values.push(updateDto.fechaVencimiento ? new Date(updateDto.fechaVencimiento) : null);
      }
      if (updateDto.prioridad !== undefined) {
        fields.push(`prioridad = $${paramIndex++}`);
        values.push(updateDto.prioridad);
      }
      if (updateDto.etiquetas !== undefined) {
        fields.push(`etiquetas = $${paramIndex++}`);
        values.push(JSON.stringify(updateDto.etiquetas));
      }
      if (updateDto.tiempoEstimado !== undefined) {
        fields.push(`tiempoEstimado = $${paramIndex++}`);
        values.push(updateDto.tiempoEstimado);
      }
      if (updateDto.tiempoTrabajado !== undefined) {
        fields.push(`tiempoTrabajado = $${paramIndex++}`);
        values.push(updateDto.tiempoTrabajado);
      }

      // Always update fechaActualizacion
      fields.push(`fechaActualizacion = $${paramIndex++}`);
      values.push(new Date());

      if (fields.length === 1) { // Only fechaActualizacion
        throw new Error('No fields to update');
      }

      values.push(id);
      const query = `UPDATE tareas SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

      const result = await this.pool.query(query, values);
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const comentarios = await this.getComentariosByTareaId(row.id);
      
      const tarea: Tarea = {
        id: row.id,
        titulo: row.titulo,
        descripcion: row.descripcion,
        estado: row.estado as EstadoTarea,
        responsable: row.responsable,
        fechaCreacion: row.fechacreacion.toISOString(),
        fechaVencimiento: row.fechavencimiento?.toISOString(),
        fechaActualizacion: row.fechaactualizacion.toISOString(),
        prioridad: row.prioridad,
        etiquetas: row.etiquetas || [],
        comentarios,
        tiempoEstimado: row.tiempoestimado,
        tiempoTrabajado: row.tiempotrabajado || 0
      };
      return tarea;
    } catch (error) {
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const query = 'DELETE FROM tareas WHERE id = $1';
      
      const result = await this.pool.query(query, [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw error;
    }
  }

  async createComentario(tareaId: number, comentarioDto: any): Promise<any> {
    try {
      const fechaCreacion = new Date();
      const query = `
        INSERT INTO comentarios (tareaId, autor, contenido, fechaCreacion, tipo)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const result = await this.pool.query(
        query,
        [tareaId, comentarioDto.autor, comentarioDto.contenido, fechaCreacion, comentarioDto.tipo || 'comentario']
      );

      const row = result.rows[0];
      const newComentario = {
        id: row.id,
        tareaId: row.tareaid,
        autor: row.autor,
        contenido: row.contenido,
        fechaCreacion: row.fechacreacion.toISOString(),
        tipo: row.tipo
      };
      return newComentario;
    } catch (error) {
      throw error;
    }
  }

  async deleteComentario(id: number): Promise<boolean> {
    try {
      const query = 'DELETE FROM comentarios WHERE id = $1';
      
      const result = await this.pool.query(query, [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw error;
    }
  }

  close(): void {
    this.pool.end();
  }
}