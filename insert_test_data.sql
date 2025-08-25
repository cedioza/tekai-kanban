-- Script para insertar datos de prueba en la base de datos tekai
-- Ejecutar después de que las tablas estén creadas y migradas

-- Insertar tareas de prueba usando los responsables existentes
INSERT INTO tareas (
  titulo, descripcion, estado, responsable, fechaCreacion, fechaVencimiento, 
  prioridad, etiquetas, tiempoEstimado, tiempoTrabajado
) VALUES 
-- Tareas para Juan Henao
('Implementar autenticación de usuarios', 'Desarrollar sistema de login y registro con JWT', 'En progreso', 'Juan Henao', 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '7 days', 'Alta', '["Backend", "Security", "API"]', 16, 8),

('Optimizar consultas de base de datos', 'Revisar y optimizar las consultas SQL más lentas', 'Creada', 'Juan Henao', 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '5 days', 'Media', '["Database", "Performance"]', 12, 0),

('Documentar API endpoints', 'Crear documentación completa de todos los endpoints', 'Finalizada', 'Juan Henao', 
 CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '2 days', 'Baja', '["Documentación", "API"]', 8, 8),

-- Tareas para María García
('Diseñar interfaz de usuario principal', 'Crear mockups y prototipos de la interfaz principal', 'En progreso', 'María García', 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '10 days', 'Alta', '["Frontend", "UI/UX", "Feature"]', 20, 12),

('Implementar componentes reutilizables', 'Desarrollar librería de componentes React', 'Creada', 'María García', 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '14 days', 'Media', '["Frontend", "Feature"]', 24, 0),

('Corregir bug en formulario de contacto', 'El formulario no envía emails correctamente', 'Bloqueada', 'María García', 
 CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP + INTERVAL '2 days', 'Crítica', '["Frontend", "Bug"]', 4, 2),

-- Tareas para Carlos López
('Configurar pipeline CI/CD', 'Implementar integración y despliegue continuo', 'En progreso', 'Carlos López', 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '8 days', 'Alta', '["DevOps", "Feature"]', 16, 6),

('Migrar base de datos a PostgreSQL', 'Migrar desde SQLite a PostgreSQL en producción', 'Finalizada', 'Carlos López', 
 CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '5 days', 'Crítica', '["Database", "Migration"]', 12, 12),

('Implementar monitoreo de aplicación', 'Configurar logs y métricas de rendimiento', 'Creada', 'Carlos López', 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '12 days', 'Media', '["DevOps", "Monitoring"]', 10, 0),

-- Tareas para Ana Martínez
('Escribir tests unitarios para API', 'Aumentar cobertura de tests al 80%', 'En progreso', 'Ana Martínez', 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '9 days', 'Alta', '["Testing", "Backend"]', 18, 10),

('Realizar testing de integración', 'Probar integración entre frontend y backend', 'Creada', 'Ana Martínez', 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '6 days', 'Media', '["Testing", "Integration"]', 14, 0),

('Automatizar tests E2E', 'Implementar tests end-to-end con Cypress', 'Cancelada', 'Ana Martínez', 
 CURRENT_TIMESTAMP - INTERVAL '8 days', NULL, 'Baja', '["Testing", "Automation"]', 20, 4),

-- Tareas para Pedro Rodríguez
('Refactorizar módulo de reportes', 'Mejorar estructura y rendimiento del código', 'En progreso', 'Pedro Rodríguez', 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '11 days', 'Media', '["Refactoring", "Backend"]', 16, 8),

('Implementar cache Redis', 'Agregar caching para mejorar rendimiento', 'Creada', 'Pedro Rodríguez', 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '7 days', 'Alta', '["Performance", "Backend"]', 12, 0),

('Corregir memory leaks', 'Identificar y corregir fugas de memoria', 'Finalizada', 'Pedro Rodríguez', 
 CURRENT_TIMESTAMP - INTERVAL '12 days', CURRENT_TIMESTAMP - INTERVAL '3 days', 'Crítica', '["Bug", "Performance"]', 8, 8),

-- Tareas para Laura Sánchez
('Crear guía de usuario', 'Documentación completa para usuarios finales', 'En progreso', 'Laura Sánchez', 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '15 days', 'Media', '["Documentación", "UI/UX"]', 20, 5),

('Implementar sistema de notificaciones', 'Notificaciones push y por email', 'Creada', 'Laura Sánchez', 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '10 days', 'Alta', '["Feature", "Frontend"]', 18, 0),

('Optimizar SEO del sitio web', 'Mejorar posicionamiento en buscadores', 'Creada', 'Laura Sánchez', 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '20 days', 'Baja', '["SEO", "Frontend"]', 14, 0),

-- Tareas para Administrador
('Configurar backup automático', 'Implementar respaldos automáticos diarios', 'Finalizada', 'Administrador', 
 CURRENT_TIMESTAMP - INTERVAL '20 days', CURRENT_TIMESTAMP - INTERVAL '10 days', 'Crítica', '["DevOps", "Security"]', 6, 6),

('Revisar políticas de seguridad', 'Auditoría completa de seguridad del sistema', 'En progreso', 'Administrador', 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '5 days', 'Crítica', '["Security", "Audit"]', 10, 3);

-- Insertar algunos comentarios de ejemplo
INSERT INTO comentarios (tareaId, autor, contenido, fechaCreacion, tipo) VALUES 
(1, 'Juan Henao', 'He comenzado con la implementación del middleware de autenticación', CURRENT_TIMESTAMP - INTERVAL '2 days', 'actualizacion'),
(1, 'María García', '¿Necesitas ayuda con la interfaz de login?', CURRENT_TIMESTAMP - INTERVAL '1 day', 'comentario'),
(4, 'María García', 'Los mockups están listos para revisión', CURRENT_TIMESTAMP - INTERVAL '3 days', 'actualizacion'),
(7, 'Carlos López', 'Pipeline configurado en GitLab CI', CURRENT_TIMESTAMP - INTERVAL '1 day', 'actualizacion'),
(10, 'Ana Martínez', 'Cobertura actual: 65%, objetivo: 80%', CURRENT_TIMESTAMP - INTERVAL '2 days', 'actualizacion'),
(16, 'Laura Sánchez', 'Primer borrador de la guía completado', CURRENT_TIMESTAMP - INTERVAL '4 days', 'actualizacion');

-- Actualizar responsable_id basado en los nombres (esto se ejecutará automáticamente en la migración)
-- UPDATE tareas SET responsable_id = r.id FROM responsables r WHERE tareas.responsable = r.nombre;

COMMIT;