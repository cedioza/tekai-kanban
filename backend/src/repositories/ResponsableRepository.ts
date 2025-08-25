import { Pool, PoolClient } from 'pg';
import { Responsable, CreateResponsableDto, UpdateResponsableDto, RESPONSABLES_DEFAULT } from '../models/Responsable';

export class ResponsableRepository {
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
    this.initializeTable();
  }

  private async initializeTable(): Promise<void> {
    try {
      const createResponsablesTableQuery = `
        CREATE TABLE IF NOT EXISTS responsables (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          activo BOOLEAN NOT NULL DEFAULT true,
          fechaCreacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          fechaActualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await this.pool.query(createResponsablesTableQuery);
      console.log('Responsables table initialized successfully');
      
      // Insertar responsables por defecto si la tabla está vacía
      await this.insertDefaultResponsables();
      
    } catch (err) {
      console.error('Error initializing responsables table:', err);
    }
  }

  private async insertDefaultResponsables(): Promise<void> {
    try {
      const countQuery = 'SELECT COUNT(*) FROM responsables';
      const countResult = await this.pool.query(countQuery);
      const count = parseInt(countResult.rows[0].count);

      if (count === 0) {
        console.log('Inserting default responsables...');
        
        for (const responsable of RESPONSABLES_DEFAULT) {
          const insertQuery = `
            INSERT INTO responsables (nombre, email, activo, fechaCreacion)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            ON CONFLICT (nombre) DO NOTHING
          `;
          
          await this.pool.query(insertQuery, [
            responsable.nombre,
            responsable.email,
            true
          ]);
        }
        
        console.log('Default responsables inserted successfully');
      }
    } catch (err) {
      console.error('Error inserting default responsables:', err);
    }
  }

  async getAllResponsables(): Promise<Responsable[]> {
    try {
      const query = `
        SELECT id, nombre, email, activo, 
               fechaCreacion, fechaActualizacion
        FROM responsables 
        ORDER BY nombre ASC
      `;
      
      const result = await this.pool.query(query);
      return result.rows.map(row => ({
        id: row.id,
        nombre: row.nombre,
        email: row.email,
        activo: row.activo,
        fechaCreacion: row.fechacreacion,
        fechaActualizacion: row.fechaactualizacion
      }));
    } catch (err) {
      console.error('Error getting all responsables:', err);
      throw err;
    }
  }

  async getResponsableById(id: number): Promise<Responsable | null> {
    try {
      const query = `
        SELECT id, nombre, email, activo, 
               fechaCreacion, fechaActualizacion
        FROM responsables 
        WHERE id = $1
      `;
      
      const result = await this.pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        id: row.id,
        nombre: row.nombre,
        email: row.email,
        activo: row.activo,
        fechaCreacion: row.fechacreacion,
        fechaActualizacion: row.fechaactualizacion
      };
    } catch (err) {
      console.error('Error getting responsable by id:', err);
      throw err;
    }
  }

  async getResponsableByNombre(nombre: string): Promise<Responsable | null> {
    try {
      const query = `
        SELECT id, nombre, email, activo, 
               fechaCreacion, fechaActualizacion
        FROM responsables 
        WHERE nombre = $1
      `;
      
      const result = await this.pool.query(query, [nombre]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        id: row.id,
        nombre: row.nombre,
        email: row.email,
        activo: row.activo,
        fechaCreacion: row.fechacreacion,
        fechaActualizacion: row.fechaactualizacion
      };
    } catch (err) {
      console.error('Error getting responsable by nombre:', err);
      throw err;
    }
  }

  async createResponsable(responsableData: CreateResponsableDto): Promise<Responsable> {
    try {
      const query = `
        INSERT INTO responsables (nombre, email, activo, fechaCreacion)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        RETURNING id, nombre, email, activo, fechaCreacion, fechaActualizacion
      `;
      
      const result = await this.pool.query(query, [
        responsableData.nombre,
        responsableData.email,
        responsableData.activo ?? true
      ]);
      
      const row = result.rows[0];
      return {
        id: row.id,
        nombre: row.nombre,
        email: row.email,
        activo: row.activo,
        fechaCreacion: row.fechacreacion,
        fechaActualizacion: row.fechaactualizacion
      };
    } catch (err) {
      console.error('Error creating responsable:', err);
      throw err;
    }
  }

  async updateResponsable(id: number, updates: UpdateResponsableDto): Promise<Responsable | null> {
    try {
      const setClause = [];
      const values = [];
      let paramIndex = 1;

      if (updates.nombre !== undefined) {
        setClause.push(`nombre = $${paramIndex}`);
        values.push(updates.nombre);
        paramIndex++;
      }

      if (updates.email !== undefined) {
        setClause.push(`email = $${paramIndex}`);
        values.push(updates.email);
        paramIndex++;
      }

      if (updates.activo !== undefined) {
        setClause.push(`activo = $${paramIndex}`);
        values.push(updates.activo);
        paramIndex++;
      }

      if (setClause.length === 0) {
        throw new Error('No fields to update');
      }

      setClause.push(`fechaActualizacion = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `
        UPDATE responsables 
        SET ${setClause.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, nombre, email, activo, fechaCreacion, fechaActualizacion
      `;

      const result = await this.pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        id: row.id,
        nombre: row.nombre,
        email: row.email,
        activo: row.activo,
        fechaCreacion: row.fechacreacion,
        fechaActualizacion: row.fechaactualizacion
      };
    } catch (err) {
      console.error('Error updating responsable:', err);
      throw err;
    }
  }

  async deleteResponsable(id: number): Promise<boolean> {
    try {
      // Verificar si el responsable tiene tareas asignadas
      const checkQuery = 'SELECT COUNT(*) FROM tareas WHERE responsable = (SELECT nombre FROM responsables WHERE id = $1)';
      const checkResult = await this.pool.query(checkQuery, [id]);
      const taskCount = parseInt(checkResult.rows[0].count);

      if (taskCount > 0) {
        throw new Error(`No se puede eliminar el responsable porque tiene ${taskCount} tareas asignadas`);
      }

      const query = 'DELETE FROM responsables WHERE id = $1';
      const result = await this.pool.query(query, [id]);
      
      return (result.rowCount ?? 0) > 0;
    } catch (err) {
      console.error('Error deleting responsable:', err);
      throw err;
    }
  }

  async getResponsablesActivos(): Promise<Responsable[]> {
    try {
      const query = `
        SELECT id, nombre, email, activo, 
               fechaCreacion, fechaActualizacion
        FROM responsables 
        WHERE activo = true
        ORDER BY nombre ASC
      `;
      
      const result = await this.pool.query(query);
      return result.rows.map(row => ({
        id: row.id,
        nombre: row.nombre,
        email: row.email,
        activo: row.activo,
        fechaCreacion: row.fechacreacion,
        fechaActualizacion: row.fechaactualizacion
      }));
    } catch (err) {
      console.error('Error getting active responsables:', err);
      throw err;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}