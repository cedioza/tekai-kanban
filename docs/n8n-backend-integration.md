# Integración n8n con Backend Tekai

## Configuración de Peticiones HTTP desde n8n

### URLs para Conexión al Backend

Cuando n8n está ejecutándose en contenedores Docker, debe usar las siguientes URLs para conectarse al backend:

#### Desde n8n Container al Backend Container:
```
http://backend:3000/api/tareas
http://backend:3000/api/responsables
```

#### Desde n8n Local al Backend Local:
```
http://localhost:3000/api/tareas
http://localhost:3000/api/responsables
```

### Configuración CORS

El backend ya está configurado para aceptar peticiones desde n8n con los siguientes orígenes permitidos:
- `http://localhost:5678` (n8n local)
- `http://n8n:5678` (n8n container)
- `http://tekai-n8n:5678` (n8n container name)

### Endpoints Disponibles

#### Tareas
- `GET /api/tareas` - Obtener todas las tareas
- `GET /api/tareas/:id` - Obtener tarea por ID
- `POST /api/tareas` - Crear nueva tarea
- `PUT /api/tareas/:id` - Actualizar tarea
- `DELETE /api/tareas/:id` - Eliminar tarea

#### Responsables
- `GET /api/responsables` - Obtener todos los responsables
- `GET /api/responsables/:id` - Obtener responsable por ID
- `POST /api/responsables` - Crear nuevo responsable
- `PUT /api/responsables/:id` - Actualizar responsable
- `DELETE /api/responsables/:id` - Eliminar responsable

### Configuración en n8n HTTP Request Node

1. **URL**: Usar `http://backend:3000` como base URL cuando esté en Docker
2. **Headers**: 
   ```json
   {
     "Content-Type": "application/json",
     "Accept": "application/json"
   }
   ```
3. **Authentication**: No requerida actualmente
4. **SSL/TLS**: Deshabilitado para desarrollo local

### Ejemplo de Workflow n8n

```json
{
  "name": "Crear Tarea",
  "nodes": [
    {
      "parameters": {
        "url": "http://backend:3000/api/tareas",
        "options": {
          "headers": {
            "Content-Type": "application/json"
          }
        },
        "bodyParametersUi": {
          "parameter": [
            {
              "name": "titulo",
              "value": "Nueva tarea desde n8n"
            },
            {
              "name": "descripcion",
              "value": "Descripción de la tarea"
            },
            {
              "name": "estado",
              "value": "pendiente"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [820, 240]
    }
  ]
}
```

### Troubleshooting

#### Error de Permisos
Si aparece un error de permisos, verificar:
1. Que el backend esté ejecutándose
2. Que la URL sea correcta (`http://backend:3000` en Docker)
3. Que los contenedores estén en la misma red (`tekai-network`)

#### Error de CORS
Si aparece error de CORS:
1. Verificar que el origen esté en la lista permitida
2. Reiniciar el contenedor del backend después de cambios

#### Error de Conexión
Si no puede conectarse:
1. Verificar que ambos contenedores estén ejecutándose
2. Usar `docker network ls` para verificar la red
3. Usar `docker exec -it tekai-n8n ping backend` para probar conectividad

### Comandos Útiles

```bash
# Verificar logs del backend
docker logs tekai-backend

# Verificar logs de n8n
docker logs tekai-n8n

# Probar conectividad desde n8n
docker exec -it tekai-n8n ping backend

# Reiniciar servicios
docker-compose restart backend n8n
```